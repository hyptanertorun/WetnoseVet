from pydantic import BaseModel, Field
from typing import Optional, List
from models.blog import BlogStatus, BlogSEO

# --- Create/Update Schemas ---

class BlogSEOInput(BaseModel):
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    og_image: Optional[str] = None

class BlogPostCreate(BaseModel):
    title: str = Field(..., min_length=2)
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    cover_image_alt: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = []
    seo: Optional[BlogSEOInput] = None
    status: BlogStatus = BlogStatus.DRAFT
    sort_order: int = 0
    ai_generated: bool = False
    ai_metadata: Optional[dict] = None

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    cover_image_alt: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    seo: Optional[BlogSEOInput] = None
    sort_order: Optional[int] = None

class BlogStatusUpdate(BaseModel):
    status: BlogStatus

# --- Response Schemas ---

class BlogSEOResponse(BaseModel):
    meta_title: Optional[str]
    meta_description: Optional[str]
    og_image: Optional[str]

class BlogPostResponse(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: Optional[str]
    cover_image_url: Optional[str]
    cover_image_alt: Optional[str]
    content: Optional[str]
    category: Optional[str]
    tags: List[str]
    seo: Optional[BlogSEOResponse]
    status: BlogStatus
    published_at: Optional[str]
    archived_at: Optional[str]
    sort_order: int
    created_at: Optional[str]
    updated_at: Optional[str]
    created_by: Optional[str]
    updated_by: Optional[str]

class BlogPostListResponse(BaseModel):
    posts: List[BlogPostResponse]
    total: int

# --- Public Response ---

class FAQItemResponse(BaseModel):
    question: str
    answer: str

class CTABlockResponse(BaseModel):
    type: str
    text: str

class AIMetadataResponse(BaseModel):
    faq: Optional[List[FAQItemResponse]] = None
    schema_jsonld: Optional[str] = None
    cta_block: Optional[CTABlockResponse] = None
    disclaimer: Optional[str] = None
    outline: Optional[List[str]] = None

# Lightweight schema for blog list - no content field to reduce payload
class BlogPostListItemResponse(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: Optional[str]
    cover_image_url: Optional[str]
    cover_image_alt: Optional[str]
    category: Optional[str]
    tags: List[str]
    published_at: Optional[str]
    reading_time: Optional[int] = None

class BlogPostPublicResponse(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: Optional[str]
    cover_image_url: Optional[str]
    cover_image_alt: Optional[str]
    content: Optional[str]
    category: Optional[str]
    tags: List[str]
    seo: Optional[BlogSEOResponse]
    published_at: Optional[str]
    ai_generated: Optional[bool] = False
    ai_metadata: Optional[AIMetadataResponse] = None
    reading_time: Optional[int] = None  # dakika cinsinden
    view_count: Optional[int] = 0  # görüntülenme sayısı

class BlogPostPublicListResponse(BaseModel):
    posts: List[BlogPostListItemResponse]
    total: int
