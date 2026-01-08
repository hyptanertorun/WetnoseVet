from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid
import re

def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title"""
    # Turkish character mapping
    tr_map = {
        'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c',
        'İ': 'i', 'Ğ': 'g', 'Ü': 'u', 'Ş': 's', 'Ö': 'o', 'Ç': 'c'
    }
    slug = title.lower()
    for tr_char, en_char in tr_map.items():
        slug = slug.replace(tr_char, en_char)
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')

class ContentStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"

class PriceMode(str, Enum):
    HIDDEN = "hidden"
    STARTING_FROM = "starting_from"
    FIXED = "fixed"

class SEOData(BaseModel):
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    og_image_url: Optional[str] = None

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    short_description: str
    long_description: Optional[str] = None  # Rich text HTML
    cover_image_url: str
    cover_image_alt: Optional[str] = None
    icon: Optional[str] = None  # Icon name for UI
    price_mode: PriceMode = PriceMode.HIDDEN
    price_value: Optional[float] = None
    tags: List[str] = Field(default_factory=list)
    category: Optional[str] = None
    seo: SEOData = Field(default_factory=SEOData)
    status: ContentStatus = ContentStatus.DRAFT
    sort_order: int = 0
    archived_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

class ServicePublic(BaseModel):
    """Public-facing service model (no internal fields)"""
    model_config = ConfigDict(extra="ignore")
    
    id: str
    title: str
    slug: str
    short_description: str
    long_description: Optional[str] = None
    cover_image_url: str
    cover_image_alt: Optional[str] = None
    icon: Optional[str] = None
    price_mode: PriceMode
    price_value: Optional[float] = None
    tags: List[str] = []
    category: Optional[str] = None
    seo: SEOData
