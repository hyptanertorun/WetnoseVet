from typing import Optional, List, Tuple, Dict, Any
from datetime import datetime, timezone

from db.mongodb import get_database
from models.team import TeamMember, SocialLinks
from models.service import ContentStatus, generate_slug
import logging
import uuid

logger = logging.getLogger(__name__)

class TeamService:
    COLLECTION = "team_members"
    
    @staticmethod
    def _serialize_member(member: TeamMember) -> dict:
        """Convert TeamMember model to MongoDB document"""
        doc = member.model_dump()
        doc['created_at'] = doc['created_at'].isoformat() if doc.get('created_at') else None
        doc['updated_at'] = doc['updated_at'].isoformat() if doc.get('updated_at') else None
        doc['archived_at'] = doc['archived_at'].isoformat() if doc.get('archived_at') else None
        doc['status'] = doc['status'].value if hasattr(doc.get('status'), 'value') else doc.get('status')
        if doc.get('social_links'):
            doc['social_links'] = doc['social_links'] if isinstance(doc['social_links'], dict) else doc['social_links'].model_dump() if hasattr(doc['social_links'], 'model_dump') else doc['social_links']
        return doc
    
    @staticmethod
    def _deserialize_member(doc: dict) -> dict:
        """Parse MongoDB document dates"""
        for field in ['created_at', 'updated_at', 'archived_at']:
            if doc.get(field) and isinstance(doc[field], str):
                doc[field] = datetime.fromisoformat(doc[field])
        return doc
    
    @staticmethod
    async def create(
        full_name: str,
        role_title: str,
        photo_url: str,
        created_by: str,
        slug: Optional[str] = None,
        **kwargs
    ) -> Optional[TeamMember]:
        """Create a new team member"""
        db = get_database()
        
        # Generate slug if not provided
        if not slug:
            slug = generate_slug(full_name)
        
        # Ensure unique slug
        existing = await db[TeamService.COLLECTION].find_one({"slug": slug})
        if existing:
            slug = f"{slug}-{str(uuid.uuid4())[:8]}"
        
        # Handle social links
        social_data = kwargs.pop('social_links', None)
        if social_data and isinstance(social_data, dict):
            social_data = SocialLinks(**social_data)
        elif not social_data:
            social_data = SocialLinks()
        
        member = TeamMember(
            full_name=full_name,
            slug=slug,
            role_title=role_title,
            photo_url=photo_url,
            created_by=created_by,
            updated_by=created_by,
            social_links=social_data,
            **kwargs
        )
        
        doc = TeamService._serialize_member(member)
        await db[TeamService.COLLECTION].insert_one(doc)
        return member
    
    @staticmethod
    async def get_by_id(member_id: str) -> Optional[TeamMember]:
        """Get team member by ID"""
        db = get_database()
        doc = await db[TeamService.COLLECTION].find_one({"id": member_id}, {"_id": 0})
        if not doc:
            return None
        doc = TeamService._deserialize_member(doc)
        return TeamMember(**doc)
    
    @staticmethod
    async def get_by_slug(slug: str) -> Optional[TeamMember]:
        """Get team member by slug"""
        db = get_database()
        doc = await db[TeamService.COLLECTION].find_one({"slug": slug}, {"_id": 0})
        if not doc:
            return None
        doc = TeamService._deserialize_member(doc)
        return TeamMember(**doc)
    
    @staticmethod
    async def get_list(
        page: int = 1,
        page_size: int = 20,
        status: Optional[ContentStatus] = None,
        archived: bool = False,
        search: Optional[str] = None,
        is_owner: Optional[bool] = None
    ) -> Tuple[List[TeamMember], int]:
        """Get paginated list of team members for admin"""
        db = get_database()
        
        query: Dict[str, Any] = {}
        
        if archived:
            query["archived_at"] = {"$ne": None}
        else:
            query["archived_at"] = None
        
        if status:
            query["status"] = status.value
        
        if is_owner is not None:
            query["is_owner"] = is_owner
        
        if search:
            query["$or"] = [
                {"full_name": {"$regex": search, "$options": "i"}},
                {"role_title": {"$regex": search, "$options": "i"}}
            ]
        
        total = await db[TeamService.COLLECTION].count_documents(query)
        
        skip = (page - 1) * page_size
        cursor = db[TeamService.COLLECTION].find(query, {"_id": 0}).skip(skip).limit(page_size).sort([("is_owner", -1), ("sort_order", 1)])
        docs = await cursor.to_list(page_size)
        
        members = []
        for doc in docs:
            doc = TeamService._deserialize_member(doc)
            members.append(TeamMember(**doc))
        
        return members, total
    
    @staticmethod
    async def get_published() -> List[TeamMember]:
        """Get all published, non-archived team members for public"""
        db = get_database()
        
        query = {
            "status": ContentStatus.PUBLISHED.value,
            "archived_at": None
        }
        
        # Sort: owners first, then by sort_order
        cursor = db[TeamService.COLLECTION].find(query, {"_id": 0}).sort([("is_owner", -1), ("sort_order", 1)])
        docs = await cursor.to_list(100)
        
        members = []
        for doc in docs:
            doc = TeamService._deserialize_member(doc)
            members.append(TeamMember(**doc))
        
        return members
    
    @staticmethod
    async def get_published_by_slug(slug: str) -> Optional[TeamMember]:
        """Get published team member by slug for public"""
        db = get_database()
        
        query = {
            "slug": slug,
            "status": ContentStatus.PUBLISHED.value,
            "archived_at": None
        }
        
        doc = await db[TeamService.COLLECTION].find_one(query, {"_id": 0})
        if not doc:
            return None
        doc = TeamService._deserialize_member(doc)
        return TeamMember(**doc)
    
    @staticmethod
    async def update(
        member_id: str,
        updated_by: str,
        **kwargs
    ) -> Optional[TeamMember]:
        """Update team member fields"""
        db = get_database()
        
        update_data = {
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "updated_by": updated_by
        }
        
        for key, value in kwargs.items():
            if value is not None:
                if key == 'status' and hasattr(value, 'value'):
                    update_data[key] = value.value
                elif key == 'social_links' and hasattr(value, 'model_dump'):
                    update_data[key] = value.model_dump()
                elif key == 'social_links' and isinstance(value, dict):
                    update_data[key] = value
                else:
                    update_data[key] = value
        
        # Ensure unique slug if updating
        if 'slug' in update_data:
            existing = await db[TeamService.COLLECTION].find_one({
                "slug": update_data['slug'],
                "id": {"$ne": member_id}
            })
            if existing:
                return None
        
        result = await db[TeamService.COLLECTION].update_one(
            {"id": member_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return None
        
        return await TeamService.get_by_id(member_id)
    
    @staticmethod
    async def update_status(member_id: str, status: ContentStatus, updated_by: str) -> Optional[TeamMember]:
        """Update team member status"""
        return await TeamService.update(member_id, updated_by, status=status)
    
    @staticmethod
    async def archive(member_id: str, updated_by: str) -> Optional[TeamMember]:
        """Soft delete (archive) a team member"""
        db = get_database()
        
        result = await db[TeamService.COLLECTION].update_one(
            {"id": member_id},
            {"$set": {
                "archived_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "updated_by": updated_by
            }}
        )
        
        if result.modified_count == 0:
            return None
        
        return await TeamService.get_by_id(member_id)
    
    @staticmethod
    async def restore(member_id: str, updated_by: str) -> Optional[TeamMember]:
        """Restore an archived team member"""
        db = get_database()
        
        result = await db[TeamService.COLLECTION].update_one(
            {"id": member_id},
            {"$set": {
                "archived_at": None,
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "updated_by": updated_by
            }}
        )
        
        if result.modified_count == 0:
            return None
        
        return await TeamService.get_by_id(member_id)
    
    @staticmethod
    async def reorder(items: List[dict], updated_by: str) -> bool:
        """Bulk reorder team members"""
        db = get_database()
        
        for item in items:
            await db[TeamService.COLLECTION].update_one(
                {"id": item["id"]},
                {"$set": {
                    "sort_order": item["sort_order"],
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "updated_by": updated_by
                }}
            )
        
        return True
