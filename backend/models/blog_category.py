from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid
import re

class BlogCategorySEO(BaseModel):
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

class BlogCategory(BaseModel):
    model_config = ConfigDict(use_enum_values=True)
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: Optional[str] = None
    seo: Optional[BlogCategorySEO] = None
    order: int = 0
    is_active: bool = True
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "seo": self.seo.model_dump() if self.seo else None,
            "order": self.order,
            "is_active": self.is_active,
            "is_deleted": self.is_deleted,
            "deleted_at": self.deleted_at.isoformat() if self.deleted_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "created_by": self.created_by,
            "updated_by": self.updated_by
        }

class BlogCategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: Optional[str] = None
    description: Optional[str] = Field(None, max_length=500)
    seo: Optional[BlogCategorySEO] = None
    order: int = 0
    is_active: bool = True

class BlogCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    slug: Optional[str] = None
    description: Optional[str] = Field(None, max_length=500)
    seo: Optional[BlogCategorySEO] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None

def slugify_turkish(text: str) -> str:
    """Convert text to URL-friendly slug with Turkish character support."""
    turkish_map = {
        'ş': 's', 'Ş': 's', 'ı': 'i', 'İ': 'i', 'ğ': 'g', 'Ğ': 'g',
        'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c'
    }
    
    result = text.lower()
    for tr_char, en_char in turkish_map.items():
        result = result.replace(tr_char, en_char)
    
    # Remove non-alphanumeric characters except spaces and hyphens
    result = re.sub(r'[^a-z0-9\s-]', '', result)
    # Replace spaces with hyphens
    result = re.sub(r'\s+', '-', result)
    # Remove consecutive hyphens
    result = re.sub(r'-+', '-', result)
    # Remove leading/trailing hyphens
    result = result.strip('-')
    
    return result[:100]  # Max 100 characters
