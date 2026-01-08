from typing import Optional, List, Tuple
from datetime import datetime, timezone, date
from uuid import uuid4

from db.mongodb import get_database
from models.clinic_rhythm import (
    ClinicRhythmEntry, 
    ClinicRhythmStatus,
    FeaturedQuestion,
    FalseAlarm
)
from services.version_service import VersionService
from services.audit_service import AuditService


class ClinicRhythmService:
    COLLECTION = "clinic_rhythm_entries"
    
    @staticmethod
    def _deserialize(doc: dict) -> ClinicRhythmEntry:
        """Convert MongoDB document to ClinicRhythmEntry"""
        if not doc:
            return None
            
        featured_question = None
        if doc.get("featured_question"):
            featured_question = FeaturedQuestion(**doc["featured_question"])
        
        false_alarm = None
        if doc.get("false_alarm"):
            false_alarm = FalseAlarm(**doc["false_alarm"])
        
        return ClinicRhythmEntry(
            id=doc.get("id"),
            date_key=doc.get("date_key"),
            featured_question=featured_question,
            false_alarm=false_alarm,
            status=ClinicRhythmStatus(doc.get("status", "draft")),
            created_by=doc.get("created_by"),
            updated_by=doc.get("updated_by"),
            created_at=datetime.fromisoformat(doc["created_at"]) if doc.get("created_at") else datetime.now(timezone.utc),
            updated_at=datetime.fromisoformat(doc["updated_at"]) if doc.get("updated_at") else datetime.now(timezone.utc),
            published_at=datetime.fromisoformat(doc["published_at"]) if doc.get("published_at") else None,
        )
    
    @staticmethod
    async def create(
        date_key: str,
        created_by: str,
        created_by_email: str,
        featured_question: Optional[dict] = None,
        false_alarm: Optional[dict] = None
    ) -> ClinicRhythmEntry:
        """Create a new clinic rhythm entry"""
        db = get_database()
        
        # Check if date_key already exists
        existing = await db[ClinicRhythmService.COLLECTION].find_one({"date_key": date_key})
        if existing:
            raise ValueError(f"Bu tarih için zaten bir kayıt var: {date_key}")
        
        entry = ClinicRhythmEntry(
            date_key=date_key,
            featured_question=FeaturedQuestion(**featured_question) if featured_question else None,
            false_alarm=FalseAlarm(**false_alarm) if false_alarm else None,
            created_by=created_by,
            updated_by=created_by,
        )
        
        doc = entry.to_dict()
        doc["_id"] = entry.id
        await db[ClinicRhythmService.COLLECTION].insert_one(doc)
        
        # Audit log
        await AuditService.log(
            action="clinic_rhythm.create",
            actor_user_id=created_by,
            actor_email=created_by_email,
            entity_type="clinic_rhythm",
            entity_id=entry.id,
            metadata={"date_key": date_key}
        )
        
        return entry
    
    @staticmethod
    async def get_by_id(entry_id: str) -> Optional[ClinicRhythmEntry]:
        """Get entry by ID"""
        db = get_database()
        doc = await db[ClinicRhythmService.COLLECTION].find_one({"id": entry_id}, {"_id": 0})
        return ClinicRhythmService._deserialize(doc) if doc else None
    
    @staticmethod
    async def get_by_date(date_key: str) -> Optional[ClinicRhythmEntry]:
        """Get entry by date key"""
        db = get_database()
        doc = await db[ClinicRhythmService.COLLECTION].find_one({"date_key": date_key}, {"_id": 0})
        return ClinicRhythmService._deserialize(doc) if doc else None
    
    @staticmethod
    async def get_today_published() -> Optional[ClinicRhythmEntry]:
        """Get today's published entry, fallback to latest published"""
        db = get_database()
        today = date.today().isoformat()
        
        # Try today first
        doc = await db[ClinicRhythmService.COLLECTION].find_one(
            {"date_key": today, "status": "published"},
            {"_id": 0}
        )
        
        if doc:
            return ClinicRhythmService._deserialize(doc)
        
        # Fallback to latest published
        cursor = db[ClinicRhythmService.COLLECTION].find(
            {"status": "published"},
            {"_id": 0}
        ).sort("date_key", -1).limit(1)
        
        docs = await cursor.to_list(1)
        return ClinicRhythmService._deserialize(docs[0]) if docs else None
    
    @staticmethod
    async def get_latest_published() -> Optional[ClinicRhythmEntry]:
        """Get the latest published entry"""
        db = get_database()
        cursor = db[ClinicRhythmService.COLLECTION].find(
            {"status": "published"},
            {"_id": 0}
        ).sort("date_key", -1).limit(1)
        
        docs = await cursor.to_list(1)
        return ClinicRhythmService._deserialize(docs[0]) if docs else None
    
    @staticmethod
    async def list_entries(
        status: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> Tuple[List[ClinicRhythmEntry], int]:
        """List entries with filters"""
        db = get_database()
        
        query = {}
        if status:
            query["status"] = status
        if date_from:
            query["date_key"] = {"$gte": date_from}
        if date_to:
            if "date_key" in query:
                query["date_key"]["$lte"] = date_to
            else:
                query["date_key"] = {"$lte": date_to}
        
        total = await db[ClinicRhythmService.COLLECTION].count_documents(query)
        
        cursor = db[ClinicRhythmService.COLLECTION].find(
            query, {"_id": 0}
        ).sort("date_key", -1).skip(skip).limit(limit)
        
        docs = await cursor.to_list(limit)
        entries = [ClinicRhythmService._deserialize(doc) for doc in docs]
        
        return entries, total
    
    @staticmethod
    async def update(
        entry_id: str,
        updated_by: str,
        updated_by_email: str,
        featured_question: Optional[dict] = None,
        false_alarm: Optional[dict] = None
    ) -> Optional[ClinicRhythmEntry]:
        """Update an entry"""
        db = get_database()
        
        entry = await ClinicRhythmService.get_by_id(entry_id)
        if not entry:
            return None
        
        # Create version snapshot before update
        await VersionService.create_version(
            entity_type="clinic_rhythm",
            entity_id=entry_id,
            snapshot=entry.to_dict(),
            created_by=updated_by,
            created_by_email=updated_by_email,
            change_reason="Güncelleme öncesi otomatik kayıt"
        )
        
        update_data = {
            "updated_by": updated_by,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        if featured_question is not None:
            update_data["featured_question"] = featured_question
        if false_alarm is not None:
            update_data["false_alarm"] = false_alarm
        
        await db[ClinicRhythmService.COLLECTION].update_one(
            {"id": entry_id},
            {"$set": update_data}
        )
        
        # Audit log
        await AuditService.log(
            action="clinic_rhythm.update",
            actor_user_id=updated_by,
            actor_email=updated_by_email,
            entity_type="clinic_rhythm",
            entity_id=entry_id,
            metadata={"date_key": entry.date_key}
        )
        
        return await ClinicRhythmService.get_by_id(entry_id)
    
    @staticmethod
    async def update_status(
        entry_id: str,
        status: str,
        updated_by: str,
        updated_by_email: str
    ) -> Optional[ClinicRhythmEntry]:
        """Update entry status (publish/unpublish/archive)"""
        db = get_database()
        
        entry = await ClinicRhythmService.get_by_id(entry_id)
        if not entry:
            return None
        
        update_data = {
            "status": status,
            "updated_by": updated_by,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        if status == "published" and not entry.published_at:
            update_data["published_at"] = datetime.now(timezone.utc).isoformat()
        
        await db[ClinicRhythmService.COLLECTION].update_one(
            {"id": entry_id},
            {"$set": update_data}
        )
        
        # Audit log
        await AuditService.log(
            action=f"clinic_rhythm.{status}",
            actor_user_id=updated_by,
            actor_email=updated_by_email,
            entity_type="clinic_rhythm",
            entity_id=entry_id,
            metadata={"date_key": entry.date_key, "new_status": status}
        )
        
        return await ClinicRhythmService.get_by_id(entry_id)
    
    @staticmethod
    async def delete(entry_id: str, deleted_by: str, deleted_by_email: str) -> bool:
        """Delete an entry"""
        db = get_database()
        
        entry = await ClinicRhythmService.get_by_id(entry_id)
        if not entry:
            return False
        
        result = await db[ClinicRhythmService.COLLECTION].delete_one({"id": entry_id})
        
        if result.deleted_count > 0:
            await AuditService.log(
                action="clinic_rhythm.delete",
                actor_user_id=deleted_by,
                actor_email=deleted_by_email,
                entity_type="clinic_rhythm",
                entity_id=entry_id,
                metadata={"date_key": entry.date_key}
            )
            return True
        
        return False
