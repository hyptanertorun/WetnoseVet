from fastapi import APIRouter, HTTPException, Request, Depends, Query, UploadFile, File
from typing import Optional, List
import os
import uuid
from PIL import Image
import io

from schemas.testimonial import (
    TestimonialCreate, TestimonialUpdate, TestimonialStatusUpdate,
    TestimonialBulkAction, TestimonialReorder,
    TestimonialResponse, TestimonialListResponse, TestimonialAnalytics
)
from services.testimonial_service import TestimonialService
from services.audit_service import AuditService
from middleware.auth import get_current_active_user
from middleware.rbac import require_admin_manager_editor, require_admin_manager
from models.user import User
from models.audit import AuditAction
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/testimonials", tags=["Admin Testimonials"])

# Upload config
MAX_FILE_SIZE = 3 * 1024 * 1024  # 3MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_IMAGE_DIMENSION = 2048
UPLOAD_DIR = "/app/backend/uploads/testimonials"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _format_response(doc: dict) -> TestimonialResponse:
    """Format document to response schema"""
    return TestimonialResponse(
        id=doc["id"],
        full_name=doc.get("full_name", doc.get("author_name", "")),
        email=doc.get("email"),
        phone=doc.get("phone"),
        pet_name=doc.get("pet_name", ""),
        pet_photo_url=doc.get("pet_photo_url"),
        service_id=doc.get("service_id"),
        service_name_snapshot=doc.get("service_name_snapshot"),
        rating=doc.get("rating", 5),
        feedback_type=doc.get("feedback_type", "positive"),
        comment=doc.get("comment", doc.get("content", "")),
        consent_internal=doc.get("consent_internal", True),
        consent_public=doc.get("consent_public", False),
        status=doc.get("status", "pending"),
        admin_note=doc.get("admin_note"),
        submitted_at=doc.get("submitted_at", doc.get("created_at")),
        approved_at=doc.get("approved_at"),
        approved_by=doc.get("approved_by"),
        approved_by_email=doc.get("approved_by_email"),
        source=doc.get("source", "manual"),
        archived_at=doc.get("archived_at"),
        sort_order=doc.get("sort_order", 0)
    )


