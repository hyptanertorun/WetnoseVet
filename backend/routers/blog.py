from fastapi import APIRouter, HTTPException, Request, Depends, Query
from typing import Optional

from schemas.blog import (
    BlogPostCreate, BlogPostUpdate, BlogStatusUpdate,
    BlogPostResponse, BlogPostListResponse, BlogSEOResponse
)
from schemas.version import VersionResponse, VersionListResponse, RestoreVersionRequest
from services.blog_service import BlogService
from services.version_service import VersionService
from services.audit_service import AuditService
from middleware.auth import get_current_active_user
from middleware.rbac import require_admin_manager_editor
from models.user import User
from models.blog import BlogStatus
from models.audit import AuditAction
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/blog-posts", tags=["Admin Blog"])

def _format_post_response(post) -> BlogPostResponse:
    seo = None
    if post.seo:
        seo = BlogSEOResponse(
            meta_title=post.seo.meta_title if hasattr(post.seo, 'meta_title') else post.seo.get('meta_title'),
            meta_description=post.seo.meta_description if hasattr(post.seo, 'meta_description') else post.seo.get('meta_description'),
            og_image=post.seo.og_image if hasattr(post.seo, 'og_image') else post.seo.get('og_image')
        )
    
    return BlogPostResponse(
        id=post.id,
        title=post.title,
        slug=post.slug,
        excerpt=post.excerpt,
        cover_image_url=post.cover_image_url,
        cover_image_alt=post.cover_image_alt,
        content=post.content,
        category=post.category,
        tags=post.tags,
        seo=seo,
        status=post.status,
        published_at=post.published_at.isoformat() if post.published_at else None,
        archived_at=post.archived_at.isoformat() if post.archived_at else None,
        sort_order=post.sort_order,
        created_at=post.created_at.isoformat() if post.created_at else None,
        updated_at=post.updated_at.isoformat() if post.updated_at else None,
        created_by=post.created_by,
        updated_by=post.updated_by
    )

