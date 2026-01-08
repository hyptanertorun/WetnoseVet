from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid

class BlogStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"

class BlogSEO(BaseModel):
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    og_image: Optional[str] = None

class BlogPost(BaseModel):
    model_config = ConfigDict(use_enum_values=True)
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    cover_image_alt: Optional[str] = None
    content: Optional[str] = None  # Rich text / HTML
    category: Optional[str] = None
    tags: List[str] = []
    seo: Optional[BlogSEO] = None
    status: BlogStatus = BlogStatus.DRAFT
    published_at: Optional[datetime] = None
    archived_at: Optional[datetime] = None
    sort_order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    
    # AI Generation fields
    ai_generated: bool = False
    ai_metadata: Optional[dict] = None  # Stores FAQ, schema, CTA, etc.

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "excerpt": self.excerpt,
            "cover_image_url": self.cover_image_url,
            "cover_image_alt": self.cover_image_alt,
            "content": self.content,
            "category": self.category,
            "tags": self.tags,
            "seo": self.seo.model_dump() if self.seo else None,
            "status": self.status.value if hasattr(self.status, 'value') else self.status,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "archived_at": self.archived_at.isoformat() if self.archived_at else None,
            "sort_order": self.sort_order,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "created_by": self.created_by,
            "updated_by": self.updated_by,
            "ai_generated": self.ai_generated,
            "ai_metadata": self.ai_metadata
        }
