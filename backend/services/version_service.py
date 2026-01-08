from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from db.mongodb import get_database
from models.version import ContentVersion
import logging

logger = logging.getLogger(__name__)

class VersionService:
    COLLECTION = "content_versions"
    
    @staticmethod
    async def create_version(
        entity_type: str,
        entity_id: str,
        snapshot: Dict[str, Any],
        created_by: str,
        created_by_email: str,
        change_reason: Optional[str] = None
    ) -> ContentVersion:
        """Create a new version snapshot"""
        db = get_database()
        
        # Get next version number
        latest = await db[VersionService.COLLECTION].find_one(
            {"entity_type": entity_type, "entity_id": entity_id},
            sort=[("version_no", -1)]
        )
        version_no = (latest["version_no"] + 1) if latest else 1
        
        version = ContentVersion(
            entity_type=entity_type,
            entity_id=entity_id,
            version_no=version_no,
            snapshot=snapshot,
            change_reason=change_reason,
            created_by=created_by,
            created_by_email=created_by_email
        )
        
        doc = version.to_dict()
        doc["_id"] = version.id
        
        await db[VersionService.COLLECTION].insert_one(doc)
        logger.info(f"Created version {version_no} for {entity_type}/{entity_id}")
        
        return version
    
    @staticmethod
    async def get_versions(
        entity_type: str,
        entity_id: str,
        limit: int = 50
    ) -> List[ContentVersion]:
        """Get all versions for an entity, newest first"""
        db = get_database()
        
        cursor = db[VersionService.COLLECTION].find(
            {"entity_type": entity_type, "entity_id": entity_id},
            {"_id": 0}
        ).sort("version_no", -1).limit(limit)
        
        docs = await cursor.to_list(length=limit)
        return [ContentVersion(**doc) for doc in docs]
    
    @staticmethod
    async def get_version_by_id(version_id: str) -> Optional[ContentVersion]:
        """Get a specific version by ID"""
        db = get_database()
        
        doc = await db[VersionService.COLLECTION].find_one(
            {"id": version_id},
            {"_id": 0}
        )
        
        if doc:
            return ContentVersion(**doc)
        return None
    
    @staticmethod
    async def get_version_count(entity_type: str, entity_id: str) -> int:
        """Get total version count for an entity"""
        db = get_database()
        return await db[VersionService.COLLECTION].count_documents(
            {"entity_type": entity_type, "entity_id": entity_id}
        )
    
    @staticmethod
    async def get_latest_version(
        entity_type: str,
        entity_id: str
    ) -> Optional[ContentVersion]:
        """Get the latest version for an entity"""
        db = get_database()
        
        doc = await db[VersionService.COLLECTION].find_one(
            {"entity_type": entity_type, "entity_id": entity_id},
            {"_id": 0},
            sort=[("version_no", -1)]
        )
        
        if doc:
            return ContentVersion(**doc)
        return None
