"""Role permissions management router"""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Dict

from models.role_permissions import (
    RolePermissionsService, 
    ALL_PERMISSIONS, 
    DEFAULT_ROLE_PERMISSIONS
)
from middleware.auth import get_current_active_user
from middleware.rbac import require_admin
from services.audit_service import AuditService
from models.user import User
from models.audit import AuditAction
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/roles", tags=["Role Permissions"])


class PermissionInfo(BaseModel):
    key: str
    label: str
    description: str


class RolePermissionsResponse(BaseModel):
    role: str
    role_label: str
    permissions: List[str]
    is_default: bool = False


class UpdateRolePermissionsRequest(BaseModel):
    permissions: List[str]


ROLE_LABELS = {
    "admin": "Yönetici (Admin)",
    "manager": "Müdür",
    "reception": "Resepsiyon",
    "editor": "Editör"
}


@router.get("/permissions/available")
async def get_available_permissions(
    current_user: User = Depends(require_admin)
) -> Dict:
    """Get all available permissions with labels"""
    return {
        "permissions": [
            {
                "key": key,
                "label": info["label"],
                "description": info["description"]
            }
            for key, info in ALL_PERMISSIONS.items()
        ]
    }


@router.get("/permissions")
async def get_all_roles_permissions(
    current_user: User = Depends(require_admin)
) -> Dict:
    """Get permissions for all roles"""
    all_perms = await RolePermissionsService.get_all_role_permissions()
    
    result = []
    for role, permissions in all_perms.items():
        is_default = permissions == DEFAULT_ROLE_PERMISSIONS.get(role, [])
        result.append({
            "role": role,
            "role_label": ROLE_LABELS.get(role, role),
            "permissions": permissions,
            "is_default": is_default
        })
    
    return {
        "roles": result,
        "available_permissions": [
            {
                "key": key,
                "label": info["label"],
                "description": info["description"]
            }
            for key, info in ALL_PERMISSIONS.items()
        ]
    }


@router.get("/permissions/{role}")
async def get_role_permissions(
    role: str,
    current_user: User = Depends(require_admin)
) -> RolePermissionsResponse:
    """Get permissions for a specific role"""
    if role not in ROLE_LABELS:
        raise HTTPException(status_code=404, detail="Rol bulunamadı")
    
    permissions = await RolePermissionsService.get_role_permissions(role)
    is_default = permissions == DEFAULT_ROLE_PERMISSIONS.get(role, [])
    
    return RolePermissionsResponse(
        role=role,
        role_label=ROLE_LABELS[role],
        permissions=permissions,
        is_default=is_default
    )


@router.put("/permissions/{role}")
async def update_role_permissions(
    role: str,
    request: Request,
    data: UpdateRolePermissionsRequest,
    current_user: User = Depends(require_admin)
) -> Dict:
    """Update permissions for a role (Admin only)"""
    if role not in ROLE_LABELS:
        raise HTTPException(status_code=404, detail="Rol bulunamadı")
    
    if role == "admin":
        raise HTTPException(
            status_code=400, 
            detail="Admin rolünün yetkileri değiştirilemez"
        )
    
    ip_address = request.client.host if request.client else None
    
    # Get before state
    before_permissions = await RolePermissionsService.get_role_permissions(role)
    
    # Update permissions
    await RolePermissionsService.update_role_permissions(
        role=role,
        permissions=data.permissions,
        updated_by=current_user.id
    )
    
    # Get after state
    after_permissions = await RolePermissionsService.get_role_permissions(role)
    
    # Log the change
    await AuditService.log(
        entity_type="role_permissions",
        entity_id=role,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"permissions": before_permissions},
        after_state={"permissions": after_permissions},
        ip_address=ip_address
    )
    
    return {
        "message": f"{ROLE_LABELS[role]} rolünün yetkileri güncellendi",
        "role": role,
        "permissions": after_permissions
    }


@router.post("/permissions/reset")
async def reset_permissions_to_defaults(
    request: Request,
    current_user: User = Depends(require_admin)
) -> Dict:
    """Reset all role permissions to defaults (Admin only)"""
    ip_address = request.client.host if request.client else None
    
    await RolePermissionsService.reset_to_defaults()
    
    # Log the reset
    await AuditService.log(
        entity_type="role_permissions",
        entity_id="all",
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        metadata={"action": "reset_to_defaults"},
        ip_address=ip_address
    )
    
    return {
        "message": "Tüm rol yetkileri varsayılana sıfırlandı",
        "defaults": DEFAULT_ROLE_PERMISSIONS
    }
