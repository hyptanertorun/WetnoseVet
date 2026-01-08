from pydantic import BaseModel, Field
from typing import Optional, List
from models.service import ContentStatus, PriceMode, SEOData

# --- Service Schemas ---

class ServiceCreate(BaseModel):
    title: str = Field(..., min_length=2)
    slug: Optional[str] = None  # Auto-generated if not provided
    short_description: str = Field(..., min_length=10)
    long_description: Optional[str] = None
    cover_image_url: str
    cover_image_alt: Optional[str] = None
    icon: Optional[str] = None
    price_mode: PriceMode = PriceMode.HIDDEN
    price_value: Optional[float] = None
    tags: List[str] = []
    category: Optional[str] = None
    seo: Optional[SEOData] = None
    status: ContentStatus = ContentStatus.DRAFT
    sort_order: int = 0

class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    cover_image_url: Optional[str] = None
    cover_image_alt: Optional[str] = None
    icon: Optional[str] = None
    price_mode: Optional[PriceMode] = None
    price_value: Optional[float] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    seo: Optional[SEOData] = None
    sort_order: Optional[int] = None

class ServiceStatusUpdate(BaseModel):
    status: ContentStatus

class ServiceReorderItem(BaseModel):
    id: str
    sort_order: int

class ServiceReorderRequest(BaseModel):
    items: List[ServiceReorderItem]

class ServiceResponse(BaseModel):
    id: str
    title: str
    slug: str
    short_description: str
    long_description: Optional[str]
    cover_image_url: str
    cover_image_alt: Optional[str]
    icon: Optional[str]
    price_mode: PriceMode
    price_value: Optional[float]
    tags: List[str]
    category: Optional[str]
    seo: SEOData
    status: ContentStatus
    sort_order: int
    archived_at: Optional[str]
    created_at: str
    updated_at: str
    created_by: Optional[str]
    updated_by: Optional[str]

class ServiceListResponse(BaseModel):
    services: List[ServiceResponse]
    total: int
    page: int
    page_size: int

class ServicePublicResponse(BaseModel):
    id: str
    title: str
    slug: str
    short_description: str
    long_description: Optional[str]
    cover_image_url: str
    cover_image_alt: Optional[str]
    icon: Optional[str]
    price_mode: PriceMode
    price_value: Optional[float]
    tags: List[str]
    category: Optional[str]
    seo: SEOData

class ServicePublicListResponse(BaseModel):
    services: List[ServicePublicResponse]
    total: int
