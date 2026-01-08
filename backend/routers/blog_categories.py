from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime, timezone
from models.blog_category import (
    BlogCategory, BlogCategoryCreate, BlogCategoryUpdate, 
    BlogCategorySEO, slugify_turkish
)
from middleware.auth import get_current_user, get_current_active_user
from middleware.rbac import require_admin_manager_editor, require_admin_or_manager, check_role
from services.audit_service import AuditService
from db.mongodb import get_database
import uuid

router = APIRouter(prefix="/admin/blog/categories", tags=["Blog Categories"])

@router.get("")
async def get_categories(
    include_deleted: bool = Query(False, description="Include archived categories"),
    search: Optional[str] = Query(None, description="Search by name"),
    active_only: bool = Query(False, description="Filter active only"),
    current_user = Depends(get_current_active_user)
):
    """Get all blog categories."""
    db = get_database()
    query = {}
    
    if not include_deleted:
        query["is_deleted"] = {"$ne": True}
    
    if active_only:
        query["is_active"] = True
    
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    
    categories = await db.blog_categories.find(query, {"_id": 0}).sort("order", 1).to_list(1000)
    
    # Get post counts for each category
    for cat in categories:
        post_count = await db.blog_posts.count_documents({
            "category": cat.get("name"),
            "archived_at": None
        })
        cat["post_count"] = post_count
    
    return {"categories": categories, "total": len(categories)}

@router.get("/{category_id}")
async def get_category(
    category_id: str,
    current_user = Depends(get_current_active_user)
):
    """Get a single category by ID."""
    db = get_database()
    category = await db.blog_categories.find_one({"id": category_id}, {"_id": 0})
    
    if not category:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")
    
    # Get post count
    post_count = await db.blog_posts.count_documents({
        "category": category.get("name"),
        "archived_at": None
    })
    category["post_count"] = post_count
    
    return category

@router.post("")
async def create_category(
    data: BlogCategoryCreate,
    current_user = Depends(require_admin_manager_editor)
):
    """Create a new blog category."""
    db = get_database()
    
    # Generate slug if not provided
    slug = data.slug if data.slug else slugify_turkish(data.name)
    
    # Check for duplicate slug (only among non-deleted)
    existing = await db.blog_categories.find_one({
        "slug": slug,
        "is_deleted": {"$ne": True}
    })
    
    if existing:
        raise HTTPException(
            status_code=409, 
            detail=f"Bu slug zaten kullanımda: '{slug}'. Farklı bir isim veya slug deneyin."
        )
    
    # Check for duplicate name
    existing_name = await db.blog_categories.find_one({
        "name": {"$regex": f"^{data.name}$", "$options": "i"},
        "is_deleted": {"$ne": True}
    })
    
    if existing_name:
        raise HTTPException(
            status_code=409, 
            detail=f"Bu isimde bir kategori zaten mevcut: '{data.name}'"
        )
    
    category = BlogCategory(
        id=str(uuid.uuid4()),
        name=data.name.strip(),
        slug=slug,
        description=data.description.strip() if data.description else None,
        seo=data.seo,
        order=data.order,
        is_active=data.is_active,
        created_by=current_user.id
    )
    
    await db.blog_categories.insert_one(category.to_dict())
    
    # Audit log
    await AuditService.log(
        action="create",
        resource_type="blog_category",
        resource_id=category.id,
        user_id=current_user.id,
        details={"name": category.name, "slug": category.slug}
    )
    
    return category.to_dict()

