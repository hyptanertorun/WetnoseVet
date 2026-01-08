from fastapi import APIRouter, HTTPException, Request, Depends, Query, UploadFile, File
from typing import Optional, List
from PIL import Image
import io
import os
import uuid
from pathlib import Path

from schemas.gallery import (
    GalleryAlbumCreate, GalleryAlbumUpdate, GalleryAlbumResponse, GalleryAlbumListResponse,
    GalleryItemCreate, GalleryItemUpdate, GalleryItemResponse, GalleryItemListResponse, GalleryItemReorderRequest,
    GalleryUploadResponse, GalleryUploadedImage, GalleryBulkDeleteRequest
)
from services.gallery_service import GalleryService
from services.audit_service import AuditService
from middleware.auth import get_current_active_user
from middleware.rbac import require_admin_manager_editor
from models.user import User
from models.gallery import AlbumStatus
from models.audit import AuditAction
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/gallery", tags=["Admin Gallery"])

# Upload settings
UPLOAD_DIR = Path("/app/backend/uploads/gallery")
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 3 * 1024 * 1024  # 3MB
MAX_IMAGE_WIDTH = 1600
WEBP_QUALITY = 75


# --- Stats Endpoint ---

@router.get("/stats")
async def get_gallery_stats(
    current_user: User = Depends(get_current_active_user)
):
    """Get gallery statistics for admin dashboard"""
    stats = await GalleryService.get_stats()
    return stats


# --- Album Endpoints ---

