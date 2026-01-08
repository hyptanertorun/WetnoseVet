from fastapi import APIRouter, HTTPException, status, Request, Depends, Query
from typing import Optional

from schemas.team import (
    TeamMemberCreate, TeamMemberUpdate, TeamMemberStatusUpdate,
    TeamMemberReorderRequest, TeamMemberResponse, TeamMemberListResponse
)
from schemas.version import VersionResponse, VersionListResponse, RestoreVersionRequest
from services.team_service import TeamService
from services.version_service import VersionService
from services.audit_service import AuditService
from middleware.auth import get_current_active_user
from middleware.rbac import require_admin_manager_editor
from models.user import User
from models.service import ContentStatus
from models.audit import AuditAction
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/team-members", tags=["Admin Team"])

def _format_member_response(member) -> TeamMemberResponse:
    return TeamMemberResponse(
        id=member.id,
        full_name=member.full_name,
        slug=member.slug,
        role_title=member.role_title,
        department=getattr(member, 'department', None),
        specialties=member.specialties,
        bio=member.bio,
        short_bio=getattr(member, 'short_bio', None),
        photo_url=member.photo_url,
        photo_alt=member.photo_alt,
        photo_thumbnail=getattr(member, 'photo_thumbnail', None),
        email=getattr(member, 'email', None),
        phone=getattr(member, 'phone', None),
        social_links=member.social_links,
        experience=member.experience,
        experience_years=getattr(member, 'experience_years', None),
        quote=member.quote,
        education=getattr(member, 'education', []) or [],
        certifications=getattr(member, 'certifications', []) or [],
        working_schedule=getattr(member, 'working_schedule', None),
        accepts_appointments=getattr(member, 'accepts_appointments', True),
        is_owner=member.is_owner,
        is_featured=getattr(member, 'is_featured', False),
        show_contact_info=getattr(member, 'show_contact_info', True),
        status=member.status,
        sort_order=member.sort_order,
        archived_at=member.archived_at.isoformat() if member.archived_at else None,
        created_at=member.created_at.isoformat() if member.created_at else None,
        updated_at=member.updated_at.isoformat() if member.updated_at else None,
        created_by=member.created_by,
        updated_by=member.updated_by
    )

