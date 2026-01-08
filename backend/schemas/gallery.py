from pydantic import BaseModel, Field
from typing import Optional, List
from models.gallery import AlbumStatus

# --- Album Schemas ---

class GalleryAlbumCreate(BaseModel):
    title: str = Field(..., min_length=2)
    slug: Optional[str] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    status: AlbumStatus = AlbumStatus.ACTIVE
    sort_order: int = 0

class GalleryAlbumUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    status: Optional[AlbumStatus] = None
    sort_order: Optional[int] = None

class GalleryAlbumResponse(BaseModel):
    id: str
    title: str
    slug: str
    description: Optional[str]
    cover_image_url: Optional[str]
    status: AlbumStatus
    sort_order: int
    item_count: int = 0
    created_at: Optional[str]
    updated_at: Optional[str]
    created_by: Optional[str]

class GalleryAlbumListResponse(BaseModel):
    albums: List[GalleryAlbumResponse]
    total: int

# --- Item Schemas ---

class GalleryItemCreate(BaseModel):
    album_id: str
    image_url: str
    image_alt: Optional[str] = None
    caption: Optional[str] = None
    sort_order: int = 0

class GalleryItemUpdate(BaseModel):
    image_url: Optional[str] = None
    image_alt: Optional[str] = None
    caption: Optional[str] = None
    sort_order: Optional[int] = None

class GalleryItemResponse(BaseModel):
    id: str
    album_id: str
    image_url: str
    image_alt: Optional[str]
    caption: Optional[str]
    sort_order: int
    created_at: Optional[str]

class GalleryItemListResponse(BaseModel):
    items: List[GalleryItemResponse]
    total: int

class GalleryItemReorderRequest(BaseModel):
    items: List[dict]  # [{id, sort_order}]

# --- Upload Schemas ---

class GalleryUploadedImage(BaseModel):
    id: str
    url: str
    width: int
    height: int
    size: int
    filename: str

class GalleryUploadResponse(BaseModel):
    images: List[GalleryUploadedImage]
    errors: Optional[List[dict]] = None
    total_uploaded: int
    total_errors: int

class GalleryBulkDeleteRequest(BaseModel):
    item_ids: List[str]

# --- Public Schemas ---

class GalleryAlbumPublicResponse(BaseModel):
    id: str
    title: str
    slug: str
    description: Optional[str]
    cover_image_url: Optional[str]
    items: List[GalleryItemResponse] = []

class GalleryPublicListResponse(BaseModel):
    albums: List[GalleryAlbumPublicResponse]
    total: int
