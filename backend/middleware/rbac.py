from fastapi import Depends, HTTPException, status
from typing import List
from functools import wraps

from middleware.auth import get_current_active_user
from models.user import User, UserRole
import logging

logger = logging.getLogger(__name__)

class RoleChecker:
    """Dependency class for role-based access control"""
    
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles
    
    async def __call__(self, user: User = Depends(get_current_active_user)) -> User:
        if user.role not in self.allowed_roles:
            logger.warning(f"Access denied for user {user.email} with role {user.role}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu işlemi yapmaya yetkiniz yok"
            )
        return user


class DynamicPermissionChecker:
    """Dependency class for dynamic permission-based access control"""
    
    def __init__(self, required_permission: str):
        self.required_permission = required_permission
    
    async def __call__(self, user: User = Depends(get_current_active_user)) -> User:
        from models.role_permissions import RolePermissionsService
        
        # Support admin always has access
        if getattr(user, 'is_support_admin', False):
            return user
        
        # Check dynamic permissions
        has_perm = await RolePermissionsService.has_permission(
            user.role.value, 
            self.required_permission
        )
        
        if not has_perm:
            logger.warning(
                f"Permission denied for user {user.email}: "
                f"missing '{self.required_permission}' permission"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu işlemi yapmaya yetkiniz yok"
            )
        return user


def require_permission(permission: str):
    """Factory function to create permission checker dependency"""
    return DynamicPermissionChecker(permission)


def require_roles(allowed_roles: List[UserRole]):
    """Factory function to create role checker dependency"""
    return RoleChecker(allowed_roles)

def check_role(roles: List[str]):
    """
    Factory function that accepts string role names and returns a dependency.
    Usage: Depends(check_role(["admin", "manager", "editor"]))
    """
    role_map = {
        "admin": UserRole.ADMIN,
        "manager": UserRole.MANAGER,
        "editor": UserRole.EDITOR,
        "reception": UserRole.RECEPTION,
    }
    allowed_roles = [role_map[r] for r in roles if r in role_map]
    return RoleChecker(allowed_roles)

# Pre-defined role checkers
require_admin = RoleChecker([UserRole.ADMIN])
require_admin_or_manager = RoleChecker([UserRole.ADMIN, UserRole.MANAGER])
require_admin_manager = RoleChecker([UserRole.ADMIN, UserRole.MANAGER])  # Alias
require_admin_manager_editor = RoleChecker([UserRole.ADMIN, UserRole.MANAGER, UserRole.EDITOR])
require_any_role = RoleChecker([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTION, UserRole.EDITOR])
