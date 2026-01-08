from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import uuid

class ContentVersion(BaseModel):
    """Represents a version snapshot of content (Service/Team/Blog)"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    entity_type: str  # 'service' | 'team_member' | 'blog'
    entity_id: str
    version_no: int
    snapshot: Dict[str, Any]  # Full entity data at this version
    change_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str
    created_by_email: str
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "version_no": self.version_no,
            "snapshot": self.snapshot,
            "change_reason": self.change_reason,
            "created_at": self.created_at.isoformat(),
            "created_by": self.created_by,
            "created_by_email": self.created_by_email
        }