@router.get("", response_model=TestimonialListResponse)
async def get_testimonials(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    rating: Optional[int] = Query(None, ge=1, le=5),
    service_id: Optional[str] = None,
    feedback_type: Optional[str] = None,
    consent_public: Optional[bool] = None,
    search: Optional[str] = None,
    include_archived: bool = False,
    sort_by: str = "submitted_at",
    sort_order: str = "desc",
    current_user: User = Depends(get_current_active_user)
):
    """Get paginated list of testimonials with filters"""
    testimonials, total = await TestimonialService.get_list(
        page=page,
        page_size=page_size,
        status=status,
        rating=rating,
        service_id=service_id,
        feedback_type=feedback_type,
        consent_public=consent_public,
        search=search,
        include_archived=include_archived,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    return TestimonialListResponse(
        testimonials=[_format_response(t) for t in testimonials],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/analytics", response_model=TestimonialAnalytics)
async def get_analytics(
    current_user: User = Depends(get_current_active_user)
):
    """Get testimonial analytics for dashboard"""
    analytics = await TestimonialService.get_analytics()
    return TestimonialAnalytics(**analytics)


@router.get("/{testimonial_id}", response_model=TestimonialResponse)
async def get_testimonial(
    testimonial_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get single testimonial by ID"""
    testimonial = await TestimonialService.get_by_id(testimonial_id)
    if not testimonial:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    return _format_response(testimonial)


@router.post("", response_model=dict)
async def create_testimonial(
    request: Request,
    testimonial_data: TestimonialCreate,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Create new testimonial (admin)"""
    ip_address = request.client.host if request.client else None
    
    testimonial = await TestimonialService.create(
        full_name=testimonial_data.full_name,
        pet_name=testimonial_data.pet_name,
        rating=testimonial_data.rating,
        comment=testimonial_data.comment,
        created_by=current_user.id,
        email=testimonial_data.email,
        phone=testimonial_data.phone,
        pet_type=testimonial_data.pet_type,
        pet_photo_url=testimonial_data.pet_photo_url,
        owner_photo_url=testimonial_data.owner_photo_url,
        treatment=testimonial_data.treatment,
        service_id=testimonial_data.service_id,
        feedback_type=testimonial_data.feedback_type,
        consent_internal=testimonial_data.consent_internal,
        consent_public=testimonial_data.consent_public,
        status=testimonial_data.status,
        admin_note=testimonial_data.admin_note,
        sort_order=testimonial_data.sort_order
    )
    
    await AuditService.log(
        entity_type="testimonial",
        entity_id=testimonial.id,
        action=AuditAction.CREATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        after_state={"full_name": testimonial.full_name, "status": testimonial.status.value},
        ip_address=ip_address
    )
    
    return {"message": "Yorum oluşturuldu", "id": testimonial.id}


@router.put("/{testimonial_id}", response_model=TestimonialResponse)
async def update_testimonial(
    testimonial_id: str,
    request: Request,
    testimonial_data: TestimonialUpdate,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Update testimonial"""
    ip_address = request.client.host if request.client else None
    
    before = await TestimonialService.get_by_id(testimonial_id)
    if not before:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    
    update_kwargs = {}
    for field in testimonial_data.model_fields.keys():
        value = getattr(testimonial_data, field, None)
        if value is not None:
            update_kwargs[field] = value
    
    testimonial = await TestimonialService.update(testimonial_id, current_user.id, **update_kwargs)
    
    if not testimonial:
        raise HTTPException(status_code=400, detail="Güncelleme başarısız")
    
    await AuditService.log(
        entity_type="testimonial",
        entity_id=testimonial_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"status": before.get("status")},
        after_state={"status": testimonial.get("status")},
        ip_address=ip_address
    )
    
    return _format_response(testimonial)


@router.patch("/{testimonial_id}/status", response_model=TestimonialResponse)
async def update_status(
    testimonial_id: str,
    request: Request,
    status_data: TestimonialStatusUpdate,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Quick status change"""
    ip_address = request.client.host if request.client else None
    
    before = await TestimonialService.get_by_id(testimonial_id)
    if not before:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    
    testimonial = await TestimonialService.set_status(testimonial_id, status_data.status, current_user.id)
    
    if not testimonial:
        raise HTTPException(status_code=400, detail="Durum güncellenemedi")
    
    await AuditService.log(
        entity_type="testimonial",
        entity_id=testimonial_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"status": before.get("status")},
        after_state={"status": status_data.status},
        metadata={"action": "status_change"},
        ip_address=ip_address
    )
    
    return _format_response(testimonial)


@router.post("/bulk", response_model=dict)
async def bulk_action(
    request: Request,
    action_data: TestimonialBulkAction,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Perform bulk action on testimonials"""
    ip_address = request.client.host if request.client else None
    
    modified_count = await TestimonialService.bulk_action(
        action_data.ids,
        action_data.action,
        current_user.id
    )
    
    await AuditService.log(
        entity_type="testimonial",
        entity_id=None,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        after_state={"bulk_action": action_data.action, "ids": action_data.ids},
        metadata={"action": "bulk_action", "modified_count": modified_count},
        ip_address=ip_address
    )
    
    return {"message": f"{modified_count} yorum güncellendi", "modified_count": modified_count}


@router.patch("/reorder", response_model=dict)
async def reorder_testimonials(
    reorder_data: TestimonialReorder,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Reorder testimonials"""
    success = await TestimonialService.reorder([item.model_dump() for item in reorder_data.items])
    
    if not success:
        raise HTTPException(status_code=400, detail="Sıralama başarısız")
    
    return {"message": "Sıralama güncellendi"}


@router.post("/{testimonial_id}/archive", response_model=dict)
async def archive_testimonial(
    testimonial_id: str,
    request: Request,
    current_user: User = Depends(require_admin_manager)
):
    """Archive a testimonial (soft delete)"""
    ip_address = request.client.host if request.client else None
    
    testimonial = await TestimonialService.archive(testimonial_id)
    
    if not testimonial:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    
    await AuditService.log(
        entity_type="testimonial",
        entity_id=testimonial_id,
        action=AuditAction.DELETE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        metadata={"action": "archive"},
        ip_address=ip_address
    )
    
    return {"message": "Yorum arşivlendi"}


@router.post("/{testimonial_id}/restore", response_model=dict)
async def restore_testimonial(
    testimonial_id: str,
    request: Request,
    current_user: User = Depends(require_admin_manager)
):
    """Restore archived testimonial"""
    ip_address = request.client.host if request.client else None
    
    testimonial = await TestimonialService.restore(testimonial_id)
    
    if not testimonial:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    
    await AuditService.log(
        entity_type="testimonial",
        entity_id=testimonial_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        metadata={"action": "restore"},
        ip_address=ip_address
    )
    
    return {"message": "Yorum geri yüklendi"}


@router.delete("/{testimonial_id}", response_model=dict)
async def delete_testimonial(
    testimonial_id: str,
    request: Request,
    current_user: User = Depends(require_admin_manager)
):
    """Permanently delete testimonial"""
    ip_address = request.client.host if request.client else None
    
    testimonial = await TestimonialService.get_by_id(testimonial_id)
    if not testimonial:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    
    success = await TestimonialService.delete(testimonial_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Silme başarısız")
    
    await AuditService.log(
        entity_type="testimonial",
        entity_id=testimonial_id,
        action=AuditAction.DELETE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"full_name": testimonial.get("full_name")},
        ip_address=ip_address
    )
    
    return {"message": "Yorum kalıcı olarak silindi"}


@router.post("/upload-image", response_model=dict)
async def upload_pet_image(
    file: UploadFile = File(...),
    current_user: User = Depends(require_admin_manager_editor)
):
    """Upload pet image for testimonial"""
    # Check file extension
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Sadece JPG, PNG ve WebP dosyaları kabul edilir")
    
    # Read file and check size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Dosya boyutu 3MB'dan büyük olamaz")
    
    try:
        # Process image with PIL
        img = Image.open(io.BytesIO(content))
        
        # Strip EXIF data by creating a new image
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        # Resize if needed
        if max(img.size) > MAX_IMAGE_DIMENSION:
            img.thumbnail((MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION), Image.Resampling.LANCZOS)
        
        # Generate unique filename
        filename = f"{uuid.uuid4()}.jpg"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        # Save compressed
        img.save(filepath, "JPEG", quality=85, optimize=True)
        
        # Return URL path
        image_url = f"/uploads/testimonials/{filename}"
        
        return {"url": image_url, "filename": filename}
        
    except Exception as e:
        logger.error(f"Image processing error: {e}")
        raise HTTPException(status_code=400, detail="Görsel işlenemedi")


@router.post("/migrate", response_model=dict)
async def migrate_old_testimonials(
    current_user: User = Depends(require_admin_manager)
):
    """Migrate old testimonial format to new format"""
    migrated_count = await TestimonialService.migrate_old_format()
    return {"message": f"{migrated_count} eski yorum güncellendi"}
