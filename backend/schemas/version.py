from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class VersionResponse(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    version_no: int
    snapshot: Dict[str, Any]
    change_reason: Optional[str]
    created_at: str
    created_by: str
    created_by_email: str

class VersionListResponse(BaseModel):
    versions: List[VersionResponse]
    total: int

class RestoreVersionRequest(BaseModel):
    change_reason: Optional[str] = "Versiyon geri yüklendi"
