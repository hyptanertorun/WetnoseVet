from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timezone
from db.mongodb import get_database
from models.blog import BlogPost, BlogStatus, BlogSEO
import re
import logging

logger = logging.getLogger(__name__)

def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title"""
    slug = title.lower()
    # Turkish character replacements
    replacements = {
        'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c',
        'İ': 'i', 'Ğ': 'g', 'Ü': 'u', 'Ş': 's', 'Ö': 'o', 'Ç': 'c'
    }
    for tr_char, en_char in replacements.items():
        slug = slug.replace(tr_char, en_char)
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')

class BlogService:
    COLLECTION = "blog_posts"
    
    @staticmethod
    def _deserialize_post(doc: dict) -> dict:
        """Convert stored document to BlogPost-compatible dict"""
        if doc.get('seo') and isinstance(doc['seo'], dict):
            doc['seo'] = BlogSEO(**doc['seo'])
        if doc.get('status'):
            doc['status'] = BlogStatus(doc['status'])
        for date_field in ['created_at', 'updated_at', 'published_at', 'archived_at']:
            if doc.get(date_field) and isinstance(doc[date_field], str):
                doc[date_field] = datetime.fromisoformat(doc[date_field].replace('Z', '+00:00'))
        return doc
    
    @staticmethod
    async def create(
        title: str,
        created_by: Optional[str] = None,
        author_id: Optional[str] = None,
        slug: Optional[str] = None,
        meta_title: Optional[str] = None,
        meta_description: Optional[str] = None,
        ai_generated: bool = False,
        ai_metadata: Optional[dict] = None,
        **kwargs
    ) -> BlogPost:
        """Create a new blog post"""
        db = get_database()
        
        if not slug:
            slug = generate_slug(title)
        
        # Ensure unique slug
        base_slug = slug
        counter = 1
        while await db[BlogService.COLLECTION].find_one({"slug": slug}):
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Build SEO object if meta fields provided
        seo = None
        if meta_title or meta_description:
            seo = BlogSEO(
                meta_title=meta_title,
                meta_description=meta_description
            )
        # If seo was passed in kwargs, use it (from API) or build from meta fields
        if 'seo' in kwargs:
            seo_data = kwargs.pop('seo')
            if seo_data and isinstance(seo_data, dict):
                seo = BlogSEO(**seo_data)
            elif seo_data and isinstance(seo_data, BlogSEO):
                seo = seo_data
        
        post = BlogPost(
            title=title,
            slug=slug,
            created_by=created_by or author_id,
            seo=seo,
            ai_generated=ai_generated,
            ai_metadata=ai_metadata,
            **kwargs
        )
        
        doc = post.to_dict()
        doc["_id"] = post.id
        
        await db[BlogService.COLLECTION].insert_one(doc)
        logger.info(f"Created blog post: {post.id} - {post.title}")
        
        return post
    
    @staticmethod
    async def get_by_id(post_id: str) -> Optional[BlogPost]:
        """Get blog post by ID"""
        db = get_database()
        doc = await db[BlogService.COLLECTION].find_one({"id": post_id}, {"_id": 0})
        if not doc:
            return None
        doc = BlogService._deserialize_post(doc)
        return BlogPost(**doc)
    
    @staticmethod
    async def get_by_slug(slug: str) -> Optional[BlogPost]:
        """Get blog post by slug"""
        db = get_database()
        doc = await db[BlogService.COLLECTION].find_one({"slug": slug}, {"_id": 0})
        if not doc:
            return None
        doc = BlogService._deserialize_post(doc)
        return BlogPost(**doc)
    
    @staticmethod
    async def get_list(
        page: int = 1,
        page_size: int = 20,
        status: Optional[BlogStatus] = None,
        archived: bool = False,
        search: Optional[str] = None,
        category: Optional[str] = None
    ) -> Tuple[List[BlogPost], int]:
        """Get paginated list of blog posts for admin"""
        db = get_database()
        
        query: Dict[str, Any] = {}
        
        if archived:
            query["archived_at"] = {"$ne": None}
        else:
            query["archived_at"] = None
        
        if status:
            query["status"] = status.value
        
        if category:
            query["category"] = category
        
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"excerpt": {"$regex": search, "$options": "i"}}
            ]
        
        total = await db[BlogService.COLLECTION].count_documents(query)
        
        skip = (page - 1) * page_size
        cursor = db[BlogService.COLLECTION].find(query, {"_id": 0}).skip(skip).limit(page_size).sort("created_at", -1)
        docs = await cursor.to_list(page_size)
        
        posts = []
        for doc in docs:
            doc = BlogService._deserialize_post(doc)
            posts.append(BlogPost(**doc))
        
        return posts, total
    
    @staticmethod
    async def get_published(page: int = 1, page_size: int = 10, category: str = None) -> tuple:
        """Get all published, non-archived posts for public with pagination"""
        db = get_database()
        
        query = {
            "status": BlogStatus.PUBLISHED.value,
            "archived_at": None
        }
        
        if category:
            query["category"] = category
        
        skip = (page - 1) * page_size
        total = await db[BlogService.COLLECTION].count_documents(query)
        
        cursor = db[BlogService.COLLECTION].find(query, {"_id": 0}).sort("published_at", -1).skip(skip).limit(page_size)
        docs = await cursor.to_list(length=page_size)
        
        posts = []
        for doc in docs:
            doc = BlogService._deserialize_post(doc)
            posts.append(BlogPost(**doc))
        
        return posts, total
    
    @staticmethod
    async def get_published_by_slug(slug: str) -> Optional[BlogPost]:
        """Get published post by slug for public"""
        db = get_database()
        
        query = {
            "slug": slug,
            "status": BlogStatus.PUBLISHED.value,
            "archived_at": None
        }
        
        doc = await db[BlogService.COLLECTION].find_one(query, {"_id": 0})
        if not doc:
            return None
        doc = BlogService._deserialize_post(doc)
        return BlogPost(**doc)
    
    @staticmethod
    async def update(post_id: str, updated_by: str, **kwargs) -> Optional[BlogPost]:
        """Update blog post fields"""
        db = get_database()
        
        update_data = {
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "updated_by": updated_by
        }
        
        for key, value in kwargs.items():
            if value is not None:
                if key == 'status' and hasattr(value, 'value'):
                    update_data[key] = value.value
                elif key == 'seo' and hasattr(value, 'model_dump'):
                    update_data[key] = value.model_dump()
                elif key == 'seo' and isinstance(value, dict):
                    update_data[key] = value
                else:
                    update_data[key] = value
        
        # Ensure unique slug if updating
        if 'slug' in update_data:
            existing = await db[BlogService.COLLECTION].find_one({
                "slug": update_data['slug'],
                "id": {"$ne": post_id}
            })
            if existing:
                return None
        
        result = await db[BlogService.COLLECTION].update_one(
            {"id": post_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return None
        
        return await BlogService.get_by_id(post_id)
    
    @staticmethod
    async def update_status(post_id: str, status: BlogStatus, updated_by: str) -> Optional[BlogPost]:
        """Update post status (publish/unpublish)"""
        update_data = {"status": status}
        if status == BlogStatus.PUBLISHED:
            update_data["published_at"] = datetime.now(timezone.utc)
        return await BlogService.update(post_id, updated_by, **update_data)
    
    @staticmethod
    async def archive(post_id: str, updated_by: str) -> Optional[BlogPost]:
        """Archive a blog post"""
        return await BlogService.update(
            post_id,
            updated_by,
            archived_at=datetime.now(timezone.utc),
            status=BlogStatus.DRAFT
        )
    
    @staticmethod
    async def restore(post_id: str, updated_by: str) -> Optional[BlogPost]:
        """Restore an archived blog post"""
        db = get_database()
        
        result = await db[BlogService.COLLECTION].update_one(
            {"id": post_id},
            {"$set": {
                "archived_at": None,
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "updated_by": updated_by
            }}
        )
        
        if result.modified_count == 0:
            return None
        
        return await BlogService.get_by_id(post_id)


    @staticmethod
    async def increment_view_count(slug: str, client_ip: str) -> int:
        """Increment view count for a blog post with basic IP deduplication"""
        db = get_database()
        
        # Simple deduplication: check if this IP viewed in last 30 minutes
        view_key = f"{slug}:{client_ip}"
        views_collection = db["blog_views"]
        
        # Check for recent view from same IP
        recent_view = await views_collection.find_one({
            "key": view_key,
            "timestamp": {"$gte": datetime.now(timezone.utc).timestamp() - 1800}  # 30 minutes
        })
        
        if not recent_view:
            # Record this view
            await views_collection.update_one(
                {"key": view_key},
                {
                    "$set": {
                        "key": view_key,
                        "timestamp": datetime.now(timezone.utc).timestamp()
                    }
                },
                upsert=True
            )
            
            # Increment view count
            await db[BlogService.COLLECTION].update_one(
                {"slug": slug},
                {"$inc": {"view_count": 1}}
            )
        
        # Return current view count
        post = await db[BlogService.COLLECTION].find_one({"slug": slug}, {"view_count": 1, "_id": 0})
        return post.get("view_count", 0) if post else 0
    
    @staticmethod
    async def get_view_count(slug: str) -> int:
        """Get view count for a blog post"""
        db = get_database()
        post = await db[BlogService.COLLECTION].find_one({"slug": slug}, {"view_count": 1, "_id": 0})
        return post.get("view_count", 0) if post else 0
