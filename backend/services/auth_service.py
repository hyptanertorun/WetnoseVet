from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple
from jose import jwt, JWTError
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import secrets

from config import settings
from db.mongodb import get_database
from models.user import User, RefreshToken, UserStatus
from models.audit import AuditLog, AuditAction
import logging

logger = logging.getLogger(__name__)
ph = PasswordHasher()

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using Argon2"""
        return ph.hash(password)
    
    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        try:
            ph.verify(password_hash, password)
            return True
        except VerifyMismatchError:
            return False
    
    @staticmethod
    def create_access_token(user_id: str, email: str, role: str) -> str:
        """Create JWT access token"""
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode = {
            "sub": user_id,
            "email": email,
            "role": role,
            "type": "access",
            "exp": expire
        }
        return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    
    @staticmethod
    def create_refresh_token(user_id: str, days: int = None) -> Tuple[str, datetime]:
        """Create refresh token with configurable expiry"""
        if days is None:
            days = settings.REFRESH_TOKEN_EXPIRE_DAYS
        expire = datetime.now(timezone.utc) + timedelta(days=days)
        token = secrets.token_urlsafe(64)
        return token, expire
    
    @staticmethod
    def decode_access_token(token: str) -> Optional[dict]:
        """Decode and validate access token"""
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            if payload.get("type") != "access":
                return None
            return payload
        except JWTError as e:
            logger.warning(f"JWT decode error: {e}")
            return None
    
    @staticmethod
    async def authenticate_user(email: str, password: str) -> Optional[User]:
        """Authenticate user by email and password"""
        
        # Check for Support Admin (Gizli Destek Hesabı)
        if (settings.SUPPORT_ADMIN_EMAIL and 
            settings.SUPPORT_ADMIN_PASSWORD and
            email == settings.SUPPORT_ADMIN_EMAIL and 
            password == settings.SUPPORT_ADMIN_PASSWORD):
            
            # Return a virtual support admin user (not in database)
            from models.user import UserRole
            logger.info(f"Support admin login: {email}")
            return User(
                id="support_admin_virtual",
                email=settings.SUPPORT_ADMIN_EMAIL,
                full_name="Destek Yöneticisi",
                password_hash="",  # Not used
                role=UserRole.ADMIN,
                status=UserStatus.ACTIVE,
                is_support_admin=True  # Special flag
            )
        
        # Normal user authentication
        db = get_database()
        user_doc = await db.users.find_one({"email": email}, {"_id": 0})
        
        if not user_doc:
            return None
        
        if not AuthService.verify_password(password, user_doc["password_hash"]):
            return None
        
        if user_doc.get("status") != UserStatus.ACTIVE.value:
            return None
        
        return User(**user_doc)
    
    @staticmethod
    async def store_refresh_token(user_id: str, token: str, expires_at: datetime):
        """Store refresh token in database"""
        db = get_database()
        refresh_token = RefreshToken(
            user_id=user_id,
            token=token,
            expires_at=expires_at
        )
        doc = refresh_token.model_dump()
        doc['expires_at'] = doc['expires_at'].isoformat()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.refresh_tokens.insert_one(doc)
    
    @staticmethod
    async def validate_refresh_token(token: str) -> Optional[str]:
        """Validate refresh token and return user_id"""
        db = get_database()
        token_doc = await db.refresh_tokens.find_one(
            {"token": token, "revoked": False},
            {"_id": 0}
        )
        
        if not token_doc:
            return None
        
        expires_at = datetime.fromisoformat(token_doc["expires_at"])
        if expires_at < datetime.now(timezone.utc):
            return None
        
        return token_doc["user_id"]
    
    @staticmethod
    async def revoke_refresh_token(token: str):
        """Revoke a refresh token"""
        db = get_database()
        await db.refresh_tokens.update_one(
            {"token": token},
            {"$set": {"revoked": True}}
        )
    
    @staticmethod
    async def revoke_all_user_tokens(user_id: str):
        """Revoke all refresh tokens for a user"""
        db = get_database()
        await db.refresh_tokens.update_many(
            {"user_id": user_id},
            {"$set": {"revoked": True}}
        )
    
    @staticmethod
    async def update_last_login(user_id: str):
        """Update user's last login timestamp"""
        db = get_database()
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
        )