@router.patch("/{category_id}")
async def update_category(
    category_id: str,
    data: BlogCategoryUpdate,
    current_user = Depends(require_admin_manager_editor)
):
    """Update a blog category."""
    db = get_database()
    category = await db.blog_categories.find_one({"id": category_id}, {"_id": 0})
    
    if not category:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")
    
    if category.get("is_deleted"):
        raise HTTPException(status_code=400, detail="Arşivlenmiş kategori düzenlenemez")
    
    update_data = {}
    old_name = category.get("name")
    
    if data.name is not None:
        update_data["name"] = data.name.strip()
        # Auto-update slug if name changed and slug not provided
        if data.slug is None:
            update_data["slug"] = slugify_turkish(data.name)
    
    if data.slug is not None:
        new_slug = slugify_turkish(data.slug) if data.slug else slugify_turkish(data.name or category.get("name"))
        # Check for duplicate slug
        existing = await db.blog_categories.find_one({
            "slug": new_slug,
            "id": {"$ne": category_id},
            "is_deleted": {"$ne": True}
        })
        if existing:
            raise HTTPException(
                status_code=409, 
                detail=f"Bu slug zaten kullanımda: '{new_slug}'"
            )
        update_data["slug"] = new_slug
    
    if data.description is not None:
        update_data["description"] = data.description.strip() if data.description else None
    
    if data.seo is not None:
        update_data["seo"] = data.seo.model_dump() if data.seo else None
    
    if data.order is not None:
        update_data["order"] = data.order
    
    if data.is_active is not None:
        update_data["is_active"] = data.is_active
    
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        update_data["updated_by"] = current_user.id
        
        await db.blog_categories.update_one(
            {"id": category_id},
            {"$set": update_data}
        )
        
        # If name changed, update all blog posts with this category
        new_name = update_data.get("name")
        if new_name and new_name != old_name:
            await db.blog_posts.update_many(
                {"category": old_name},
                {"$set": {"category": new_name}}
            )
        
        # Audit log
        await AuditService.log(
            action="update",
            resource_type="blog_category",
            resource_id=category_id,
            user_id=current_user.id,
            details={"changes": update_data}
        )
    
    updated = await db.blog_categories.find_one({"id": category_id}, {"_id": 0})
    return updated

@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    force: bool = Query(False, description="Force archive even if posts exist"),
    current_user = Depends(require_admin_or_manager)
):
    """Soft delete (archive) a blog category."""
    db = get_database()
    category = await db.blog_categories.find_one({"id": category_id}, {"_id": 0})
    
    if not category:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")
    
    if category.get("is_deleted"):
        raise HTTPException(status_code=400, detail="Kategori zaten arşivlenmiş")
    
    # Check if category has posts
    post_count = await db.blog_posts.count_documents({
        "category": category.get("name"),
        "archived_at": None
    })
    
    if post_count > 0 and not force:
        raise HTTPException(
            status_code=409,
            detail=f"Bu kategoride {post_count} yazı bulunuyor. Önce yazıları başka kategoriye taşıyın veya 'force=true' parametresi ile arşivleyin."
        )
    
    # Soft delete
    await db.blog_categories.update_one(
        {"id": category_id},
        {"$set": {
            "is_deleted": True,
            "deleted_at": datetime.now(timezone.utc).isoformat(),
            "updated_by": current_user.id
        }}
    )
    
    # If forced, set posts category to null
    if force and post_count > 0:
        await db.blog_posts.update_many(
            {"category": category.get("name")},
            {"$set": {"category": None}}
        )
    
    # Audit log
    await AuditService.log(
        action="archive",
        resource_type="blog_category",
        resource_id=category_id,
        user_id=current_user.id,
        details={"name": category.get("name"), "forced": force, "posts_affected": post_count if force else 0}
    )
    
    return {"message": "Kategori arşivlendi", "posts_affected": post_count if force else 0}

@router.post("/{category_id}/restore")
async def restore_category(
    category_id: str,
    current_user = Depends(require_admin_or_manager)
):
    """Restore an archived category."""
    db = get_database()
    category = await db.blog_categories.find_one({"id": category_id}, {"_id": 0})
    
    if not category:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")
    
    if not category.get("is_deleted"):
        raise HTTPException(status_code=400, detail="Kategori zaten aktif")
    
    # Check slug conflict with active categories
    existing = await db.blog_categories.find_one({
        "slug": category.get("slug"),
        "id": {"$ne": category_id},
        "is_deleted": {"$ne": True}
    })
    
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Bu slug başka bir aktif kategoride kullanılıyor: '{category.get('slug')}'. Önce slug'ı değiştirin."
        )
    
    await db.blog_categories.update_one(
        {"id": category_id},
        {"$set": {
            "is_deleted": False,
            "deleted_at": None,
            "updated_by": current_user.id,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Audit log
    await AuditService.log(
        action="restore",
        resource_type="blog_category",
        resource_id=category_id,
        user_id=current_user.id,
        details={"name": category.get("name")}
    )
    
    return {"message": "Kategori geri yüklendi"}

@router.post("/reorder")
async def reorder_categories(
    orders: List[dict],
    current_user = Depends(require_admin_or_manager)
):
    """Bulk reorder categories. Expects [{"id": "...", "order": 0}, ...]"""
    db = get_database()
    for item in orders:
        if "id" in item and "order" in item:
            await db.blog_categories.update_one(
                {"id": item["id"]},
                {"$set": {"order": item["order"]}}
            )
    
    return {"message": "Sıralama güncellendi", "updated": len(orders)}
