from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Any, Dict
from datetime import datetime, timezone
from enum import Enum
import uuid

class AuditAction(str, Enum):
    # Auth actions
    LOGIN = "login"
    LOGOUT = "logout"
    LOGIN_FAILED = "login_failed"
    PASSWORD_RESET = "password_reset"
    PASSWORD_CHANGE = "password_change"
    TOKEN_REFRESH = "token_refresh"
    
    # CRUD actions
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    
    # Special actions
    ACTIVATE = "activate"
    DEACTIVATE = "deactivate"
    ROLE_CHANGE = "role_change"

class AuditLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    actor_user_id: Optional[str] = None  # None for system actions or failed logins
    actor_email: Optional[str] = None
    actor_role: Optional[str] = None
    entity_type: str  # e.g., "user", "settings", "service", "team"
    entity_id: Optional[str] = None
    action: AuditAction
    before_state: Optional[Dict[str, Any]] = None
    after_state: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None  # Extra info like IP, user agent
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    success: bool = True
    error_message: Optional[str] = None
