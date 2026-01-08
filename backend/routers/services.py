from fastapi import APIRouter, HTTPException, status, Request, Depends, Query
from typing import Optional

from schemas.service import (
    ServiceCreate, ServiceUpdate, ServiceStatusUpdate,
    ServiceReorderRequest, ServiceResponse, ServiceListResponse
)
from schemas.version import VersionResponse, VersionListResponse, RestoreVersionRequest
from services.service_service import ServiceService
from services.version_service import VersionService
from services.audit_service import AuditService
from middleware.auth import get_current_active_user
from middleware.rbac import require_admin_manager_editor
from models.user import User
from models.service import ContentStatus
from models.audit import AuditAction
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/services", tags=["Admin Services"])

def _format_service_response(service) -> ServiceResponse:
    return ServiceResponse(
        id=service.id,
        title=service.title,
        slug=service.slug,
        short_description=service.short_description,
        long_description=service.long_description,
        cover_image_url=service.cover_image_url,
        cover_image_alt=service.cover_image_alt,
        icon=service.icon,
        price_mode=service.price_mode,
        price_value=service.price_value,
        tags=service.tags,
        category=service.category,
        seo=service.seo,
        status=service.status,
        sort_order=service.sort_order,
        archived_at=service.archived_at.isoformat() if service.archived_at else None,
        created_at=service.created_at.isoformat() if service.created_at else None,
        updated_at=service.updated_at.isoformat() if service.updated_at else None,
        created_by=service.created_by,
        updated_by=service.updated_by
    )