@router.get("/albums", response_model=GalleryAlbumListResponse)
async def get_albums(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[AlbumStatus] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Get paginated list of gallery albums"""
    albums, total = await GalleryService.get_albums(
        page=page,
        page_size=limit,
        status=status,
        search=search
    )
    
    return GalleryAlbumListResponse(
        albums=[GalleryAlbumResponse(**a) for a in albums],
        total=total
    )

@router.get("/albums/{album_id}", response_model=GalleryAlbumResponse)
async def get_album(
    album_id: str,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Get single album by ID"""
    album = await GalleryService.get_album_by_id(album_id)
    if not album:
        raise HTTPException(status_code=404, detail="Albüm bulunamadı")
    
    # Get item count
    items, total = await GalleryService.get_items_by_album(album_id)
    
    return GalleryAlbumResponse(
        id=album.id,
        title=album.title,
        slug=album.slug,
        description=album.description,
        cover_image_url=album.cover_image_url,
        status=album.status,
        sort_order=album.sort_order,
        item_count=total,
        created_at=album.created_at.isoformat() if album.created_at else None,
        updated_at=album.updated_at.isoformat() if album.updated_at else None,
        created_by=album.created_by
    )

@router.post("/albums", response_model=dict)
async def create_album(
    request: Request,
    album_data: GalleryAlbumCreate,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Create new gallery album"""
    ip_address = request.client.host if request.client else None
    
    album = await GalleryService.create_album(
        title=album_data.title,
        slug=album_data.slug,
        description=album_data.description,
        cover_image_url=album_data.cover_image_url,
        status=album_data.status,
        sort_order=album_data.sort_order,
        created_by=current_user.id
    )
    
    await AuditService.log(
        entity_type="gallery_album",
        entity_id=album.id,
        action=AuditAction.CREATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        after_state={"title": album.title, "slug": album.slug},
        ip_address=ip_address
    )
    
    return {"message": "Albüm oluşturuldu", "id": album.id, "slug": album.slug}

@router.put("/albums/{album_id}", response_model=GalleryAlbumResponse)
async def update_album(
    album_id: str,
    request: Request,
    album_data: GalleryAlbumUpdate,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Update gallery album"""
    ip_address = request.client.host if request.client else None
    
    before_album = await GalleryService.get_album_by_id(album_id)
    if not before_album:
        raise HTTPException(status_code=404, detail="Albüm bulunamadı")
    
    update_kwargs = {}
    for field in ['title', 'slug', 'description', 'cover_image_url', 'status', 'sort_order']:
        value = getattr(album_data, field, None)
        if value is not None:
            update_kwargs[field] = value
    
    album = await GalleryService.update_album(album_id, **update_kwargs)
    
    if not album:
        raise HTTPException(status_code=400, detail="Güncelleme başarısız")
    
    await AuditService.log(
        entity_type="gallery_album",
        entity_id=album_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"title": before_album.title},
        after_state={"title": album.title},
        ip_address=ip_address
    )
    
    items, total = await GalleryService.get_items_by_album(album_id)
    
    return GalleryAlbumResponse(
        id=album.id,
        title=album.title,
        slug=album.slug,
        description=album.description,
        cover_image_url=album.cover_image_url,
        status=album.status,
        sort_order=album.sort_order,
        item_count=total,
        created_at=album.created_at.isoformat() if album.created_at else None,
        updated_at=album.updated_at.isoformat() if album.updated_at else None,
        created_by=album.created_by
    )

@router.delete("/albums/{album_id}", response_model=dict)
async def delete_album(
    album_id: str,
    request: Request,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Delete gallery album and its items"""
    ip_address = request.client.host if request.client else None
    
    album = await GalleryService.get_album_by_id(album_id)
    if not album:
        raise HTTPException(status_code=404, detail="Albüm bulunamadı")
    
    success = await GalleryService.delete_album(album_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Silme başarısız")
    
    await AuditService.log(
        entity_type="gallery_album",
        entity_id=album_id,
        action=AuditAction.DELETE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"title": album.title},
        ip_address=ip_address
    )
    
    return {"message": "Albüm silindi"}

# --- Item Endpoints ---

@router.get("/albums/{album_id}/items", response_model=GalleryItemListResponse)
async def get_album_items(
    album_id: str,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Get all items in an album"""
    album = await GalleryService.get_album_by_id(album_id)
    if not album:
        raise HTTPException(status_code=404, detail="Albüm bulunamadı")
    
    items, total = await GalleryService.get_items_by_album(album_id)
    
    return GalleryItemListResponse(
        items=[GalleryItemResponse(**i) for i in items],
        total=total
    )

@router.post("/items", response_model=dict)
async def create_item(
    request: Request,
    item_data: GalleryItemCreate,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Add new item to album"""
    ip_address = request.client.host if request.client else None
    
    album = await GalleryService.get_album_by_id(item_data.album_id)
    if not album:
        raise HTTPException(status_code=404, detail="Albüm bulunamadı")
    
    item = await GalleryService.create_item(
        album_id=item_data.album_id,
        image_url=item_data.image_url,
        image_alt=item_data.image_alt,
        caption=item_data.caption,
        sort_order=item_data.sort_order,
        created_by=current_user.id
    )
    
    await AuditService.log(
        entity_type="gallery_item",
        entity_id=item.id,
        action=AuditAction.CREATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        after_state={"album_id": item.album_id, "image_url": item.image_url[:50]},
        ip_address=ip_address
    )
    
    return {"message": "Görsel eklendi", "id": item.id}

@router.put("/items/{item_id}", response_model=GalleryItemResponse)
async def update_item(
    item_id: str,
    request: Request,
    item_data: GalleryItemUpdate,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Update gallery item"""
    ip_address = request.client.host if request.client else None
    
    update_kwargs = {}
    for field in ['image_url', 'image_alt', 'caption', 'sort_order']:
        value = getattr(item_data, field, None)
        if value is not None:
            update_kwargs[field] = value
    
    item = await GalleryService.update_item(item_id, **update_kwargs)
    
    if not item:
        raise HTTPException(status_code=404, detail="Görsel bulunamadı")
    
    await AuditService.log(
        entity_type="gallery_item",
        entity_id=item_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        ip_address=ip_address
    )
    
    return GalleryItemResponse(**item)

@router.delete("/items/{item_id}", response_model=dict)
async def delete_item(
    item_id: str,
    request: Request,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Delete gallery item"""
    ip_address = request.client.host if request.client else None
    
    success = await GalleryService.delete_item(item_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Görsel bulunamadı")
    
    await AuditService.log(
        entity_type="gallery_item",
        entity_id=item_id,
        action=AuditAction.DELETE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        ip_address=ip_address
    )
    
    return {"message": "Görsel silindi"}

@router.patch("/items/reorder", response_model=dict)
async def reorder_items(
    request: Request,
    reorder_data: GalleryItemReorderRequest,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Reorder gallery items"""
    ip_address = request.client.host if request.client else None
    
    success = await GalleryService.reorder_items(reorder_data.items)
    
    if not success:
        raise HTTPException(status_code=400, detail="Sıralama başarısız")
    
    await AuditService.log(
        entity_type="gallery_item",
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        metadata={"action": "reorder", "item_count": len(reorder_data.items)},
        ip_address=ip_address
    )
    
    return {"message": "Sıralama güncellendi"}


# --- Upload Endpoints ---

@router.post("/albums/{album_id}/upload", response_model=GalleryUploadResponse)
async def upload_images(
    album_id: str,
    request: Request,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(require_admin_manager_editor)
):
    """
    Upload multiple images to an album.
    - Accepts: image/jpeg, image/png, image/webp, image/gif
    - Max size: 3MB per file
    - Auto converts to WebP, max width 1600px
    """
    ip_address = request.client.host if request.client else None
    
    # Verify album exists
    album = await GalleryService.get_album_by_id(album_id)
    if not album:
        raise HTTPException(status_code=404, detail="Albüm bulunamadı")
    
    # Create upload directory for this album
    album_upload_dir = UPLOAD_DIR / album_id
    album_upload_dir.mkdir(parents=True, exist_ok=True)
    
    uploaded_images: List[GalleryUploadedImage] = []
    errors: List[dict] = []
    
    # Get current max sort_order for this album
    existing_items, _ = await GalleryService.get_items_by_album(album_id)
    max_sort_order = max([item.get('sort_order', 0) for item in existing_items], default=0)
    
    for idx, file in enumerate(files):
        try:
            # Validate mime type
            if file.content_type not in ALLOWED_MIME_TYPES:
                errors.append({
                    "filename": file.filename,
                    "error": f"Desteklenmeyen dosya türü: {file.content_type}"
                })
                continue
            
            # Read file content
            content = await file.read()
            
            # Validate file size
            if len(content) > MAX_FILE_SIZE:
                errors.append({
                    "filename": file.filename,
                    "error": "Dosya boyutu çok büyük (max 3MB)"
                })
                continue
            
            # Process image with Pillow
            try:
                img = Image.open(io.BytesIO(content))
                
                # Convert to RGB if necessary (for PNG with transparency)
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Resize if too wide
                original_width, original_height = img.size
                if original_width > MAX_IMAGE_WIDTH:
                    ratio = MAX_IMAGE_WIDTH / original_width
                    new_height = int(original_height * ratio)
                    img = img.resize((MAX_IMAGE_WIDTH, new_height), Image.Resampling.LANCZOS)
                
                final_width, final_height = img.size
                
                # Generate unique filename
                file_uuid = str(uuid.uuid4())[:8]
                safe_filename = "".join(c for c in file.filename if c.isalnum() or c in '._-')
                base_name = os.path.splitext(safe_filename)[0][:30]
                webp_filename = f"{base_name}_{file_uuid}.webp"
                
                # Save as WebP
                webp_path = album_upload_dir / webp_filename
                img.save(webp_path, "WEBP", quality=WEBP_QUALITY, optimize=True)
                
                file_size = webp_path.stat().st_size
                image_url = f"/uploads/gallery/{album_id}/{webp_filename}"
                
                # Create gallery item in database
                sort_order = max_sort_order + idx + 1
                item = await GalleryService.create_item(
                    album_id=album_id,
                    image_url=image_url,
                    image_alt=base_name,
                    caption=None,
                    sort_order=sort_order,
                    created_by=current_user.id
                )
                
                uploaded_images.append(GalleryUploadedImage(
                    id=item.id,
                    url=image_url,
                    width=final_width,
                    height=final_height,
                    size=file_size,
                    filename=webp_filename
                ))
                
            except Exception as img_error:
                logger.error(f"Image processing error: {img_error}")
                errors.append({
                    "filename": file.filename,
                    "error": "Görsel işleme hatası"
                })
                continue
                
        except Exception as e:
            logger.error(f"Upload error for {file.filename}: {e}")
            errors.append({
                "filename": file.filename,
                "error": str(e)[:100]
            })
    
    # Log audit
    if uploaded_images:
        await AuditService.log(
            entity_type="gallery_item",
            entity_id=album_id,
            action=AuditAction.CREATE,
            actor_user_id=current_user.id,
            actor_email=current_user.email,
            actor_role=current_user.role.value,
            metadata={
                "action": "bulk_upload",
                "uploaded_count": len(uploaded_images),
                "error_count": len(errors)
            },
            ip_address=ip_address
        )
    
    return GalleryUploadResponse(
        images=uploaded_images,
        errors=errors if errors else None,
        total_uploaded=len(uploaded_images),
        total_errors=len(errors)
    )


@router.delete("/bulk-delete", response_model=dict)
async def bulk_delete_items(
    request: Request,
    delete_data: GalleryBulkDeleteRequest,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Delete multiple gallery items at once"""
    ip_address = request.client.host if request.client else None
    
    deleted_count = 0
    errors = []
    
    for item_id in delete_data.item_ids:
        try:
            # Get item to find file path
            item = await GalleryService.get_item_by_id(item_id)
            if item:
                image_url = item.get('image_url', '')
                if image_url and image_url.startswith('/uploads/gallery/'):
                    # Delete physical file
                    file_path = Path("/app/backend") / image_url.lstrip('/')
                    if file_path.exists():
                        file_path.unlink()
            
            success = await GalleryService.delete_item(item_id)
            if success:
                deleted_count += 1
            else:
                errors.append(item_id)
        except Exception as e:
            logger.error(f"Error deleting item {item_id}: {e}")
            errors.append(item_id)
    
    await AuditService.log(
        entity_type="gallery_item",
        action=AuditAction.DELETE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        metadata={
            "action": "bulk_delete",
            "deleted_count": deleted_count,
            "error_count": len(errors)
        },
        ip_address=ip_address
    )
    
    return {
        "message": f"{deleted_count} görsel silindi",
        "deleted_count": deleted_count,
        "errors": errors if errors else None
    }



# ===========================================
# PUBLIC GALLERY ENDPOINTS (No Auth Required)
# ===========================================

public_router = APIRouter(prefix="/gallery", tags=["Public Gallery"])
public_gallery_router = APIRouter(prefix="/public/gallery", tags=["Public Gallery Alt"])

@public_router.get("/albums")
async def get_public_albums(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50)
):
    """Get published gallery albums for public view"""
    albums, total = await GalleryService.get_albums(
        page=page,
        page_size=limit,
        status=AlbumStatus.ACTIVE
    )
    return {
        "albums": albums,
        "total": total,
        "page": page,
        "limit": limit
    }

@public_router.get("/albums/{album_id}")
async def get_public_album(album_id: str):
    """Get a single published album with its images"""
    album = await GalleryService.get_album(album_id)
    if not album or album.get("status") != "active":
        raise HTTPException(status_code=404, detail="Albüm bulunamadı")
    
    # Get album images
    images, total = await GalleryService.get_album_items(album_id, page=1, page_size=100)
    album["images"] = images
    album["image_count"] = total
    
    return album

@public_router.get("/images")
async def get_public_images(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    album_id: Optional[str] = None
):
    """Get published gallery images"""
    if album_id:
        images, total = await GalleryService.get_album_items(album_id, page=page, page_size=limit)
    else:
        # Get all published images from all published albums
        images, total = await GalleryService.get_all_published_images(page=page, page_size=limit)
    
    return {
        "images": images,
        "total": total,
        "page": page,
        "limit": limit
    }


# Main endpoint for frontend - returns albums with their items
@public_gallery_router.get("")
async def get_gallery_for_frontend():
    """Get all active albums with their items for the gallery page"""
    albums_with_items = await GalleryService.get_active_albums_with_items()
    return {"albums": albums_with_items}


