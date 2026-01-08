"""Pool service for managing Klinik Ritmi content pool"""
from typing import Optional, List, Tuple
from datetime import datetime, timezone
from uuid import uuid4
import logging

from db.mongodb import get_database
from models.pool_item import QuestionPoolItem, AlarmPoolItem, PoolItemStatus
from services.audit_service import AuditService

logger = logging.getLogger(__name__)


class PoolService:
    QUESTIONS_COLLECTION = "rhythm_question_pool"
    ALARMS_COLLECTION = "rhythm_alarm_pool"

    # =====================
    # QUESTION POOL METHODS
    # =====================

    @staticmethod
    def _deserialize_question(doc: dict) -> QuestionPoolItem:
        """Convert MongoDB document to QuestionPoolItem"""
        if not doc:
            return None
        return QuestionPoolItem(
            id=doc.get("id"),
            question_text=doc.get("question_text"),
            short_answer=doc.get("short_answer"),
            related_blog_slug=doc.get("related_blog_slug"),
            related_blog_title=doc.get("related_blog_title"),
            category=doc.get("category"),
            status=PoolItemStatus(doc.get("status", "active")),
            usage_count=doc.get("usage_count", 0),
            last_used_date=doc.get("last_used_date"),
            created_at=datetime.fromisoformat(doc["created_at"]) if doc.get("created_at") else datetime.now(timezone.utc),
            updated_at=datetime.fromisoformat(doc["updated_at"]) if doc.get("updated_at") else datetime.now(timezone.utc),
            created_by=doc.get("created_by"),
            updated_by=doc.get("updated_by"),
        )

    @staticmethod
    async def list_questions(
        status: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[QuestionPoolItem], int]:
        """List questions from the pool"""
        db = get_database()
        
        query = {}
        if status:
            query["status"] = status
        if category:
            query["category"] = category
        if search:
            query["$or"] = [
                {"question_text": {"$regex": search, "$options": "i"}},
                {"short_answer": {"$regex": search, "$options": "i"}}
            ]
        
        total = await db[PoolService.QUESTIONS_COLLECTION].count_documents(query)
        cursor = db[PoolService.QUESTIONS_COLLECTION].find(
            query, {"_id": 0}
        ).sort("created_at", -1).skip(skip).limit(limit)
        
        docs = await cursor.to_list(limit)
        return [PoolService._deserialize_question(doc) for doc in docs], total

    @staticmethod
    async def get_question_by_id(question_id: str) -> Optional[QuestionPoolItem]:
        """Get a question by ID"""
        db = get_database()
        doc = await db[PoolService.QUESTIONS_COLLECTION].find_one(
            {"id": question_id}, {"_id": 0}
        )
        return PoolService._deserialize_question(doc) if doc else None

    @staticmethod
    async def create_question(
        question_text: str,
        short_answer: str,
        created_by: str,
        created_by_email: str,
        related_blog_slug: Optional[str] = None,
        related_blog_title: Optional[str] = None,
        category: Optional[str] = None
    ) -> QuestionPoolItem:
        """Create a new question in the pool"""
        db = get_database()
        
        item = QuestionPoolItem(
            question_text=question_text,
            short_answer=short_answer,
            related_blog_slug=related_blog_slug,
            related_blog_title=related_blog_title,
            category=category,
            created_by=created_by,
            updated_by=created_by,
        )
        
        doc = item.to_dict()
        doc["_id"] = item.id
        await db[PoolService.QUESTIONS_COLLECTION].insert_one(doc)
        
        await AuditService.log(
            action="pool.question.create",
            actor_user_id=created_by,
            actor_email=created_by_email,
            entity_type="question_pool",
            entity_id=item.id,
            metadata={"question_text": question_text[:50]}
        )
        
        return item

    @staticmethod
    async def update_question(
        question_id: str,
        updated_by: str,
        updated_by_email: str,
        **kwargs
    ) -> Optional[QuestionPoolItem]:
        """Update a question in the pool"""
        db = get_database()
        
        item = await PoolService.get_question_by_id(question_id)
        if not item:
            return None
        
        update_data = {
            "updated_by": updated_by,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Only update provided fields
        allowed_fields = ["question_text", "short_answer", "related_blog_slug", 
                         "related_blog_title", "category", "status"]
        for field in allowed_fields:
            if field in kwargs and kwargs[field] is not None:
                update_data[field] = kwargs[field]
        
        await db[PoolService.QUESTIONS_COLLECTION].update_one(
            {"id": question_id},
            {"$set": update_data}
        )
        
        await AuditService.log(
            action="pool.question.update",
            actor_user_id=updated_by,
            actor_email=updated_by_email,
            entity_type="question_pool",
            entity_id=question_id,
            metadata={"updated_fields": list(update_data.keys())}
        )
        
        return await PoolService.get_question_by_id(question_id)

    @staticmethod
    async def delete_question(
        question_id: str,
        deleted_by: str,
        deleted_by_email: str
    ) -> bool:
        """Delete a question from the pool (hard delete)"""
        db = get_database()
        
        item = await PoolService.get_question_by_id(question_id)
        if not item:
            return False
        
        result = await db[PoolService.QUESTIONS_COLLECTION].delete_one({"id": question_id})
        
        if result.deleted_count > 0:
            await AuditService.log(
                action="pool.question.delete",
                actor_user_id=deleted_by,
                actor_email=deleted_by_email,
                entity_type="question_pool",
                entity_id=question_id,
                metadata={"question_text": item.question_text[:50]}
            )
            return True
        return False

    # ==================
    # ALARM POOL METHODS
    # ==================

    @staticmethod
    def _deserialize_alarm(doc: dict) -> AlarmPoolItem:
        """Convert MongoDB document to AlarmPoolItem"""
        if not doc:
            return None
        return AlarmPoolItem(
            id=doc.get("id"),
            message_title=doc.get("message_title"),
            message_body=doc.get("message_body"),
            supportive_line=doc.get("supportive_line"),
            category=doc.get("category"),
            status=PoolItemStatus(doc.get("status", "active")),
            usage_count=doc.get("usage_count", 0),
            last_used_date=doc.get("last_used_date"),
            created_at=datetime.fromisoformat(doc["created_at"]) if doc.get("created_at") else datetime.now(timezone.utc),
            updated_at=datetime.fromisoformat(doc["updated_at"]) if doc.get("updated_at") else datetime.now(timezone.utc),
            created_by=doc.get("created_by"),
            updated_by=doc.get("updated_by"),
        )

    @staticmethod
    async def list_alarms(
        status: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[AlarmPoolItem], int]:
        """List alarms from the pool"""
        db = get_database()
        
        query = {}
        if status:
            query["status"] = status
        if category:
            query["category"] = category
        if search:
            query["$or"] = [
                {"message_title": {"$regex": search, "$options": "i"}},
                {"message_body": {"$regex": search, "$options": "i"}}
            ]
        
        total = await db[PoolService.ALARMS_COLLECTION].count_documents(query)
        cursor = db[PoolService.ALARMS_COLLECTION].find(
            query, {"_id": 0}
        ).sort("created_at", -1).skip(skip).limit(limit)
        
        docs = await cursor.to_list(limit)
        return [PoolService._deserialize_alarm(doc) for doc in docs], total

    @staticmethod
    async def get_alarm_by_id(alarm_id: str) -> Optional[AlarmPoolItem]:
        """Get an alarm by ID"""
        db = get_database()
        doc = await db[PoolService.ALARMS_COLLECTION].find_one(
            {"id": alarm_id}, {"_id": 0}
        )
        return PoolService._deserialize_alarm(doc) if doc else None

    @staticmethod
    async def create_alarm(
        message_title: str,
        message_body: str,
        supportive_line: str,
        created_by: str,
        created_by_email: str,
        category: Optional[str] = None
    ) -> AlarmPoolItem:
        """Create a new alarm in the pool"""
        db = get_database()
        
        item = AlarmPoolItem(
            message_title=message_title,
            message_body=message_body,
            supportive_line=supportive_line,
            category=category,
            created_by=created_by,
            updated_by=created_by,
        )
        
        doc = item.to_dict()
        doc["_id"] = item.id
        await db[PoolService.ALARMS_COLLECTION].insert_one(doc)
        
        await AuditService.log(
            action="pool.alarm.create",
            actor_user_id=created_by,
            actor_email=created_by_email,
            entity_type="alarm_pool",
            entity_id=item.id,
            metadata={"message_title": message_title}
        )
        
        return item

    @staticmethod
    async def update_alarm(
        alarm_id: str,
        updated_by: str,
        updated_by_email: str,
        **kwargs
    ) -> Optional[AlarmPoolItem]:
        """Update an alarm in the pool"""
        db = get_database()
        
        item = await PoolService.get_alarm_by_id(alarm_id)
        if not item:
            return None
        
        update_data = {
            "updated_by": updated_by,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        allowed_fields = ["message_title", "message_body", "supportive_line", "category", "status"]
        for field in allowed_fields:
            if field in kwargs and kwargs[field] is not None:
                update_data[field] = kwargs[field]
        
        await db[PoolService.ALARMS_COLLECTION].update_one(
            {"id": alarm_id},
            {"$set": update_data}
        )
        
        await AuditService.log(
            action="pool.alarm.update",
            actor_user_id=updated_by,
            actor_email=updated_by_email,
            entity_type="alarm_pool",
            entity_id=alarm_id,
            metadata={"updated_fields": list(update_data.keys())}
        )
        
        return await PoolService.get_alarm_by_id(alarm_id)

    @staticmethod
    async def delete_alarm(
        alarm_id: str,
        deleted_by: str,
        deleted_by_email: str
    ) -> bool:
        """Delete an alarm from the pool (hard delete)"""
        db = get_database()
        
        item = await PoolService.get_alarm_by_id(alarm_id)
        if not item:
            return False
        
        result = await db[PoolService.ALARMS_COLLECTION].delete_one({"id": alarm_id})
        
        if result.deleted_count > 0:
            await AuditService.log(
                action="pool.alarm.delete",
                actor_user_id=deleted_by,
                actor_email=deleted_by_email,
                entity_type="alarm_pool",
                entity_id=alarm_id,
                metadata={"message_title": item.message_title}
            )
            return True
        return False

    # ==============
    # STATS & UTILS
    # ==============

    @staticmethod
    async def get_pool_stats() -> dict:
        """Get statistics about the content pool"""
        db = get_database()
        
        total_questions = await db[PoolService.QUESTIONS_COLLECTION].count_documents({})
        active_questions = await db[PoolService.QUESTIONS_COLLECTION].count_documents({"status": "active"})
        total_alarms = await db[PoolService.ALARMS_COLLECTION].count_documents({})
        active_alarms = await db[PoolService.ALARMS_COLLECTION].count_documents({"status": "active"})
        
        return {
            "total_questions": total_questions,
            "total_alarms": total_alarms,
            "active_questions": active_questions,
            "active_alarms": active_alarms,
            "total_combinations": active_questions * active_alarms
        }

    @staticmethod
    async def get_active_questions() -> List[dict]:
        """Get all active questions for public API"""
        db = get_database()
        cursor = db[PoolService.QUESTIONS_COLLECTION].find(
            {"status": "active"}, {"_id": 0}
        )
        docs = await cursor.to_list(1000)
        return [
            {
                "question_text": doc.get("question_text"),
                "short_answer": doc.get("short_answer"),
                "related_blog_slug": doc.get("related_blog_slug"),
                "related_blog_title": doc.get("related_blog_title")
            }
            for doc in docs
        ]

    @staticmethod
    async def get_active_alarms() -> List[dict]:
        """Get all active alarms for public API"""
        db = get_database()
        cursor = db[PoolService.ALARMS_COLLECTION].find(
            {"status": "active"}, {"_id": 0}
        )
        docs = await cursor.to_list(1000)
        return [
            {
                "message_title": doc.get("message_title"),
                "message_body": doc.get("message_body"),
                "supportive_line": doc.get("supportive_line")
            }
            for doc in docs
        ]

    @staticmethod
    async def seed_from_static_pool():
        """Seed the database from static pool file (one-time operation)"""
        from data.clinic_rhythm_pool import FEATURED_QUESTIONS_POOL, FALSE_ALARMS_POOL
        
        db = get_database()
        
        # Check if already seeded
        existing_questions = await db[PoolService.QUESTIONS_COLLECTION].count_documents({})
        existing_alarms = await db[PoolService.ALARMS_COLLECTION].count_documents({})
        
        if existing_questions > 0 and existing_alarms > 0:
            logger.info(f"Pool already seeded: {existing_questions} questions, {existing_alarms} alarms")
            return {
                "seeded": False,
                "message": "Pool already has data",
                "questions": existing_questions,
                "alarms": existing_alarms
            }
        
        # Seed questions
        questions_to_insert = []
        for i, q in enumerate(FEATURED_QUESTIONS_POOL):
            # Determine category based on position in the list
            if i < 20:
                category = "kedi"
            elif i < 40:
                category = "kopek"
            else:
                category = "genel"
            
            item = QuestionPoolItem(
                question_text=q["question_text"],
                short_answer=q["short_answer"],
                related_blog_slug=q.get("related_blog_slug"),
                related_blog_title=q.get("related_blog_title"),
                category=category,
                created_by="system",
                updated_by="system",
            )
            doc = item.to_dict()
            doc["_id"] = item.id
            questions_to_insert.append(doc)
        
        if questions_to_insert:
            await db[PoolService.QUESTIONS_COLLECTION].insert_many(questions_to_insert)
            logger.info(f"Seeded {len(questions_to_insert)} questions")
        
        # Seed alarms
        alarms_to_insert = []
        for i, a in enumerate(FALSE_ALARMS_POOL):
            # Determine category based on position
            if i < 20:
                category = "fiziksel"
            elif i < 40:
                category = "davranissal"
            else:
                category = "mevsimsel"
            
            item = AlarmPoolItem(
                message_title=a["message_title"],
                message_body=a["message_body"],
                supportive_line=a["supportive_line"],
                category=category,
                created_by="system",
                updated_by="system",
            )
            doc = item.to_dict()
            doc["_id"] = item.id
            alarms_to_insert.append(doc)
        
        if alarms_to_insert:
            await db[PoolService.ALARMS_COLLECTION].insert_many(alarms_to_insert)
            logger.info(f"Seeded {len(alarms_to_insert)} alarms")
        
        return {
            "seeded": True,
            "message": "Pool seeded successfully",
            "questions": len(questions_to_insert),
            "alarms": len(alarms_to_insert)
        }
