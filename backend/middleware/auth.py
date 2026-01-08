from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from services.auth_service import AuthService
from services.user_service import UserService
from models.user import User, UserStatus, UserRole
from config import settings
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[User]:
    """Get current user from JWT token"""
    token = None
    
    # Try to get token from Authorization header
    if credentials:
        token = credentials.credentials
    
    # If no Authorization header, try cookie
    if not token:
        token = request.cookies.get("access_token")
    
    if not token:
        return None
    
    # Decode token
    payload = AuthService.decode_access_token(token)
    if not payload:
        return None
    
    user_id = payload.get("sub")
    if not user_id:
        return None
    
    # Check if this is a support admin (virtual user, not in database)
    if user_id == "support_admin_virtual":
        return User(
            id="support_admin_virtual",
            email=settings.SUPPORT_ADMIN_EMAIL,
            full_name="Destek Yöneticisi",
            password_hash="",
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE,
            is_support_admin=True
        )
    
    # Get user from database
    user = await UserService.get_user_by_id(user_id)
    return user

async def get_current_active_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> User:
    """Get current active user, raise 401 if not authenticated"""
    user = await get_current_user(request, credentials)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Giriş yapmalısınız",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hesabınız devre dışı bırakılmış"
        )
    
    return user
