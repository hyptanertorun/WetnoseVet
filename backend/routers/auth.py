from fastapi import APIRouter, HTTPException, status, Request, Response, Depends
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import Optional

from schemas.auth import (
    LoginRequest, LoginResponse,
    RegisterRequest,
    TokenRefreshRequest, TokenRefreshResponse
)
from services.auth_service import AuthService
from services.user_service import UserService
from services.audit_service import AuditService
from middleware.auth import get_current_active_user, get_current_user
from middleware.rbac import require_admin
from middleware.rate_limit import rate_limit_login, rate_limit_refresh
from models.user import User, UserRole
from models.audit import AuditAction
from config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

@router.post("/login", response_model=LoginResponse)
async def login(request: Request, response: Response, login_data: LoginRequest):
    """Login with email and password"""
    # Apply rate limiting
    await rate_limit_login(request, login_data.email)
    
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    # Authenticate user
    user = await AuthService.authenticate_user(login_data.email, login_data.password)
    
    if not user:
        # Log failed login attempt
        await AuditService.log(
            entity_type="auth",
            action=AuditAction.LOGIN_FAILED,
            metadata={"email": login_data.email},
            ip_address=ip_address,
            user_agent=user_agent,
            success=False,
            error_message="Invalid credentials"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-posta veya şifre hatalı"
        )
    
    # Determine token expiry based on "remember_me"
    remember_me = login_data.remember_me
    refresh_days = settings.REFRESH_TOKEN_EXPIRE_DAYS_REMEMBER if remember_me else settings.REFRESH_TOKEN_EXPIRE_DAYS
    
    # Create tokens
    access_token = AuthService.create_access_token(user.id, user.email, user.role.value)
    refresh_token, refresh_expires = AuthService.create_refresh_token(user.id, days=refresh_days)
    
    # Store refresh token
    await AuthService.store_refresh_token(user.id, refresh_token, refresh_expires)
    
    # Update last login
    await AuthService.update_last_login(user.id)
    
    # Log successful login
    await AuditService.log(
        entity_type="auth",
        action=AuditAction.LOGIN,
        actor_user_id=user.id,
        actor_email=user.email,
        actor_role=user.role.value,
        ip_address=ip_address,
        user_agent=user_agent,
        metadata={"remember_me": remember_me}
    )
    
    # Set httpOnly cookie for refresh token
    # Cookie settings from env for preview/production compatibility
    cookie_kwargs = {
        "key": "refresh_token",
        "value": refresh_token,
        "httponly": True,
        "secure": settings.COOKIE_SECURE,
        "samesite": settings.COOKIE_SAMESITE,
        "max_age": refresh_days * 24 * 60 * 60
    }
    
    # Only set domain if explicitly configured
    if settings.COOKIE_DOMAIN:
        cookie_kwargs["domain"] = settings.COOKIE_DOMAIN
    
    response.set_cookie(**cookie_kwargs)
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "avatar_url": user.avatar_url,
            "must_change_password": getattr(user, 'must_change_password', False)
        }
    )

@router.post("/register", response_model=dict)
async def register(
    request: Request,
    register_data: RegisterRequest,
    current_user: User = Depends(require_admin)
):
    """Register a new user (Admin only)"""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    # Create user
    new_user = await UserService.create_user(
        email=register_data.email,
        password=register_data.password,
        full_name=register_data.full_name,
        role=register_data.role,
        phone=register_data.phone,
        created_by=current_user.id
    )
    
    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu e-posta adresi zaten kullanılıyor"
        )
    
    # Log user creation
    await AuditService.log(
        entity_type="user",
        entity_id=new_user.id,
        action=AuditAction.CREATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        after_state={
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role.value
        },
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    return {
        "message": "Kullanıcı başarıyla oluşturuldu",
        "user_id": new_user.id
    }

@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_token(request: Request, response: Response, token_data: Optional[TokenRefreshRequest] = None):
    """Refresh access token"""
    # Apply rate limiting
    await rate_limit_refresh(request)
    
    # Get refresh token from body or cookie
    refresh_token = None
    if token_data and token_data.refresh_token:
        refresh_token = token_data.refresh_token
    else:
        refresh_token = request.cookies.get("refresh_token")
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token gerekli"
        )
    
    # Validate refresh token
    user_id = await AuthService.validate_refresh_token(refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz veya süresi dolmuş refresh token"
        )
    
    # Get user
    user = await UserService.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı bulunamadı"
        )
    
    # Revoke old refresh token
    await AuthService.revoke_refresh_token(refresh_token)
    
    # Create new tokens
    new_access_token = AuthService.create_access_token(user.id, user.email, user.role.value)
    new_refresh_token, refresh_expires = AuthService.create_refresh_token(user.id)
    
    # Store new refresh token
    await AuthService.store_refresh_token(user.id, new_refresh_token, refresh_expires)
    
    # Log token refresh
    ip_address = request.client.host if request.client else None
    await AuditService.log(
        entity_type="auth",
        action=AuditAction.TOKEN_REFRESH,
        actor_user_id=user.id,
        actor_email=user.email,
        actor_role=user.role.value,
        ip_address=ip_address
    )
    
    # Update cookie
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    
    return TokenRefreshResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token
    )

