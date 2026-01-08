from fastapi import APIRouter, HTTPException, status, Request, Depends, Query
from typing import Optional

from schemas.user import UserCreate, UserUpdate, UserResponse, UserListResponse
from schemas.auth import PasswordResetRequest
from services.user_service import UserService
from services.audit_service import AuditService
from middleware.auth import get_current_active_user
from middleware.rbac import require_admin, require_admin_or_manager
from models.user import User, UserRole, UserStatus
from models.audit import AuditAction
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/users", tags=["Users Management"])

@router.get("", response_model=UserListResponse)
async def get_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[UserRole] = None,
    status: Optional[UserStatus] = None,
    current_user: User = Depends(require_admin_or_manager)
):
    """Get list of users (Admin/Manager only)"""
    users, total = await UserService.get_users(page, page_size, role, status)
    
    return UserListResponse(
        users=[
            UserResponse(
                id=u.id,
                email=u.email,
                full_name=u.full_name,
                role=u.role,
                status=u.status,
                phone=u.phone,
                avatar_url=u.avatar_url,
                last_login=u.last_login,
                created_at=u.created_at,
                updated_at=u.updated_at
            ) for u in users
        ],
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(require_admin_or_manager)
):
    """Get user by ID (Admin/Manager only)"""
    user = await UserService.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı"
        )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        status=user.status,
        phone=user.phone,
        avatar_url=user.avatar_url,
        last_login=user.last_login,
        created_at=user.created_at,
        updated_at=user.updated_at
    )

@router.post("", response_model=dict)
async def create_user(
    request: Request,
    user_data: UserCreate,
    current_user: User = Depends(require_admin)
):
    """Create a new user (Admin only)"""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    new_user = await UserService.create_user(
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
        role=user_data.role,
        phone=user_data.phone,
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

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    request: Request,
    user_data: UserUpdate,
    current_user: User = Depends(require_admin)
):
    """Update user (Admin only)"""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    # Get before state
    before_user = await UserService.get_user_by_id(user_id)
    if not before_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı"
        )
    
    # Update user
    updated_user = await UserService.update_user(
        user_id=user_id,
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role,
        status=user_data.status,
        phone=user_data.phone,
        avatar_url=user_data.avatar_url
    )
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Güncelleme başarısız. E-posta zaten kullanılıyor olabilir."
        )
    
    # Determine action type
    action = AuditAction.UPDATE
    if user_data.role and user_data.role != before_user.role:
        action = AuditAction.ROLE_CHANGE
    elif user_data.status == UserStatus.INACTIVE and before_user.status == UserStatus.ACTIVE:
        action = AuditAction.DEACTIVATE
    elif user_data.status == UserStatus.ACTIVE and before_user.status == UserStatus.INACTIVE:
        action = AuditAction.ACTIVATE
    
    # Log update
    await AuditService.log(
        entity_type="user",
        entity_id=user_id,
        action=action,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={
            "email": before_user.email,
            "full_name": before_user.full_name,
            "role": before_user.role.value,
            "status": before_user.status.value
        },
        after_state={
            "email": updated_user.email,
            "full_name": updated_user.full_name,
            "role": updated_user.role.value,
            "status": updated_user.status.value
        },
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    return UserResponse(
        id=updated_user.id,
        email=updated_user.email,
        full_name=updated_user.full_name,
        role=updated_user.role,
        status=updated_user.status,
        phone=updated_user.phone,
        avatar_url=updated_user.avatar_url,
        last_login=updated_user.last_login,
        created_at=updated_user.created_at,
        updated_at=updated_user.updated_at
    )

@router.post("/{user_id}/reset-password")
async def reset_user_password(
    user_id: str,
    request: Request,
    password_data: PasswordResetRequest,
    current_user: User = Depends(require_admin)
):
    """Reset user password (Admin only)"""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    # Check user exists
    user = await UserService.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı"
        )
    
    # Reset password
    success = await UserService.reset_password(user_id, password_data.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Şifre sıfırlama başarısız"
        )
    
    # Log password reset
    await AuditService.log(
        entity_type="user",
        entity_id=user_id,
        action=AuditAction.PASSWORD_RESET,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        metadata={"target_email": user.email},
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    return {"message": "Şifre başarıyla sıfırlandı"}

@router.post("/{user_id}/deactivate")
async def deactivate_user(
    user_id: str,
    request: Request,
    current_user: User = Depends(require_admin)
):
    """Deactivate user (Admin only)"""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    # Prevent self-deactivation
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kendi hesabınızı devre dışı bırakamazsınız"
        )
    
    # Check user exists
    user = await UserService.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı"
        )
    
    # Deactivate
    success = await UserService.deactivate_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Devre dışı bırakma başarısız"
        )
    
    # Log deactivation
    await AuditService.log(
        entity_type="user",
        entity_id=user_id,
        action=AuditAction.DEACTIVATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        metadata={"target_email": user.email},
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    return {"message": "Kullanıcı devre dışı bırakıldı"}

@router.post("/{user_id}/activate")
async def activate_user(
    user_id: str,
    request: Request,
    current_user: User = Depends(require_admin)
):
    """Activate user (Admin only)"""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    # Check user exists
    user = await UserService.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı"
        )
    
    # Activate
    success = await UserService.activate_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Aktivasyon başarısız"
        )
    
    # Log activation
    await AuditService.log(
        entity_type="user",
        entity_id=user_id,
        action=AuditAction.ACTIVATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        metadata={"target_email": user.email},
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    return {"message": "Kullanıcı aktifleştirildi"}
