from fastapi import APIRouter, Depends, Query
from typing import Optional
from datetime import datetime

from schemas.audit import AuditLogResponse, AuditLogListResponse
from services.audit_service import AuditService
from middleware.auth import get_current_active_user
from middleware.rbac import require_admin_or_manager
from models.user import User
from models.audit import AuditAction
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/audit-logs", tags=["Audit Logs"])

@router.get("", response_model=AuditLogListResponse)
async def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    entity_type: Optional[str] = None,
    action: Optional[AuditAction] = None,
    actor_user_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(require_admin_or_manager)
):
    """Get audit logs (Admin/Manager only)"""
    logs, total = await AuditService.get_logs(
        page=page,
        page_size=page_size,
        entity_type=entity_type,
        action=action,
        actor_user_id=actor_user_id,
        start_date=start_date,
        end_date=end_date
    )
    
    return AuditLogListResponse(
        logs=[
            AuditLogResponse(
                id=log.id,
                actor_user_id=log.actor_user_id,
                actor_email=log.actor_email,
                actor_role=log.actor_role,
                entity_type=log.entity_type,
                entity_id=log.entity_id,
                action=log.action,
                before_state=log.before_state,
                after_state=log.after_state,
                metadata=log.metadata,
                ip_address=log.ip_address,
                user_agent=log.user_agent,
                timestamp=log.timestamp,
                success=log.success,
                error_message=log.error_message
            ) for log in logs
        ],
        total=total,
        page=page,
        page_size=page_size
    )
