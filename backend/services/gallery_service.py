from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timezone
from db.mongodb import get_database
from models.gallery import GalleryAlbum, GalleryItem, AlbumStatus
import re
import logging

logger = logging.getLogger(__name__)

def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title"""
    slug = title.lower()
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

class GalleryService:
    ALBUMS_COLLECTION = "gallery_albums"
    ITEMS_COLLECTION = "gallery_items"
    
    # --- Album Methods ---
    
    @staticmethod
    async def create_album(
        title: str,
        created_by: str,
        slug: Optional[str] = None,
        **kwargs
    ) -> GalleryAlbum:
        """Create a new gallery album"""
        db = get_database()
        
        if not slug:
            slug = generate_slug(title)
        
        base_slug = slug
        counter = 1
        while await db[GalleryService.ALBUMS_COLLECTION].find_one({"slug": slug}):
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        album = GalleryAlbum(
            title=title,
            slug=slug,
            created_by=created_by,
            **kwargs
        )
        
        doc = {
            "_id": album.id,
            "id": album.id,
            "title": album.title,
            "slug": album.slug,
            "description": album.description,
            "cover_image_url": album.cover_image_url,
            "status": album.status.value if hasattr(album.status, 'value') else album.status,
            "sort_order": album.sort_order,
            "created_at": album.created_at.isoformat(),
            "updated_at": album.updated_at.isoformat(),
            "created_by": album.created_by
        }
        
        await db[GalleryService.ALBUMS_COLLECTION].insert_one(doc)
        logger.info(f"Created gallery album: {album.id} - {album.title}")
        
        return album
    
    @staticmethod
    async def get_album_by_id(album_id: str) -> Optional[GalleryAlbum]:
        """Get album by ID"""
        db = get_database()
        doc = await db[GalleryService.ALBUMS_COLLECTION].find_one({"id": album_id}, {"_id": 0})
        if not doc:
            return None
        if doc.get('status'):
            doc['status'] = AlbumStatus(doc['status'])
        return GalleryAlbum(**doc)
    
    @staticmethod
    async def get_album_by_slug(slug: str) -> Optional[GalleryAlbum]:
        """Get album by slug"""
        db = get_database()
        doc = await db[GalleryService.ALBUMS_COLLECTION].find_one({"slug": slug}, {"_id": 0})
        if not doc:
            return None
        if doc.get('status'):
            doc['status'] = AlbumStatus(doc['status'])
        return GalleryAlbum(**doc)
    
    @staticmethod
    async def get_albums(
        page: int = 1,
        page_size: int = 20,
        status: Optional[AlbumStatus] = None,
        search: Optional[str] = None
    ) -> Tuple[List[dict], int]:
        """Get paginated list of albums with item counts"""
        db = get_database()
        
        query: Dict[str, Any] = {}
        
        if status:
            query["status"] = status.value
        
        if search:
            query["title"] = {"$regex": search, "$options": "i"}
        
        total = await db[GalleryService.ALBUMS_COLLECTION].count_documents(query)
        
        skip = (page - 1) * page_size
        cursor = db[GalleryService.ALBUMS_COLLECTION].find(query, {"_id": 0}).skip(skip).limit(page_size).sort("sort_order", 1)
        docs = await cursor.to_list(page_size)
        
        # Get item counts for each album
        albums = []
        for doc in docs:
            item_count = await db[GalleryService.ITEMS_COLLECTION].count_documents({"album_id": doc["id"]})
            doc["item_count"] = item_count
            albums.append(doc)
        
        return albums, total
    
    @staticmethod
    async def get_active_albums_with_items() -> List[dict]:
        """Get all active albums with their items for public"""
        db = get_database()
        
        albums_cursor = db[GalleryService.ALBUMS_COLLECTION].find(
            {"status": AlbumStatus.ACTIVE.value},
            {"_id": 0}
        ).sort("sort_order", 1)
        albums = await albums_cursor.to_list(length=50)
        
        result = []
        for album in albums:
            items_cursor = db[GalleryService.ITEMS_COLLECTION].find(
                {"album_id": album["id"]},
                {"_id": 0}
            ).sort("sort_order", 1)
            items = await items_cursor.to_list(length=100)
            album["items"] = items
            result.append(album)
        
        return result
    
    @staticmethod
    async def update_album(album_id: str, **kwargs) -> Optional[GalleryAlbum]:
        """Update album"""
        db = get_database()
        
        update_data = {
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        for key, value in kwargs.items():
            if value is not None:
                if key == 'status' and hasattr(value, 'value'):
                    update_data[key] = value.value
                else:
                    update_data[key] = value
        
        result = await db[GalleryService.ALBUMS_COLLECTION].update_one(
            {"id": album_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return None
        
        return await GalleryService.get_album_by_id(album_id)
    
    @staticmethod
    async def delete_album(album_id: str) -> bool:
        """Delete album and its items"""
        db = get_database()
        
        # Delete items first
        await db[GalleryService.ITEMS_COLLECTION].delete_many({"album_id": album_id})
        
        # Delete album
        result = await db[GalleryService.ALBUMS_COLLECTION].delete_one({"id": album_id})
        return result.deleted_count > 0
    
    # --- Item Methods ---
    
    @staticmethod
    async def create_item(
        album_id: str,
        image_url: str,
        created_by: str,
        **kwargs
    ) -> GalleryItem:
        """Create a new gallery item"""
        db = get_database()
        
        item = GalleryItem(
            album_id=album_id,
            image_url=image_url,
            created_by=created_by,
            **kwargs
        )
        
        doc = {
            "_id": item.id,
            "id": item.id,
            "album_id": item.album_id,
            "image_url": item.image_url,
            "image_alt": item.image_alt,
            "caption": item.caption,
            "sort_order": item.sort_order,
            "created_at": item.created_at.isoformat(),
            "created_by": item.created_by
        }
        
        await db[GalleryService.ITEMS_COLLECTION].insert_one(doc)
        return item
    
    @staticmethod
    async def get_items_by_album(album_id: str) -> Tuple[List[dict], int]:
        """Get all items for an album"""
        db = get_database()
        
        total = await db[GalleryService.ITEMS_COLLECTION].count_documents({"album_id": album_id})
        
        cursor = db[GalleryService.ITEMS_COLLECTION].find(
            {"album_id": album_id},
            {"_id": 0}
        ).sort("sort_order", 1)
        items = await cursor.to_list(length=500)
        
        return items, total
    
    @staticmethod
    async def update_item(item_id: str, **kwargs) -> Optional[dict]:
        """Update gallery item"""
        db = get_database()
        
        update_data = {k: v for k, v in kwargs.items() if v is not None}
        
        result = await db[GalleryService.ITEMS_COLLECTION].update_one(
            {"id": item_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return None
        
        return await db[GalleryService.ITEMS_COLLECTION].find_one({"id": item_id}, {"_id": 0})
    
    @staticmethod
    async def delete_item(item_id: str) -> bool:
        """Delete gallery item"""
        db = get_database()
        result = await db[GalleryService.ITEMS_COLLECTION].delete_one({"id": item_id})
        return result.deleted_count > 0
    
    @staticmethod
    async def get_item_by_id(item_id: str) -> Optional[dict]:
        """Get gallery item by ID"""
        db = get_database()
        return await db[GalleryService.ITEMS_COLLECTION].find_one({"id": item_id}, {"_id": 0})
    
    @staticmethod
    async def reorder_items(items: List[dict]) -> bool:
        """Reorder gallery items"""
        db = get_database()
        
        for item in items:
            await db[GalleryService.ITEMS_COLLECTION].update_one(
                {"id": item["id"]},
                {"$set": {"sort_order": item["sort_order"]}}
            )
        
        return True

    @staticmethod
    async def get_stats() -> dict:
        """Get gallery statistics for dashboard"""
        db = get_database()
        
        # Count albums
        total_albums = await db[GalleryService.ALBUMS_COLLECTION].count_documents({})
        active_albums = await db[GalleryService.ALBUMS_COLLECTION].count_documents({"status": "active"})
        
        # Count items
        total_images = await db[GalleryService.ITEMS_COLLECTION].count_documents({})
        
        # Get albums with item counts
        albums_with_counts = []
        albums = await db[GalleryService.ALBUMS_COLLECTION].find(
            {"status": "active"},
            {"_id": 0, "id": 1, "title": 1}
        ).to_list(100)
        
        for album in albums:
            count = await db[GalleryService.ITEMS_COLLECTION].count_documents({"album_id": album["id"]})
            albums_with_counts.append({
                "title": album["title"],
                "count": count
            })
        
        return {
            "total_albums": total_albums,
            "active_albums": active_albums,
            "total_images": total_images,
            "albums": albums_with_counts
        }

    @staticmethod
    async def get_album(album_id: str) -> Optional[dict]:
        """Get album by ID"""
        db = get_database()
        return await db[GalleryService.ALBUMS_COLLECTION].find_one({"id": album_id}, {"_id": 0})
    
    @staticmethod
    async def get_album_items(album_id: str, page: int = 1, page_size: int = 20) -> Tuple[List[dict], int]:
        """Get paginated items for an album"""
        db = get_database()
        
        skip = (page - 1) * page_size
        total = await db[GalleryService.ITEMS_COLLECTION].count_documents({"album_id": album_id})
        
        cursor = db[GalleryService.ITEMS_COLLECTION].find(
            {"album_id": album_id},
            {"_id": 0}
        ).sort("sort_order", 1).skip(skip).limit(page_size)
        items = await cursor.to_list(length=page_size)
        
        return items, total
    
    @staticmethod
    async def get_all_published_images(page: int = 1, page_size: int = 20) -> Tuple[List[dict], int]:
        """Get all images from published albums"""
        db = get_database()
        
        # Get active album IDs
        published_albums = await db[GalleryService.ALBUMS_COLLECTION].find(
            {"status": "active"},
            {"id": 1, "_id": 0}
        ).to_list(100)
        album_ids = [a["id"] for a in published_albums]
        
        if not album_ids:
            return [], 0
        
        skip = (page - 1) * page_size
        total = await db[GalleryService.ITEMS_COLLECTION].count_documents({"album_id": {"$in": album_ids}})
        
        cursor = db[GalleryService.ITEMS_COLLECTION].find(
            {"album_id": {"$in": album_ids}},
            {"_id": 0}
        ).sort("created_at", -1).skip(skip).limit(page_size)
        items = await cursor.to_list(length=page_size)
        
        return items, total