@router.post("/logout")
async def logout(request: Request, response: Response, current_user: User = Depends(get_current_active_user)):
    """Logout user and revoke tokens"""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    # Revoke refresh token from cookie if exists
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        await AuthService.revoke_refresh_token(refresh_token)
    
    # Log logout
    await AuditService.log(
        entity_type="auth",
        action=AuditAction.LOGOUT,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    # Clear cookie
    response.delete_cookie(key="refresh_token")
    
    return {"message": "Çıkış başarılı"}

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role.value,
        "status": current_user.status.value,
        "phone": current_user.phone,
        "avatar_url": current_user.avatar_url,
        "last_login": current_user.last_login.isoformat() if current_user.last_login else None,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "must_change_password": getattr(current_user, 'must_change_password', False)
    }


# --- Password Change ---

from pydantic import BaseModel, Field, field_validator
import re

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=10)
    
    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v):
        """Validate password strength: min 10 chars, 1 upper, 1 lower, 1 number, 1 symbol"""
        if len(v) < 10:
            raise ValueError('Şifre en az 10 karakter olmalı')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Şifre en az bir büyük harf içermeli')
        if not re.search(r'[a-z]', v):
            raise ValueError('Şifre en az bir küçük harf içermeli')
        if not re.search(r'[0-9]', v):
            raise ValueError('Şifre en az bir rakam içermeli')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Şifre en az bir özel karakter içermeli (!@#$%^&*(),.?":{}|<>)')
        return v


@router.post("/change-password")
async def change_password(
    request: Request,
    data: PasswordChangeRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Change user's password. Required after force password reset."""
    ip_address = request.client.host if request.client else None
    
    # Verify current password
    user = await AuthService.authenticate_user(current_user.email, data.current_password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mevcut şifre hatalı"
        )
    
    # Update password
    success = await UserService.update_password(current_user.id, data.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Şifre güncellenirken hata oluştu"
        )
    
    # Clear must_change_password flag
    await UserService.update_user(
        current_user.id,
        must_change_password=False
    )
    
    # Log password change
    await AuditService.log(
        entity_type="auth",
        action=AuditAction.PASSWORD_CHANGE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        ip_address=ip_address,
        metadata={"forced": getattr(current_user, 'must_change_password', False)}
    )
    
    return {"message": "Şifre başarıyla değiştirildi"}


@router.post("/force-password-reset/{user_id}")
async def force_password_reset(
    user_id: str,
    request: Request,
    current_user: User = Depends(require_admin)
):
    """Force a user to change their password on next login (Admin only)"""
    ip_address = request.client.host if request.client else None
    
    target_user = await UserService.get_user_by_id(user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı"
        )
    
    # Set must_change_password flag
    await UserService.update_user(user_id, must_change_password=True)
    
    # Log action
    await AuditService.log(
        entity_type="user",
        entity_id=user_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        ip_address=ip_address,
        metadata={"action": "force_password_reset", "target_email": target_user.email}
    )
    
    return {"message": f"{target_user.email} bir sonraki girişte şifre değiştirmek zorunda kalacak"}