@router.get("", response_model=BlogPostListResponse)
async def get_blog_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[BlogStatus] = None,
    archived: bool = False,
    search: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Get paginated list of blog posts"""
    posts, total = await BlogService.get_list(
        page=page,
        page_size=limit,
        status=status,
        archived=archived,
        search=search,
        category=category
    )
    
    return BlogPostListResponse(
        posts=[_format_post_response(p) for p in posts],
        total=total
    )

@router.get("/{post_id}", response_model=BlogPostResponse)
async def get_blog_post(
    post_id: str,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Get single blog post by ID"""
    post = await BlogService.get_by_id(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog yazısı bulunamadı")
    return _format_post_response(post)

@router.post("", response_model=dict)
async def create_blog_post(
    request: Request,
    post_data: BlogPostCreate,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Create new blog post"""
    ip_address = request.client.host if request.client else None
    
    post = await BlogService.create(
        title=post_data.title,
        slug=post_data.slug,
        excerpt=post_data.excerpt,
        cover_image_url=post_data.cover_image_url,
        cover_image_alt=post_data.cover_image_alt,
        content=post_data.content,
        category=post_data.category,
        tags=post_data.tags,
        seo=post_data.seo.model_dump() if post_data.seo else None,
        status=post_data.status,
        sort_order=post_data.sort_order,
        created_by=current_user.id,
        ai_generated=post_data.ai_generated,
        ai_metadata=post_data.ai_metadata
    )
    
    if not post:
        raise HTTPException(status_code=400, detail="Blog yazısı oluşturulamadı")
    
    await AuditService.log(
        entity_type="blog_post",
        entity_id=post.id,
        action=AuditAction.CREATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        after_state={"title": post.title, "slug": post.slug, "status": post.status.value if hasattr(post.status, 'value') else post.status},
        ip_address=ip_address
    )
    
    return {"message": "Blog yazısı oluşturuldu", "id": post.id, "slug": post.slug}

@router.put("/{post_id}", response_model=BlogPostResponse)
async def update_blog_post(
    post_id: str,
    request: Request,
    post_data: BlogPostUpdate,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Update blog post"""
    ip_address = request.client.host if request.client else None
    
    before_post = await BlogService.get_by_id(post_id)
    if not before_post:
        raise HTTPException(status_code=404, detail="Blog yazısı bulunamadı")
    
    # Create version snapshot before update
    snapshot = {
        "title": before_post.title,
        "slug": before_post.slug,
        "excerpt": before_post.excerpt,
        "cover_image_url": before_post.cover_image_url,
        "cover_image_alt": before_post.cover_image_alt,
        "content": before_post.content,
        "category": before_post.category,
        "tags": before_post.tags,
        "seo": before_post.seo.model_dump() if hasattr(before_post.seo, 'model_dump') else before_post.seo,
        "status": before_post.status.value if hasattr(before_post.status, 'value') else before_post.status,
    }
    
    await VersionService.create_version(
        entity_type="blog_post",
        entity_id=post_id,
        snapshot=snapshot,
        created_by=current_user.id,
        created_by_email=current_user.email,
        change_reason="Güncelleme öncesi otomatik kayıt"
    )
    
    update_kwargs = {}
    for field in ['title', 'slug', 'excerpt', 'cover_image_url', 'cover_image_alt', 
                  'content', 'category', 'tags', 'sort_order']:
        value = getattr(post_data, field, None)
        if value is not None:
            update_kwargs[field] = value
    
    if post_data.seo:
        update_kwargs['seo'] = post_data.seo.model_dump()
    
    post = await BlogService.update(post_id, current_user.id, **update_kwargs)
    
    if not post:
        raise HTTPException(status_code=400, detail="Güncelleme başarısız")
    
    await AuditService.log(
        entity_type="blog_post",
        entity_id=post_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"title": before_post.title, "slug": before_post.slug},
        after_state={"title": post.title, "slug": post.slug},
        ip_address=ip_address
    )
    
    return _format_post_response(post)

@router.patch("/{post_id}/status", response_model=BlogPostResponse)
async def update_blog_post_status(
    post_id: str,
    request: Request,
    status_data: BlogStatusUpdate,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Publish or unpublish blog post"""
    ip_address = request.client.host if request.client else None
    
    before_post = await BlogService.get_by_id(post_id)
    if not before_post:
        raise HTTPException(status_code=404, detail="Blog yazısı bulunamadı")
    
    post = await BlogService.update_status(post_id, status_data.status, current_user.id)
    
    if not post:
        raise HTTPException(status_code=400, detail="Durum güncellenemedi")
    
    await AuditService.log(
        entity_type="blog_post",
        entity_id=post_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"status": before_post.status.value if hasattr(before_post.status, 'value') else before_post.status},
        after_state={"status": post.status.value if hasattr(post.status, 'value') else post.status},
        metadata={"action": "status_change"},
        ip_address=ip_address
    )
    
    return _format_post_response(post)

@router.delete("/{post_id}", response_model=dict)
async def delete_blog_post(
    post_id: str,
    request: Request,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Archive blog post"""
    ip_address = request.client.host if request.client else None
    
    before_post = await BlogService.get_by_id(post_id)
    if not before_post:
        raise HTTPException(status_code=404, detail="Blog yazısı bulunamadı")
    
    post = await BlogService.archive(post_id, current_user.id)
    
    if not post:
        raise HTTPException(status_code=400, detail="Arşivleme başarısız")
    
    await AuditService.log(
        entity_type="blog_post",
        entity_id=post_id,
        action=AuditAction.DELETE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"title": before_post.title, "archived": False},
        after_state={"archived": True},
        ip_address=ip_address
    )
    
    return {"message": "Blog yazısı arşivlendi"}

@router.post("/{post_id}/restore", response_model=BlogPostResponse)
async def restore_blog_post(
    post_id: str,
    request: Request,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Restore archived blog post"""
    ip_address = request.client.host if request.client else None
    
    post = await BlogService.restore(post_id, current_user.id)
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog yazısı bulunamadı")
    
    await AuditService.log(
        entity_type="blog_post",
        entity_id=post_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"archived": True},
        after_state={"archived": False},
        metadata={"action": "restore"},
        ip_address=ip_address
    )
    
    return _format_post_response(post)

# --- Version History Endpoints ---

@router.get("/{post_id}/versions", response_model=VersionListResponse)
async def get_blog_post_versions(
    post_id: str,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Get version history for a blog post"""
    post = await BlogService.get_by_id(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog yazısı bulunamadı")
    
    versions = await VersionService.get_versions("blog_post", post_id)
    total = await VersionService.get_version_count("blog_post", post_id)
    
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

@router.post("/{post_id}/versions/{version_id}/restore", response_model=BlogPostResponse)
async def restore_blog_post_version(
    post_id: str,
    version_id: str,
    request: Request,
    restore_data: RestoreVersionRequest = None,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Restore blog post to a previous version"""
    ip_address = request.client.host if request.client else None
    
    current_post = await BlogService.get_by_id(post_id)
    if not current_post:
        raise HTTPException(status_code=404, detail="Blog yazısı bulunamadı")
    
    version = await VersionService.get_version_by_id(version_id)
    if not version or version.entity_id != post_id:
        raise HTTPException(status_code=404, detail="Versiyon bulunamadı")
    
    # Create snapshot before restore
    current_snapshot = {
        "title": current_post.title,
        "slug": current_post.slug,
        "excerpt": current_post.excerpt,
        "cover_image_url": current_post.cover_image_url,
        "cover_image_alt": current_post.cover_image_alt,
        "content": current_post.content,
        "category": current_post.category,
        "tags": current_post.tags,
        "seo": current_post.seo.model_dump() if hasattr(current_post.seo, 'model_dump') else current_post.seo,
        "status": current_post.status.value if hasattr(current_post.status, 'value') else current_post.status,
    }
    
    await VersionService.create_version(
        entity_type="blog_post",
        entity_id=post_id,
        snapshot=current_snapshot,
        created_by=current_user.id,
        created_by_email=current_user.email,
        change_reason=f"v{version.version_no} versiyonuna geri yükleme öncesi otomatik kayıt"
    )
    
    # Apply version snapshot
    snapshot = version.snapshot
    update_kwargs = {}
    for field in ['title', 'excerpt', 'cover_image_url', 'cover_image_alt', 
                  'content', 'category', 'tags']:
        if field in snapshot:
            update_kwargs[field] = snapshot[field]
    
    if 'seo' in snapshot and snapshot['seo']:
        update_kwargs['seo'] = snapshot['seo']
    
    post = await BlogService.update(post_id, current_user.id, **update_kwargs)
    
    if not post:
        raise HTTPException(status_code=400, detail="Geri yükleme başarısız")
    
    await AuditService.log(
        entity_type="blog_post",
        entity_id=post_id,
        action=AuditAction.UPDATE,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role.value,
        before_state={"version": "current"},
        after_state={"version": version.version_no, "restored_from": version_id},
        metadata={"action": "version_restore", "restored_version": version.version_no},
        ip_address=ip_address
    )
    
    return _format_post_response(post)



# ===========================================
# PUBLIC BLOG ENDPOINTS (No Auth Required)
# ===========================================

public_blog_router = APIRouter(prefix="/public/blog", tags=["Public Blog"])

@public_blog_router.get("")
async def get_public_blog_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = None
):
    """Get published blog posts for public view"""
    posts, total = await BlogService.get_published(page=page, page_size=limit, category=category)
    return {
        "posts": [_format_post_response(p) for p in posts],
        "total": total,
        "page": page,
        "limit": limit
    }

@public_blog_router.get("/{slug}")
async def get_public_blog_post(slug: str):
    """Get a single blog post by slug"""
    post = await BlogService.get_published_by_slug(slug)
    if not post:
        raise HTTPException(status_code=404, detail="Yazı bulunamadı")
    
    return _format_post_response(post)