@router.get("", response_model=TeamMemberListResponse)
async def get_team_members(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[ContentStatus] = None,
    archived: bool = False,
    search: Optional[str] = None,
    is_owner: Optional[bool] = None,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Get list of team members (Admin/Manager/Editor)"""
    members, total = await TeamService.get_list(
        page=page,
        page_size=limit,
        status=status,
        archived=archived,
        search=search,
        is_owner=is_owner
    )
    
    return TeamMemberListResponse(
        team_members=[_format_member_response(m) for m in members],
        total=total,
        page=page,
        page_size=limit
    )

@router.get("/{member_id}", response_model=TeamMemberResponse)
async def get_team_member(
    member_id: str,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Get team member by ID"""
    member = await TeamService.get_by_id(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Ekip üyesi bulunamadı")
    return _format_member_response(member)

@router.post("", response_model=dict)
async def create_team_member(
    request: Request,
    member_data: TeamMemberCreate,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Create a new team member"""
    ip_address = request.client.host if request.client else None
    
    member = await TeamService.create(
        full_name=member_data.full_name,
        slug=member_data.slug,
        role_title=member_data.role_title,
        department=member_data.department,
        specialties=member_data.specialties,
        bio=member_data.bio,
        short_bio=member_data.short_bio,
        photo_url=member_data.photo_url,
        photo_alt=member_data.photo_alt,
        photo_thumbnail=member_data.photo_thumbnail,
        email=member_data.email,
        phone=member_data.phone,
        social_links=member_data.social_links.model_dump() if member_data.social_links else None,
        experience=member_data.experience,
        experience_years=member_data.experience_years,
        quote=member_data.quote,
        education=[e.model_dump() for e in member_data.education] if member_data.education else [],
        certifications=[c.model_dump() for c in member_data.certifications] if member_data.certifications else [],
        working_schedule=member_data.working_schedule.model_dump() if member_data.working_schedule else None,
        accepts_appointments=member_data.accepts_appointments,
        is_owner=member_data.is_owner,
        is_featured=member_data.is_featured,
        show_contact_info=member_data.show_contact_info,
        status=member_data.status,
        sort_order=member_data.sort_order,
        created_by=current_user.id
    )
    
    if not member:
        raise HTTPException(status_code=400, detail="Ekip üyesi oluşturulamadı")
    
    await AuditService.log(
        entity_type="team_member",
        entity_id=member.id,
        action=AuditAction.CREATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        after_state={"full_name": member.full_name, "slug": member.slug, "status": member.status.value},
        ip_address=ip_address
    )
    
    return {"message": "Ekip üyesi oluşturuldu", "id": member.id, "slug": member.slug}

@router.put("/{member_id}", response_model=TeamMemberResponse)
async def update_team_member(
    member_id: str,
    request: Request,
    member_data: TeamMemberUpdate,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Update team member"""
    ip_address = request.client.host if request.client else None
    
    before_member = await TeamService.get_by_id(member_id)
    if not before_member:
        raise HTTPException(status_code=404, detail="Ekip üyesi bulunamadı")
    
    # Create version snapshot before update
    snapshot = {
        "full_name": before_member.full_name,
        "slug": before_member.slug,
        "role_title": before_member.role_title,
        "specialties": before_member.specialties,
        "bio": before_member.bio,
        "photo_url": before_member.photo_url,
        "photo_alt": before_member.photo_alt,
        "social_links": before_member.social_links.model_dump() if hasattr(before_member.social_links, 'model_dump') else before_member.social_links,
        "experience": before_member.experience,
        "quote": before_member.quote,
        "is_owner": before_member.is_owner,
        "status": before_member.status.value if hasattr(before_member.status, 'value') else before_member.status,
    }
    
    await VersionService.create_version(
        entity_type="team_member",
        entity_id=member_id,
        snapshot=snapshot,
        created_by=current_user.id,
        created_by_email=current_user.email,
        change_reason="Güncelleme öncesi otomatik kayıt"
    )
    
    update_kwargs = {}
    for field in ['full_name', 'slug', 'role_title', 'department', 'specialties', 'bio', 'short_bio',
                  'photo_url', 'photo_alt', 'photo_thumbnail', 'email', 'phone',
                  'experience', 'experience_years', 'quote', 'accepts_appointments',
                  'is_owner', 'is_featured', 'show_contact_info', 'sort_order']:
        value = getattr(member_data, field, None)
        if value is not None:
            update_kwargs[field] = value
    
    if member_data.social_links:
        update_kwargs['social_links'] = member_data.social_links.model_dump()
    
    if member_data.education is not None:
        update_kwargs['education'] = [e.model_dump() for e in member_data.education]
    
    if member_data.certifications is not None:
        update_kwargs['certifications'] = [c.model_dump() for c in member_data.certifications]
    
    if member_data.working_schedule is not None:
        update_kwargs['working_schedule'] = member_data.working_schedule.model_dump()
    
    member = await TeamService.update(member_id, current_user.id, **update_kwargs)
    
    if not member:
        raise HTTPException(status_code=400, detail="Güncelleme başarısız, slug zaten kullanılıyor olabilir")
    
    await AuditService.log(
        entity_type="team_member",
        entity_id=member_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"full_name": before_member.full_name, "slug": before_member.slug},
        after_state={"full_name": member.full_name, "slug": member.slug},
        ip_address=ip_address
    )
    
    return _format_member_response(member)

@router.patch("/{member_id}/status", response_model=TeamMemberResponse)
async def update_team_member_status(
    member_id: str,
    request: Request,
    status_data: TeamMemberStatusUpdate,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Publish or unpublish team member"""
    ip_address = request.client.host if request.client else None
    
    before_member = await TeamService.get_by_id(member_id)
    if not before_member:
        raise HTTPException(status_code=404, detail="Ekip üyesi bulunamadı")
    
    member = await TeamService.update_status(member_id, status_data.status, current_user.id)
    
    if not member:
        raise HTTPException(status_code=400, detail="Durum güncellenemedi")
    
    await AuditService.log(
        entity_type="team_member",
        entity_id=member_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"status": before_member.status.value},
        after_state={"status": member.status.value},
        metadata={"action": "status_change"},
        ip_address=ip_address
    )
    
    return _format_member_response(member)

@router.patch("/reorder", response_model=dict)
async def reorder_team_members(
    request: Request,
    reorder_data: TeamMemberReorderRequest,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Bulk reorder team members"""
    ip_address = request.client.host if request.client else None
    
    items = [item.model_dump() for item in reorder_data.items]
    success = await TeamService.reorder(items, current_user.id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Sıralama başarısız")
    
    await AuditService.log(
        entity_type="team_member",
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        metadata={"action": "reorder", "item_count": len(items)},
        ip_address=ip_address
    )
    
    return {"message": "Sıralama güncellendi"}

@router.delete("/{member_id}", response_model=dict)
async def delete_team_member(
    member_id: str,
    request: Request,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Soft delete (archive) team member"""
    ip_address = request.client.host if request.client else None
    
    before_member = await TeamService.get_by_id(member_id)
    if not before_member:
        raise HTTPException(status_code=404, detail="Ekip üyesi bulunamadı")
    
    member = await TeamService.archive(member_id, current_user.id)
    
    if not member:
        raise HTTPException(status_code=400, detail="Arşivleme başarısız")
    
    await AuditService.log(
        entity_type="team_member",
        entity_id=member_id,
        action=AuditAction.DELETE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"full_name": before_member.full_name, "archived": False},
        after_state={"archived": True},
        ip_address=ip_address
    )
    
    return {"message": "Ekip üyesi arşivlendi"}

@router.post("/{member_id}/restore", response_model=TeamMemberResponse)
async def restore_team_member(
    member_id: str,
    request: Request,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Restore archived team member"""
    ip_address = request.client.host if request.client else None
    
    member = await TeamService.restore(member_id, current_user.id)
    
    if not member:
        raise HTTPException(status_code=404, detail="Ekip üyesi bulunamadı veya geri yüklenemedi")
    
    await AuditService.log(
        entity_type="team_member",
        entity_id=member_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"archived": True},
        after_state={"archived": False},
        metadata={"action": "restore"},
        ip_address=ip_address
    )
    
    return _format_member_response(member)

# --- Version History Endpoints ---

@router.get("/{member_id}/versions", response_model=VersionListResponse)
async def get_team_member_versions(
    member_id: str,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Get version history for a team member"""
    member = await TeamService.get_by_id(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Ekip üyesi bulunamadı")
    
    versions = await VersionService.get_versions("team_member", member_id)
    total = await VersionService.get_version_count("team_member", member_id)
    
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

@router.post("/{member_id}/versions/{version_id}/restore", response_model=TeamMemberResponse)
async def restore_team_member_version(
    member_id: str,
    version_id: str,
    request: Request,
    restore_data: RestoreVersionRequest = None,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Restore team member to a previous version"""
    ip_address = request.client.host if request.client else None
    
    # Get current member
    current_member = await TeamService.get_by_id(member_id)
    if not current_member:
        raise HTTPException(status_code=404, detail="Ekip üyesi bulunamadı")
    
    # Get version to restore
    version = await VersionService.get_version_by_id(version_id)
    if not version or version.entity_id != member_id:
        raise HTTPException(status_code=404, detail="Versiyon bulunamadı")
    
    # Create snapshot of current state before restore
    current_snapshot = {
        "full_name": current_member.full_name,
        "slug": current_member.slug,
        "role_title": current_member.role_title,
        "specialties": current_member.specialties,
        "bio": current_member.bio,
        "photo_url": current_member.photo_url,
        "photo_alt": current_member.photo_alt,
        "social_links": current_member.social_links.model_dump() if hasattr(current_member.social_links, 'model_dump') else current_member.social_links,
        "experience": current_member.experience,
        "quote": current_member.quote,
        "is_owner": current_member.is_owner,
        "status": current_member.status.value if hasattr(current_member.status, 'value') else current_member.status,
    }
    
    await VersionService.create_version(
        entity_type="team_member",
        entity_id=member_id,
        snapshot=current_snapshot,
        created_by=current_user.id,
        created_by_email=current_user.email,
        change_reason=f"v{version.version_no} versiyonuna geri yükleme öncesi otomatik kayıt"
    )
    
    # Apply version snapshot to member
    snapshot = version.snapshot
    update_kwargs = {}
    for field in ['full_name', 'role_title', 'specialties', 'bio', 'photo_url',
                  'photo_alt', 'experience', 'quote', 'is_owner']:
        if field in snapshot:
            update_kwargs[field] = snapshot[field]
    
    if 'social_links' in snapshot and snapshot['social_links']:
        update_kwargs['social_links'] = snapshot['social_links']
    
    member = await TeamService.update(member_id, current_user.id, **update_kwargs)
    
    if not member:
        raise HTTPException(status_code=400, detail="Geri yükleme başarısız")
    
    # Audit log
    await AuditService.log(
        entity_type="team_member",
        entity_id=member_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"version": "current"},
        after_state={"version": version.version_no, "restored_from": version_id},
        metadata={"action": "version_restore", "restored_version": version.version_no},
        ip_address=ip_address
    )
    
    return _format_member_response(member)



# ===========================================
# PUBLIC TEAM ENDPOINTS (No Auth Required)
# ===========================================

public_team_router = APIRouter(prefix="/public/team", tags=["Public Team"])

@public_team_router.get("")
async def get_public_team_members():
    """Get all active team members for public view"""
    members = await TeamService.get_published()
    return [_format_member_response(m) for m in members]

@public_team_router.get("/{slug}")
async def get_public_team_member(slug: str):
    """Get a single team member by slug"""
    member = await TeamService.get_published_by_slug(slug)
    if not member:
        raise HTTPException(status_code=404, detail="Ekip üyesi bulunamadı")
    return _format_member_response(member)

