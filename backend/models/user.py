from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime, timezone
from enum import Enum
import uuid

class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    RECEPTION = "reception"
    EDITOR = "editor"

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    full_name: str
    role: UserRole = UserRole.EDITOR
    status: UserStatus = UserStatus.ACTIVE
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: Optional[str] = None  # User ID who created this user
    must_change_password: bool = False  # Force password change on first login
    is_support_admin: bool = False  # Hidden support admin (not in database)

class UserPublic(BaseModel):
    """User model without sensitive data"""
    model_config = ConfigDict(extra="ignore")
    
    id: str
    email: EmailStr
    full_name: str
    role: UserRole
    status: UserStatus
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    must_change_password: bool = False

class RefreshToken(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    revoked: bool = False
