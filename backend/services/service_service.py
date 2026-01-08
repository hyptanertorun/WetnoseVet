from typing import Optional, List, Tuple, Dict, Any
from datetime import datetime, timezone

from db.mongodb import get_database
from models.service import Service, ContentStatus, SEOData, generate_slug
import logging

logger = logging.getLogger(__name__)

class ServiceService:
    COLLECTION = "services"
    
    @staticmethod
    def _serialize_service(service: Service) -> dict:
        """Convert Service model to MongoDB document"""
        doc = service.model_dump()
        doc['created_at'] = doc['created_at'].isoformat() if doc.get('created_at') else None
        doc['updated_at'] = doc['updated_at'].isoformat() if doc.get('updated_at') else None
        doc['archived_at'] = doc['archived_at'].isoformat() if doc.get('archived_at') else None
        doc['status'] = doc['status'].value if hasattr(doc.get('status'), 'value') else doc.get('status')
        doc['price_mode'] = doc['price_mode'].value if hasattr(doc.get('price_mode'), 'value') else doc.get('price_mode')
        if doc.get('seo'):
            doc['seo'] = doc['seo'] if isinstance(doc['seo'], dict) else doc['seo'].model_dump() if hasattr(doc['seo'], 'model_dump') else doc['seo']
        return doc
    
    @staticmethod
    def _deserialize_service(doc: dict) -> dict:
        """Parse MongoDB document dates"""
        for field in ['created_at', 'updated_at', 'archived_at']:
            if doc.get(field) and isinstance(doc[field], str):
                doc[field] = datetime.fromisoformat(doc[field])
        return doc
    
    @staticmethod
    async def create(
        title: str,
        short_description: str,
        cover_image_url: str,
        created_by: str,
        slug: Optional[str] = None,
        **kwargs
    ) -> Optional[Service]:
        """Create a new service"""
        db = get_database()
        
        # Generate slug if not provided
        if not slug:
            slug = generate_slug(title)
        
        # Ensure unique slug
        existing = await db[ServiceService.COLLECTION].find_one({"slug": slug})
        if existing:
            # Append ID suffix
            slug = f"{slug}-{str(uuid.uuid4())[:8]}"
        
        # Handle SEO data
        seo_data = kwargs.pop('seo', None)
        if seo_data and isinstance(seo_data, dict):
            seo_data = SEOData(**seo_data)
        elif not seo_data:
            seo_data = SEOData()
        
        service = Service(
            title=title,
            slug=slug,
            short_description=short_description,
            cover_image_url=cover_image_url,
            created_by=created_by,
            updated_by=created_by,
            seo=seo_data,
            **kwargs
        )
        
        doc = ServiceService._serialize_service(service)
        await db[ServiceService.COLLECTION].insert_one(doc)
        return service
    
    @staticmethod
    async def get_by_id(service_id: str) -> Optional[Service]:
        """Get service by ID"""
        db = get_database()
        doc = await db[ServiceService.COLLECTION].find_one({"id": service_id}, {"_id": 0})
        if not doc:
            return None
        doc = ServiceService._deserialize_service(doc)
        return Service(**doc)
    
    @staticmethod
    async def get_by_slug(slug: str) -> Optional[Service]:
        """Get service by slug"""
        db = get_database()
        doc = await db[ServiceService.COLLECTION].find_one({"slug": slug}, {"_id": 0})
        if not doc:
            return None
        doc = ServiceService._deserialize_service(doc)
        return Service(**doc)
    
    @staticmethod
    async def get_list(
        page: int = 1,
        page_size: int = 20,
        status: Optional[ContentStatus] = None,
        archived: bool = False,
        search: Optional[str] = None
    ) -> Tuple[List[Service], int]:
        """Get paginated list of services for admin"""
        db = get_database()
        
        query: Dict[str, Any] = {}
        
        # Filter by archived status
        if archived:
            query["archived_at"] = {"$ne": None}
        else:
            query["archived_at"] = None
        
        # Filter by status
        if status:
            query["status"] = status.value
        
        # Search
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"short_description": {"$regex": search, "$options": "i"}}
            ]
        
        total = await db[ServiceService.COLLECTION].count_documents(query)
        
        skip = (page - 1) * page_size
        cursor = db[ServiceService.COLLECTION].find(query, {"_id": 0}).skip(skip).limit(page_size).sort("sort_order", 1)
        docs = await cursor.to_list(page_size)
        
        services = []
        for doc in docs:
            doc = ServiceService._deserialize_service(doc)
            services.append(Service(**doc))
        
        return services, total
    
    @staticmethod
    async def get_published() -> List[Service]:
        """Get all published, non-archived services for public"""
        db = get_database()
        
        query = {
            "status": ContentStatus.PUBLISHED.value,
            "archived_at": None
        }
        
        cursor = db[ServiceService.COLLECTION].find(query, {"_id": 0}).sort("sort_order", 1)
        docs = await cursor.to_list(100)
        
        services = []
        for doc in docs:
            doc = ServiceService._deserialize_service(doc)
            services.append(Service(**doc))
        
        return services
    
    @staticmethod
    async def get_published_by_slug(slug: str) -> Optional[Service]:
        """Get published service by slug for public"""
        db = get_database()
        
        query = {
            "slug": slug,
            "status": ContentStatus.PUBLISHED.value,
            "archived_at": None
        }
        
        doc = await db[ServiceService.COLLECTION].find_one(query, {"_id": 0})
        if not doc:
            return None
        doc = ServiceService._deserialize_service(doc)
        return Service(**doc)
    
    @staticmethod
    async def update(
        service_id: str,
        updated_by: str,
        **kwargs
    ) -> Optional[Service]:
        """Update service fields"""
        db = get_database()
        
        update_data = {
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "updated_by": updated_by
        }
        
        for key, value in kwargs.items():
            if value is not None:
                if key == 'status' and hasattr(value, 'value'):
                    update_data[key] = value.value
                elif key == 'price_mode' and hasattr(value, 'value'):
                    update_data[key] = value.value
                elif key == 'seo' and hasattr(value, 'model_dump'):
                    update_data[key] = value.model_dump()
                elif key == 'seo' and isinstance(value, dict):
                    update_data[key] = value
                else:
                    update_data[key] = value
        
        # Ensure unique slug if updating
        if 'slug' in update_data:
            existing = await db[ServiceService.COLLECTION].find_one({
                "slug": update_data['slug'],
                "id": {"$ne": service_id}
            })
            if existing:
                return None  # Slug conflict
        
        result = await db[ServiceService.COLLECTION].update_one(
            {"id": service_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return None
        
        return await ServiceService.get_by_id(service_id)
    
    @staticmethod
    async def update_status(service_id: str, status: ContentStatus, updated_by: str) -> Optional[Service]:
        """Update service status (publish/unpublish)"""
        return await ServiceService.update(service_id, updated_by, status=status)
    
    @staticmethod
    async def archive(service_id: str, updated_by: str) -> Optional[Service]:
        """Soft delete (archive) a service"""
        db = get_database()
        
        result = await db[ServiceService.COLLECTION].update_one(
            {"id": service_id},
            {"$set": {
                "archived_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "updated_by": updated_by
            }}
        )
        
        if result.modified_count == 0:
            return None
        
        return await ServiceService.get_by_id(service_id)
    
    @staticmethod
    async def restore(service_id: str, updated_by: str) -> Optional[Service]:
        """Restore an archived service"""
        db = get_database()
        
        result = await db[ServiceService.COLLECTION].update_one(
            {"id": service_id},
            {"$set": {
                "archived_at": None,
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "updated_by": updated_by
            }}
        )
        
        if result.modified_count == 0:
            return None
        
        return await ServiceService.get_by_id(service_id)
    
    @staticmethod
    async def reorder(items: List[dict], updated_by: str) -> bool:
        """Bulk reorder services"""
        db = get_database()
        
        for item in items:
            await db[ServiceService.COLLECTION].update_one(
                {"id": item["id"]},
                {"$set": {
                    "sort_order": item["sort_order"],
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "updated_by": updated_by
                }}
            )
        
        return True

import uuid