@router.get("", response_model=ServiceListResponse)
async def get_services(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[ContentStatus] = None,
    archived: bool = False,
    search: Optional[str] = None,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Get list of services (Admin/Manager/Editor)"""
    services, total = await ServiceService.get_list(
        page=page,
        page_size=limit,
        status=status,
        archived=archived,
        search=search
    )
    
    return ServiceListResponse(
        services=[_format_service_response(s) for s in services],
        total=total,
        page=page,
        page_size=limit
    )

@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service(
    service_id: str,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Get service by ID"""
    service = await ServiceService.get_by_id(service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Hizmet bulunamadı")
    return _format_service_response(service)

@router.post("", response_model=dict)
async def create_service(
    request: Request,
    service_data: ServiceCreate,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Create a new service"""
    ip_address = request.client.host if request.client else None
    
    service = await ServiceService.create(
        title=service_data.title,
        slug=service_data.slug,
        short_description=service_data.short_description,
        long_description=service_data.long_description,
        cover_image_url=service_data.cover_image_url,
        cover_image_alt=service_data.cover_image_alt,
        icon=service_data.icon,
        price_mode=service_data.price_mode,
        price_value=service_data.price_value,
        tags=service_data.tags,
        category=service_data.category,
        seo=service_data.seo.model_dump() if service_data.seo else None,
        status=service_data.status,
        sort_order=service_data.sort_order,
        created_by=current_user.id
    )
    
    if not service:
        raise HTTPException(status_code=400, detail="Hizmet oluşturulamadı")
    
    await AuditService.log(
        entity_type="service",
        entity_id=service.id,
        action=AuditAction.CREATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        after_state={"title": service.title, "slug": service.slug, "status": service.status.value},
        ip_address=ip_address
    )
    
    return {"message": "Hizmet oluşturuldu", "id": service.id, "slug": service.slug}

@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: str,
    request: Request,
    service_data: ServiceUpdate,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Update service"""
    ip_address = request.client.host if request.client else None
    
    before_service = await ServiceService.get_by_id(service_id)
    if not before_service:
        raise HTTPException(status_code=404, detail="Hizmet bulunamadı")
    
    # Create version snapshot before update
    snapshot = {
        "title": before_service.title,
        "slug": before_service.slug,
        "short_description": before_service.short_description,
        "long_description": before_service.long_description,
        "cover_image_url": before_service.cover_image_url,
        "cover_image_alt": before_service.cover_image_alt,
        "icon": before_service.icon,
        "price_mode": before_service.price_mode.value if hasattr(before_service.price_mode, 'value') else before_service.price_mode,
        "price_value": before_service.price_value,
        "tags": before_service.tags,
        "category": before_service.category,
        "seo": before_service.seo.model_dump() if hasattr(before_service.seo, 'model_dump') else before_service.seo,
        "status": before_service.status.value if hasattr(before_service.status, 'value') else before_service.status,
    }
    
    await VersionService.create_version(
        entity_type="service",
        entity_id=service_id,
        snapshot=snapshot,
        created_by=current_user.id,
        created_by_email=current_user.email,
        change_reason="Güncelleme öncesi otomatik kayıt"
    )
    
    update_kwargs = {}
    for field in ['title', 'slug', 'short_description', 'long_description', 'cover_image_url', 
                  'cover_image_alt', 'icon', 'price_mode', 'price_value', 'tags', 'category', 'sort_order']:
        value = getattr(service_data, field, None)
        if value is not None:
            update_kwargs[field] = value
    
    if service_data.seo:
        update_kwargs['seo'] = service_data.seo.model_dump()
    
    service = await ServiceService.update(service_id, current_user.id, **update_kwargs)
    
    if not service:
        raise HTTPException(status_code=400, detail="Güncelleme başarısız, slug zaten kullanılıyor olabilir")
    
    await AuditService.log(
        entity_type="service",
        entity_id=service_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"title": before_service.title, "slug": before_service.slug},
        after_state={"title": service.title, "slug": service.slug},
        ip_address=ip_address
    )
    
    return _format_service_response(service)

@router.patch("/{service_id}/status", response_model=ServiceResponse)
async def update_service_status(
    service_id: str,
    request: Request,
    status_data: ServiceStatusUpdate,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Publish or unpublish service"""
    ip_address = request.client.host if request.client else None
    
    before_service = await ServiceService.get_by_id(service_id)
    if not before_service:
        raise HTTPException(status_code=404, detail="Hizmet bulunamadı")
    
    service = await ServiceService.update_status(service_id, status_data.status, current_user.id)
    
    if not service:
        raise HTTPException(status_code=400, detail="Durum güncellenemedi")
    
    await AuditService.log(
        entity_type="service",
        entity_id=service_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"status": before_service.status.value},
        after_state={"status": service.status.value},
        metadata={"action": "status_change"},
        ip_address=ip_address
    )
    
    return _format_service_response(service)

@router.patch("/reorder", response_model=dict)
async def reorder_services(
    request: Request,
    reorder_data: ServiceReorderRequest,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Bulk reorder services"""
    ip_address = request.client.host if request.client else None
    
    items = [item.model_dump() for item in reorder_data.items]
    success = await ServiceService.reorder(items, current_user.id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Sıralama başarısız")
    
    await AuditService.log(
        entity_type="service",
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        metadata={"action": "reorder", "item_count": len(items)},
        ip_address=ip_address
    )
    
    return {"message": "Sıralama güncellendi"}

@router.delete("/{service_id}", response_model=dict)
async def delete_service(
    service_id: str,
    request: Request,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Soft delete (archive) service"""
    ip_address = request.client.host if request.client else None
    
    before_service = await ServiceService.get_by_id(service_id)
    if not before_service:
        raise HTTPException(status_code=404, detail="Hizmet bulunamadı")
    
    service = await ServiceService.archive(service_id, current_user.id)
    
    if not service:
        raise HTTPException(status_code=400, detail="Arşivleme başarısız")
    
    await AuditService.log(
        entity_type="service",
        entity_id=service_id,
        action=AuditAction.DELETE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"title": before_service.title, "archived": False},
        after_state={"archived": True},
        ip_address=ip_address
    )
    
    return {"message": "Hizmet arşivlendi"}

@router.post("/{service_id}/restore", response_model=ServiceResponse)
async def restore_service(
    service_id: str,
    request: Request,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Restore archived service"""
    ip_address = request.client.host if request.client else None
    
    service = await ServiceService.restore(service_id, current_user.id)
    
    if not service:
        raise HTTPException(status_code=404, detail="Hizmet bulunamadı veya geri yüklenemedi")
    
    await AuditService.log(
        entity_type="service",
        entity_id=service_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"archived": True},
        after_state={"archived": False},
        metadata={"action": "restore"},
        ip_address=ip_address
    )
    
    return _format_service_response(service)

# --- Version History Endpoints ---

@router.get("/{service_id}/versions", response_model=VersionListResponse)
async def get_service_versions(
    service_id: str,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Get version history for a service"""
    service = await ServiceService.get_by_id(service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Hizmet bulunamadı")
    
    versions = await VersionService.get_versions("service", service_id)
    total = await VersionService.get_version_count("service", service_id)
    
    return VersionListResponse(
        versions=[
            VersionResponse(
                id=v.id,
                entity_type=v.entity_type,
                entity_id=v.entity_id,
                version_no=v.version_no,
                snapshot=v.snapshot,
                change_reason=v.change_reason,
                created_at=v.created_at.isoformat() if hasattr(v.created_at, 'isoformat') else str(v.created_at),
                created_by=v.created_by,
                created_by_email=v.created_by_email
            ) for v in versions
        ],
        total=total
    )

@router.post("/{service_id}/versions/{version_id}/restore", response_model=ServiceResponse)
async def restore_service_version(
    service_id: str,
    version_id: str,
    request: Request,
    restore_data: RestoreVersionRequest = None,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Restore service to a previous version"""
    ip_address = request.client.host if request.client else None
    
    # Get current service
    current_service = await ServiceService.get_by_id(service_id)
    if not current_service:
        raise HTTPException(status_code=404, detail="Hizmet bulunamadı")
    
    # Get version to restore
    version = await VersionService.get_version_by_id(version_id)
    if not version or version.entity_id != service_id:
        raise HTTPException(status_code=404, detail="Versiyon bulunamadı")
    
    # Create snapshot of current state before restore
    current_snapshot = {
        "title": current_service.title,
        "slug": current_service.slug,
        "short_description": current_service.short_description,
        "long_description": current_service.long_description,
        "cover_image_url": current_service.cover_image_url,
        "cover_image_alt": current_service.cover_image_alt,
        "icon": current_service.icon,
        "price_mode": current_service.price_mode.value if hasattr(current_service.price_mode, 'value') else current_service.price_mode,
        "price_value": current_service.price_value,
        "tags": current_service.tags,
        "category": current_service.category,
        "seo": current_service.seo.model_dump() if hasattr(current_service.seo, 'model_dump') else current_service.seo,
        "status": current_service.status.value if hasattr(current_service.status, 'value') else current_service.status,
    }
    
    await VersionService.create_version(
        entity_type="service",
        entity_id=service_id,
        snapshot=current_snapshot,
        created_by=current_user.id,
        created_by_email=current_user.email,
        change_reason=f"v{version.version_no} versiyonuna geri yükleme öncesi otomatik kayıt"
    )
    
    # Apply version snapshot to service
    snapshot = version.snapshot
    update_kwargs = {}
    for field in ['title', 'short_description', 'long_description', 'cover_image_url', 
                  'cover_image_alt', 'icon', 'price_mode', 'price_value', 'tags', 'category']:
        if field in snapshot:
            update_kwargs[field] = snapshot[field]
    
    if 'seo' in snapshot and snapshot['seo']:
        update_kwargs['seo'] = snapshot['seo']
    
    service = await ServiceService.update(service_id, current_user.id, **update_kwargs)
    
    if not service:
        raise HTTPException(status_code=400, detail="Geri yükleme başarısız")
    
    # Audit log
    await AuditService.log(
        entity_type="service",
        entity_id=service_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"version": "current"},
        after_state={"version": version.version_no, "restored_from": version_id},
        metadata={"action": "version_restore", "restored_version": version.version_no},
        ip_address=ip_address
    )
    
    return _format_service_response(service)



# ===========================================
# PUBLIC SERVICES ENDPOINTS (No Auth Required)
# ===========================================

public_services_router = APIRouter(prefix="/public/services", tags=["Public Services"])

@public_services_router.get("")
async def get_public_services():
    """Get all active services for public view"""
    services = await ServiceService.get_published()
    return {"services": [_format_service_response(s) for s in services]}

@public_services_router.get("/{slug}")
async def get_public_service(slug: str):
    """Get a single service by slug"""
    service = await ServiceService.get_published_by_slug(slug)
    if not service:
        raise HTTPException(status_code=404, detail="Hizmet bulunamadı")
    return _format_service_response(service)

