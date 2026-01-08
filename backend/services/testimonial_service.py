from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timezone, timedelta
from db.mongodb import get_database
from models.testimonial import Testimonial, TestimonialStatus, FeedbackType, TestimonialSource
import logging

logger = logging.getLogger(__name__)

class TestimonialService:
    COLLECTION = "testimonials"
    
    @staticmethod
    async def submit_public_feedback(
        full_name: str,
        pet_name: str,
        rating: int,
        feedback_type: str,
        comment: str,
        consent_internal: bool,
        consent_public: bool,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        pet_photo_url: Optional[str] = None,
        service_id: Optional[str] = None
    ) -> Testimonial:
        """Submit feedback from public form"""
        db = get_database()
        
        # Get service name if service_id provided
        service_name_snapshot = None
        if service_id:
            service = await db.services.find_one({"id": service_id}, {"_id": 0, "title": 1})
            if service:
                service_name_snapshot = service.get("title")
        
        testimonial = Testimonial(
            full_name=full_name,
            email=email,
            phone=phone,
            pet_name=pet_name,
            pet_photo_url=pet_photo_url,
            service_id=service_id,
            service_name_snapshot=service_name_snapshot,
            rating=rating,
            feedback_type=FeedbackType(feedback_type),
            comment=comment,
            consent_internal=consent_internal,
            consent_public=consent_public,
            status=TestimonialStatus.PENDING,
            source=TestimonialSource.POST_TREATMENT
        )
        
        doc = testimonial.model_dump()
        doc["_id"] = testimonial.id
        doc["submitted_at"] = testimonial.submitted_at.isoformat()
        doc["status"] = testimonial.status.value
        doc["feedback_type"] = testimonial.feedback_type.value
        doc["source"] = testimonial.source.value
        
        await db[TestimonialService.COLLECTION].insert_one(doc)
        logger.info(f"Public feedback submitted: {testimonial.id}")
        
        return testimonial
    
    @staticmethod
    async def create(
        full_name: str,
        pet_name: str,
        rating: int,
        comment: str,
        created_by: str,
        **kwargs
    ) -> Testimonial:
        """Create testimonial from admin panel"""
        db = get_database()
        
        # Get service name if service_id provided
        service_id = kwargs.get("service_id")
        service_name_snapshot = None
        if service_id:
            service = await db.services.find_one({"id": service_id}, {"_id": 0, "title": 1})
            if service:
                service_name_snapshot = service.get("title")
        
        status = TestimonialStatus(kwargs.get("status", "pending"))
        feedback_type = FeedbackType(kwargs.get("feedback_type", "positive"))
        
        testimonial = Testimonial(
            full_name=full_name,
            pet_name=pet_name,
            rating=rating,
            comment=comment,
            service_name_snapshot=service_name_snapshot,
            status=status,
            feedback_type=feedback_type,
            source=TestimonialSource.MANUAL,
            **{k: v for k, v in kwargs.items() if k not in ["status", "feedback_type"]}
        )
        
        # If approved, set approval info
        if status == TestimonialStatus.APPROVED:
            testimonial.approved_at = datetime.now(timezone.utc)
            testimonial.approved_by = created_by
        
        doc = testimonial.model_dump()
        doc["_id"] = testimonial.id
        doc["submitted_at"] = testimonial.submitted_at.isoformat()
        doc["approved_at"] = testimonial.approved_at.isoformat() if testimonial.approved_at else None
        doc["archived_at"] = testimonial.archived_at.isoformat() if testimonial.archived_at else None
        doc["status"] = testimonial.status.value
        doc["feedback_type"] = testimonial.feedback_type.value
        doc["source"] = testimonial.source.value
        
        await db[TestimonialService.COLLECTION].insert_one(doc)
        logger.info(f"Admin created testimonial: {testimonial.id}")
        
        return testimonial
    
    @staticmethod
    async def get_by_id(testimonial_id: str) -> Optional[Dict[str, Any]]:
        """Get testimonial by ID as dict"""
        db = get_database()
        doc = await db[TestimonialService.COLLECTION].find_one({"id": testimonial_id}, {"_id": 0})
        return doc
    
    @staticmethod
    async def get_list(
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        rating: Optional[int] = None,
        service_id: Optional[str] = None,
        feedback_type: Optional[str] = None,
        consent_public: Optional[bool] = None,
        search: Optional[str] = None,
        include_archived: bool = False,
        sort_by: str = "submitted_at",
        sort_order: str = "desc"
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Get paginated list of testimonials for admin"""
        db = get_database()
        
        query: Dict[str, Any] = {}
        
        if not include_archived:
            query["archived_at"] = None
        
        if status:
            query["status"] = status
        
        if rating:
            query["rating"] = rating
        
        if service_id:
            query["service_id"] = service_id
        
        if feedback_type:
            query["feedback_type"] = feedback_type
        
        if consent_public is not None:
            query["consent_public"] = consent_public
        
        if search:
            query["$or"] = [
                {"full_name": {"$regex": search, "$options": "i"}},
                {"pet_name": {"$regex": search, "$options": "i"}},
                {"comment": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]
        
        total = await db[TestimonialService.COLLECTION].count_documents(query)
        
        skip = (page - 1) * page_size
        sort_direction = -1 if sort_order == "desc" else 1
        
        cursor = db[TestimonialService.COLLECTION].find(query, {"_id": 0}).skip(skip).limit(page_size).sort(sort_by, sort_direction)
        docs = await cursor.to_list(page_size)
        
        # Enrich with approved_by email
        user_ids = [d.get("approved_by") for d in docs if d.get("approved_by")]
        user_emails = {}
        if user_ids:
            users = await db.users.find({"id": {"$in": user_ids}}, {"_id": 0, "id": 1, "email": 1}).to_list(100)
            user_emails = {u["id"]: u["email"] for u in users}
        
        for doc in docs:
            if doc.get("approved_by"):
                doc["approved_by_email"] = user_emails.get(doc["approved_by"])
        
        return docs, total
    
    @staticmethod
    async def get_public_testimonials(limit: int = 10) -> List[Dict[str, Any]]:
        """Get approved + consent_public testimonials for public display"""
        db = get_database()
        
        query = {
            "status": "approved",
            "consent_public": True,
            "archived_at": None
        }
        
        cursor = db[TestimonialService.COLLECTION].find(query, {"_id": 0}).sort("sort_order", 1).limit(limit)
        docs = await cursor.to_list(limit)
        
        # Format for public display - privacy protection
        result = []
        for doc in docs:
            # Show first name + last initial
            name_parts = doc.get("full_name", "").split()
            display_name = name_parts[0] if name_parts else ""
            if len(name_parts) > 1:
                display_name += f" {name_parts[-1][0]}."
            
            result.append({
                "id": doc["id"],
                "full_name": display_name,
                "pet_name": doc.get("pet_name"),
                "pet_type": doc.get("pet_type"),
                "pet_photo_url": doc.get("pet_photo_url"),
                "owner_photo_url": doc.get("owner_photo_url"),
                "service_name": doc.get("service_name_snapshot"),
                "treatment": doc.get("treatment"),
                "rating": doc.get("rating"),
                "comment": doc.get("comment", "")[:300],  # Truncate long comments
                "submitted_at": doc.get("submitted_at")
            })
        
        return result
    
    @staticmethod
    async def update(testimonial_id: str, updated_by: str, **kwargs) -> Optional[Dict[str, Any]]:
        """Update testimonial fields"""
        db = get_database()
        
        # Check if status is being changed to approved
        current = await TestimonialService.get_by_id(testimonial_id)
        if not current:
            return None
        
        update_data: Dict[str, Any] = {}
        
        for key, value in kwargs.items():
            if value is not None:
                update_data[key] = value
        
        # Handle status change to approved
        if update_data.get("status") == "approved" and current.get("status") != "approved":
            update_data["approved_at"] = datetime.now(timezone.utc).isoformat()
            update_data["approved_by"] = updated_by
        
        if not update_data:
            return current
        
        result = await db[TestimonialService.COLLECTION].update_one(
            {"id": testimonial_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0 and result.matched_count == 0:
            return None
        
        return await TestimonialService.get_by_id(testimonial_id)
    
    @staticmethod
    async def set_status(testimonial_id: str, status: str, updated_by: str) -> Optional[Dict[str, Any]]:
        """Change testimonial status"""
        return await TestimonialService.update(testimonial_id, updated_by, status=status)
    
    @staticmethod
    async def bulk_action(ids: List[str], action: str, updated_by: str) -> int:
        """Perform bulk action on multiple testimonials"""
        db = get_database()
        
        update_data: Dict[str, Any] = {}
        
        if action == "approve":
            update_data["status"] = "approved"
            update_data["approved_at"] = datetime.now(timezone.utc).isoformat()
            update_data["approved_by"] = updated_by
        elif action == "reject":
            update_data["status"] = "rejected"
        elif action == "archive":
            update_data["archived_at"] = datetime.now(timezone.utc).isoformat()
        
        result = await db[TestimonialService.COLLECTION].update_many(
            {"id": {"$in": ids}},
            {"$set": update_data}
        )
        
        return result.modified_count
    
    @staticmethod
    async def delete(testimonial_id: str) -> bool:
        """Permanently delete a testimonial"""
        db = get_database()
        result = await db[TestimonialService.COLLECTION].delete_one({"id": testimonial_id})
        return result.deleted_count > 0
    
    @staticmethod
    async def archive(testimonial_id: str) -> Optional[Dict[str, Any]]:
        """Soft delete by archiving"""
        db = get_database()
        
        result = await db[TestimonialService.COLLECTION].update_one(
            {"id": testimonial_id},
            {"$set": {"archived_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        if result.modified_count == 0:
            return None
        
        return await TestimonialService.get_by_id(testimonial_id)
    
    @staticmethod
    async def restore(testimonial_id: str) -> Optional[Dict[str, Any]]:
        """Restore archived testimonial"""
        db = get_database()
        
        result = await db[TestimonialService.COLLECTION].update_one(
            {"id": testimonial_id},
            {"$set": {"archived_at": None}}
        )
        
        if result.modified_count == 0:
            return None
        
        return await TestimonialService.get_by_id(testimonial_id)
    
    @staticmethod
    async def reorder(items: List[dict]) -> bool:
        """Reorder testimonials"""
        db = get_database()
        
        for item in items:
            await db[TestimonialService.COLLECTION].update_one(
                {"id": item["id"]},
                {"$set": {"sort_order": item["sort_order"]}}
            )
        
        return True
    
    @staticmethod
    async def get_analytics() -> Dict[str, Any]:
        """Get testimonial analytics for dashboard"""
        db = get_database()
        
        # Base query - exclude archived
        base_query = {"archived_at": None}
        
        # Total count
        total_count = await db[TestimonialService.COLLECTION].count_documents(base_query)
        
        # Pending count
        pending_count = await db[TestimonialService.COLLECTION].count_documents({**base_query, "status": "pending"})
        
        # Attention needed (rating <= 2)
        attention_needed = await db[TestimonialService.COLLECTION].count_documents({**base_query, "rating": {"$lte": 2}})
        
        # Overall average rating
        pipeline_avg = [
            {"$match": base_query},
            {"$group": {"_id": None, "avg": {"$avg": "$rating"}}}
        ]
        avg_result = await db[TestimonialService.COLLECTION].aggregate(pipeline_avg).to_list(1)
        overall_avg = round(avg_result[0]["avg"], 2) if avg_result and avg_result[0].get("avg") else 0
        
        # Last 30 days average
        thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        pipeline_30d = [
            {"$match": {**base_query, "submitted_at": {"$gte": thirty_days_ago}}},
            {"$group": {"_id": None, "avg": {"$avg": "$rating"}}}
        ]
        avg_30d_result = await db[TestimonialService.COLLECTION].aggregate(pipeline_30d).to_list(1)
        last_30_days_avg = round(avg_30d_result[0]["avg"], 2) if avg_30d_result and avg_30d_result[0].get("avg") else 0
        
        # Rating distribution
        pipeline_dist = [
            {"$match": base_query},
            {"$group": {"_id": "$rating", "count": {"$sum": 1}}},
            {"$sort": {"_id": -1}}
        ]
        dist_result = await db[TestimonialService.COLLECTION].aggregate(pipeline_dist).to_list(10)
        
        rating_distribution = []
        for i in range(5, 0, -1):
            count = next((r["count"] for r in dist_result if r["_id"] == i), 0)
            percentage = round((count / total_count * 100) if total_count > 0 else 0, 1)
            rating_distribution.append({"rating": i, "count": count, "percentage": percentage})
        
        # Feedback type distribution
        pipeline_type = [
            {"$match": base_query},
            {"$group": {"_id": "$feedback_type", "count": {"$sum": 1}}}
        ]
        type_result = await db[TestimonialService.COLLECTION].aggregate(pipeline_type).to_list(10)
        type_counts = {r["_id"]: r["count"] for r in type_result}
        
        positive_count = type_counts.get("positive", 0)
        neutral_count = type_counts.get("neutral", 0)
        negative_count = type_counts.get("negative", 0)
        
        total_typed = positive_count + neutral_count + negative_count
        positive_ratio = round((positive_count / total_typed * 100) if total_typed > 0 else 0, 1)
        
        # Service-based stats
        pipeline_service = [
            {"$match": {**base_query, "service_id": {"$ne": None}}},
            {"$group": {
                "_id": "$service_id",
                "service_name": {"$first": "$service_name_snapshot"},
                "count": {"$sum": 1},
                "avg_rating": {"$avg": "$rating"}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        service_result = await db[TestimonialService.COLLECTION].aggregate(pipeline_service).to_list(10)
        
        service_stats = [
            {
                "service_id": s["_id"],
                "service_name": s.get("service_name") or "Bilinmeyen Hizmet",
                "count": s["count"],
                "avg_rating": round(s["avg_rating"], 2)
            }
            for s in service_result
        ]
        
        return {
            "overall_avg_rating": overall_avg,
            "last_30_days_avg_rating": last_30_days_avg,
            "total_count": total_count,
            "rating_distribution": rating_distribution,
            "positive_count": positive_count,
            "neutral_count": neutral_count,
            "negative_count": negative_count,
            "positive_ratio": positive_ratio,
            "service_stats": service_stats,
            "attention_needed_count": attention_needed,
            "pending_count": pending_count
        }
    
    @staticmethod
    async def migrate_old_format():
        """Migrate old testimonials to new format"""
        db = get_database()
        
        # Find documents without new fields
        old_docs = await db[TestimonialService.COLLECTION].find(
            {"$or": [
                {"status": {"$exists": False}},
                {"full_name": {"$exists": False}}
            ]},
            {"_id": 0}
        ).to_list(1000)
        
        for doc in old_docs:
            update = {}
            
            # Map old fields to new
            if "author_name" in doc and "full_name" not in doc:
                update["full_name"] = doc["author_name"]
            
            if "content" in doc and "comment" not in doc:
                update["comment"] = doc["content"]
            
            if "approved" in doc and "status" not in doc:
                update["status"] = "approved" if doc["approved"] else "pending"
            
            if "submitted_at" not in doc and "created_at" in doc:
                update["submitted_at"] = doc["created_at"]
            
            if "feedback_type" not in doc:
                update["feedback_type"] = "positive"
            
            if "consent_internal" not in doc:
                update["consent_internal"] = True
            
            if "consent_public" not in doc:
                update["consent_public"] = doc.get("approved", False)
            
            if "source" not in doc:
                update["source"] = "manual"
            
            if update:
                await db[TestimonialService.COLLECTION].update_one(
                    {"id": doc["id"]},
                    {"$set": update}
                )
        
        logger.info(f"Migrated {len(old_docs)} old testimonials")
        return len(old_docs)
