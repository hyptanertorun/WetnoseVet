from typing import Optional, List, Tuple
from datetime import datetime, timezone
from uuid import uuid4

from db.mongodb import get_database
from models.user import User, UserRole, UserStatus
from services.auth_service import AuthService
from config import settings
import logging

logger = logging.getLogger(__name__)

class UserService:
    @staticmethod
    async def ensure_stage_admin():
        """
        Ensure stage admin exists in preview environment.
        Called on startup when APP_ENV=preview and STAGE_ADMIN_SYNC=true.
        """
        if not settings.is_preview:
            logger.info("Skipping stage admin sync (not in preview environment)")
            return
        
        if not settings.STAGE_ADMIN_SYNC:
            logger.info("Skipping stage admin sync (STAGE_ADMIN_SYNC=false)")
            return
        
        if not settings.STAGE_ADMIN_PASSWORD:
            logger.warning("STAGE_ADMIN_PASSWORD not set - stage admin will not be synced")
            return
        
        db = get_database()
        email = settings.STAGE_ADMIN_EMAIL
        
        # Check if admin exists
        existing = await db.users.find_one({"email": email}, {"_id": 0})
        
        if existing:
            # Update password and ensure active status
            await db.users.update_one(
                {"email": email},
                {"$set": {
                    "password_hash": AuthService.hash_password(settings.STAGE_ADMIN_PASSWORD),
                    "status": UserStatus.ACTIVE.value,
                    "role": UserRole.ADMIN.value,
                    "must_change_password": False,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            logger.info(f"Stage admin synced: {email}")
        else:
            # Create new admin user
            user_id = str(uuid4())
            now = datetime.now(timezone.utc).isoformat()
            
            user_doc = {
                "id": user_id,
                "email": email,
                "password_hash": AuthService.hash_password(settings.STAGE_ADMIN_PASSWORD),
                "full_name": "Admin WETNOSE",
                "role": UserRole.ADMIN.value,
                "status": UserStatus.ACTIVE.value,
                "must_change_password": False,
                "phone": None,
                "avatar_url": None,
                "created_by": None,
                "created_at": now,
                "updated_at": now,
                "last_login": None
            }
            
            await db.users.insert_one(user_doc)
            logger.info(f"Stage admin created: {email}")
    
    @staticmethod
    async def ensure_production_admin():
        """
        Ensure initial admin exists in production environment.
        Only creates if admin doesn't exist and credentials are provided.
        Sets must_change_password=true for security.
        """
        if not settings.is_production:
            return
        
        if not settings.INITIAL_ADMIN_EMAIL or not settings.INITIAL_ADMIN_PASSWORD:
            logger.info("Production admin credentials not provided - skipping initial admin setup")
            return
        
        db = get_database()
        email = settings.INITIAL_ADMIN_EMAIL
        
        # Only create if no admin exists with this email
        existing = await db.users.find_one({"email": email}, {"_id": 0})
        
        if existing:
            logger.info(f"Production admin already exists: {email}")
            return
        
        # Create admin with must_change_password=true
        user_id = str(uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        user_doc = {
            "id": user_id,
            "email": email,
            "password_hash": AuthService.hash_password(settings.INITIAL_ADMIN_PASSWORD),
            "full_name": "Admin",
            "role": UserRole.ADMIN.value,
            "status": UserStatus.ACTIVE.value,
            "must_change_password": True,  # Force password change on first login
            "phone": None,
            "avatar_url": None,
            "created_by": None,
            "created_at": now,
            "updated_at": now,
            "last_login": None
        }
        
        await db.users.insert_one(user_doc)
        logger.info(f"Production admin created: {email} (must change password on first login)")

    @staticmethod
    async def create_user(
        email: str,
        password: str,
        full_name: str,
        role: UserRole = UserRole.EDITOR,
        phone: Optional[str] = None,
        created_by: Optional[str] = None
    ) -> Optional[User]:
        """Create a new user"""
        db = get_database()
        
        # Check if email already exists
        existing = await db.users.find_one({"email": email})
        if existing:
            return None
        
        # Create user
        user = User(
            email=email,
            password_hash=AuthService.hash_password(password),
            full_name=full_name,
            role=role,
            phone=phone,
            created_by=created_by
        )
        
        doc = user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        if doc.get('last_login'):
            doc['last_login'] = doc['last_login'].isoformat()
        
        await db.users.insert_one(doc)
        return user
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[User]:
        """Get user by ID"""
        db = get_database()
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user_doc:
            return None
        
        # Parse datetime fields
        for field in ['created_at', 'updated_at', 'last_login']:
            if user_doc.get(field) and isinstance(user_doc[field], str):
                user_doc[field] = datetime.fromisoformat(user_doc[field])
        
        return User(**user_doc)
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """Get user by email"""
        db = get_database()
        user_doc = await db.users.find_one({"email": email}, {"_id": 0})
        if not user_doc:
            return None
        
        # Parse datetime fields
        for field in ['created_at', 'updated_at', 'last_login']:
            if user_doc.get(field) and isinstance(user_doc[field], str):
                user_doc[field] = datetime.fromisoformat(user_doc[field])
        
        return User(**user_doc)
    
    @staticmethod
    async def get_users(
        page: int = 1,
        page_size: int = 20,
        role: Optional[UserRole] = None,
        status: Optional[UserStatus] = None
    ) -> Tuple[List[User], int]:
        """Get paginated list of users"""
        db = get_database()
        
        # Build query
        query = {}
        if role:
            query["role"] = role.value
        if status:
            query["status"] = status.value
        
        # Get total count
        total = await db.users.count_documents(query)
        
        # Get users with pagination
        skip = (page - 1) * page_size
        cursor = db.users.find(query, {"_id": 0}).skip(skip).limit(page_size).sort("created_at", -1)
        users_docs = await cursor.to_list(page_size)
        
        users = []
        for doc in users_docs:
            for field in ['created_at', 'updated_at', 'last_login']:
                if doc.get(field) and isinstance(doc[field], str):
                    doc[field] = datetime.fromisoformat(doc[field])
            users.append(User(**doc))
        
        return users, total
    
    @staticmethod
    async def update_user(
        user_id: str,
        email: Optional[str] = None,
        full_name: Optional[str] = None,
        role: Optional[UserRole] = None,
        status: Optional[UserStatus] = None,
        phone: Optional[str] = None,
        avatar_url: Optional[str] = None,
        must_change_password: Optional[bool] = None
    ) -> Optional[User]:
        """Update user fields"""
        db = get_database()
        
        update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
        if email is not None:
            # Check if email is taken by another user
            existing = await db.users.find_one({"email": email, "id": {"$ne": user_id}})
            if existing:
                return None
            update_data["email"] = email
        if full_name is not None:
            update_data["full_name"] = full_name
        if role is not None:
            update_data["role"] = role.value
        if status is not None:
            update_data["status"] = status.value
        if phone is not None:
            update_data["phone"] = phone
        if avatar_url is not None:
            update_data["avatar_url"] = avatar_url
        if must_change_password is not None:
            update_data["must_change_password"] = must_change_password
        
        result = await db.users.update_one(
            {"id": user_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return None
        
        return await UserService.get_user_by_id(user_id)
    
    @staticmethod
    async def reset_password(user_id: str, new_password: str) -> bool:
        """Reset user password"""
        db = get_database()
        
        result = await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "password_hash": AuthService.hash_password(new_password),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return result.modified_count > 0
    
    @staticmethod
    async def update_password(user_id: str, new_password: str) -> bool:
        """Update user password (alias for reset_password)"""
        return await UserService.reset_password(user_id, new_password)
    
    @staticmethod
    async def deactivate_user(user_id: str) -> bool:
        """Deactivate user"""
        db = get_database()
        
        result = await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "status": UserStatus.INACTIVE.value,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Revoke all refresh tokens
        await AuthService.revoke_all_user_tokens(user_id)
        
        return result.modified_count > 0
    
    @staticmethod
    async def activate_user(user_id: str) -> bool:
        """Activate user"""
        db = get_database()
        
        result = await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "status": UserStatus.ACTIVE.value,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return result.modified_count > 0
