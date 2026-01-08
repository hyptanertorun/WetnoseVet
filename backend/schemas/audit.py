from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from models.audit import AuditAction

class AuditLogResponse(BaseModel):
    id: str
    actor_user_id: Optional[str]
    actor_email: Optional[str]
    actor_role: Optional[str]
    entity_type: str
    entity_id: Optional[str]
    action: AuditAction
    before_state: Optional[Dict[str, Any]]
    after_state: Optional[Dict[str, Any]]
    metadata: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    user_agent: Optional[str]
    timestamp: datetime
    success: bool
    error_message: Optional[str]

class AuditLogListResponse(BaseModel):
    logs: List[AuditLogResponse]
    total: int
    page: int
    page_size: int
