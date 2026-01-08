from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid

class AlbumStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class GalleryAlbum(BaseModel):
    model_config = ConfigDict(use_enum_values=True)
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    status: AlbumStatus = AlbumStatus.ACTIVE
    sort_order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: Optional[str] = None

class GalleryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    album_id: str
    image_url: str
    image_alt: Optional[str] = None
    caption: Optional[str] = None
    sort_order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: Optional[str] = None
