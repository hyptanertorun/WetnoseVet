from datetime import datetime, timezone, timedelta
from typing import Optional, List
from db.mongodb import get_database
from models.appointment_request import AppointmentRequest, AppointmentStatus, LeadHeat, AppointmentNote
import logging

logger = logging.getLogger(__name__)

class AppointmentService:
    COLLECTION = "appointment_requests"
    
    @staticmethod
    async def create(data: dict, created_by: Optional[str] = None) -> AppointmentRequest:
        """Create a new appointment request"""
        db = get_database()
        
        request = AppointmentRequest(**data)
        request.calculate_lead_score()
        
        doc = request.to_dict()
        doc["_id"] = request.id
        
        await db[AppointmentService.COLLECTION].insert_one(doc)
        logger.info(f"Created appointment request: {request.id}")
        
        return request
    
    @staticmethod
    async def get_by_id(request_id: str) -> Optional[AppointmentRequest]:
        """Get appointment request by ID"""
        db = get_database()
        
        doc = await db[AppointmentService.COLLECTION].find_one(
            {"id": request_id},
            {"_id": 0}
        )
        
        if doc:
            # Convert stored notes back to AppointmentNote objects
            if "notes" in doc and doc["notes"]:
                doc["notes"] = [AppointmentNote(**n) for n in doc["notes"]]
            return AppointmentRequest(**doc)
        return None
    
    @staticmethod
    async def get_all(
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        lead_heat: Optional[str] = None,
        assigned_to: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> tuple[List[AppointmentRequest], int]:
        """Get all appointment requests with filters"""
        db = get_database()
        
        # Build query
        query = {}
        
        if status:
            query["status"] = status
        
        if lead_heat:
            query["lead_heat"] = lead_heat
        
        if assigned_to:
            if assigned_to == "unassigned":
                query["assigned_to"] = None
            else:
                query["assigned_to"] = assigned_to
        
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"phone": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"pet_name": {"$regex": search, "$options": "i"}},
            ]
        
        # Count total
        total = await db[AppointmentService.COLLECTION].count_documents(query)
        
        # Sort
        sort_direction = -1 if sort_order == "desc" else 1
        
        # Get paginated results
        skip = (page - 1) * page_size
        cursor = db[AppointmentService.COLLECTION].find(
            query,
            {"_id": 0}
        ).sort(sort_by, sort_direction).skip(skip).limit(page_size)
        
        docs = await cursor.to_list(length=page_size)
        
        requests = []
        for doc in docs:
            if "notes" in doc and doc["notes"]:
                doc["notes"] = [AppointmentNote(**n) for n in doc["notes"]]
            requests.append(AppointmentRequest(**doc))
        
        return requests, total
    
    @staticmethod
    async def update(request_id: str, data: dict, updated_by: str) -> Optional[AppointmentRequest]:
        """Update an appointment request"""
        db = get_database()
        
        # Filter out None values
        update_data = {k: v for k, v in data.items() if v is not None}
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        result = await db[AppointmentService.COLLECTION].update_one(
            {"id": request_id},
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            return await AppointmentService.get_by_id(request_id)
        return None
    
    @staticmethod
    async def update_status(
        request_id: str,
        status: AppointmentStatus,
        updated_by: str
    ) -> Optional[AppointmentRequest]:
        """Update appointment status with timestamp"""
        db = get_database()
        
        now = datetime.now(timezone.utc).isoformat()
        update_data = {
            "status": status.value,
            "updated_at": now
        }
        
        # Set status-specific timestamps
        if status == AppointmentStatus.CONTACTED:
            update_data["contacted_at"] = now
        elif status == AppointmentStatus.SCHEDULED:
            update_data["scheduled_at"] = now
        elif status == AppointmentStatus.COMPLETED:
            update_data["completed_at"] = now
            # Auto-generate feedback link when completed
            appointment = await AppointmentService.get_by_id(request_id)
            if appointment and not appointment.feedback_link:
                feedback_link = AppointmentService.generate_feedback_link(appointment)
                update_data["feedback_link"] = feedback_link
                update_data["feedback_status"] = "not_sent"
        
        result = await db[AppointmentService.COLLECTION].update_one(
            {"id": request_id},
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            return await AppointmentService.get_by_id(request_id)
        return None
    
    @staticmethod
    def generate_feedback_link(appointment: AppointmentRequest, base_url: str = "") -> str:
        """Generate feedback link with prefilled data"""
        params = []
        
        if appointment.service_requested:
            # Try to find service ID by name
            params.append(f"service_name={appointment.service_requested}")
        
        if appointment.pet_name:
            from urllib.parse import quote
            params.append(f"pet_name={quote(appointment.pet_name)}")
        
        query_string = "&".join(params) if params else ""
        return f"/geri-bildirim?{query_string}" if query_string else "/geri-bildirim"
    
    @staticmethod
    async def mark_feedback_sent(request_id: str) -> Optional[AppointmentRequest]:
        """Mark feedback as sent"""
        db = get_database()
        
        now = datetime.now(timezone.utc).isoformat()
        result = await db[AppointmentService.COLLECTION].update_one(
            {"id": request_id},
            {"$set": {
                "feedback_sent_at": now,
                "feedback_status": "sent",
                "updated_at": now
            }}
        )
        
        if result.modified_count > 0:
            return await AppointmentService.get_by_id(request_id)
        return None
    
    @staticmethod
    async def mark_feedback_received(request_id: str) -> Optional[AppointmentRequest]:
        """Mark feedback as received"""
        db = get_database()
        
        now = datetime.now(timezone.utc).isoformat()
        result = await db[AppointmentService.COLLECTION].update_one(
            {"id": request_id},
            {"$set": {
                "feedback_status": "received",
                "updated_at": now
            }}
        )
        
        if result.modified_count > 0:
            return await AppointmentService.get_by_id(request_id)
        return None
    
    @staticmethod
    async def check_feedback_received_by_phone(phone: str) -> bool:
        """Check if there's a completed appointment matching a phone that submitted feedback"""
        db = get_database()
        
        # Find completed appointment with this phone
        appointment = await db[AppointmentService.COLLECTION].find_one({
            "phone": phone,
            "status": "completed",
            "feedback_status": {"$ne": "received"}
        })
        
        if appointment:
            # Update feedback status
            await db[AppointmentService.COLLECTION].update_one(
                {"id": appointment["id"]},
                {"$set": {
                    "feedback_status": "received",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            return True
        return False
    
    @staticmethod
    async def assign(
        request_id: str,
        assigned_to: str,
        assigned_to_email: str
    ) -> Optional[AppointmentRequest]:
        """Assign request to a user"""
        db = get_database()
        
        result = await db[AppointmentService.COLLECTION].update_one(
            {"id": request_id},
            {"$set": {
                "assigned_to": assigned_to,
                "assigned_to_email": assigned_to_email,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        if result.modified_count > 0:
            return await AppointmentService.get_by_id(request_id)
        return None
    
    @staticmethod
    async def add_note(
        request_id: str,
        content: str,
        created_by: str,
        created_by_email: str
    ) -> Optional[AppointmentRequest]:
        """Add a note to appointment request"""
        db = get_database()
        
        note = AppointmentNote(
            content=content,
            created_by=created_by,
            created_by_email=created_by_email
        )
        
        # Convert note to dict for MongoDB
        note_dict = {
            "id": note.id,
            "content": note.content,
            "created_by": note.created_by,
            "created_by_email": note.created_by_email,
            "created_at": note.created_at.isoformat()
        }
        
        result = await db[AppointmentService.COLLECTION].update_one(
            {"id": request_id},
            {
                "$push": {"notes": note_dict},
                "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
            }
        )
        
        if result.modified_count > 0:
            return await AppointmentService.get_by_id(request_id)
        return None
    
    @staticmethod
    async def set_follow_up(
        request_id: str,
        follow_up_at: datetime
    ) -> Optional[AppointmentRequest]:
        """Set follow-up date"""
        db = get_database()
        
        result = await db[AppointmentService.COLLECTION].update_one(
            {"id": request_id},
            {"$set": {
                "follow_up_at": follow_up_at.isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        if result.modified_count > 0:
            return await AppointmentService.get_by_id(request_id)
        return None
    
    @staticmethod
    async def get_stats() -> dict:
        """Get appointment statistics"""
        db = get_database()
        
        # Get counts by status
        pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        status_counts = await db[AppointmentService.COLLECTION].aggregate(pipeline).to_list(length=20)
        status_map = {s["_id"]: s["count"] for s in status_counts}
        
        # Get counts by lead heat
        pipeline = [
            {"$group": {"_id": "$lead_heat", "count": {"$sum": 1}}}
        ]
        heat_counts = await db[AppointmentService.COLLECTION].aggregate(pipeline).to_list(length=10)
        heat_map = {h["_id"]: h["count"] for h in heat_counts}
        
        # Today's follow-ups
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)
        today_follow_ups = await db[AppointmentService.COLLECTION].count_documents({
            "follow_up_at": {
                "$gte": today.isoformat(),
                "$lt": tomorrow.isoformat()
            },
            "status": {"$nin": ["completed", "cancelled", "no_show"]}
        })
        
        total = await db[AppointmentService.COLLECTION].count_documents({})
        
        return {
            "total": total,
            "new": status_map.get("new", 0),
            "contacted": status_map.get("contacted", 0),
            "scheduled": status_map.get("scheduled", 0),
            "completed": status_map.get("completed", 0),
            "cancelled": status_map.get("cancelled", 0),
            "no_show": status_map.get("no_show", 0),
            "hot_leads": heat_map.get("hot", 0),
            "warm_leads": heat_map.get("warm", 0),
            "cold_leads": heat_map.get("cold", 0),
            "today_follow_ups": today_follow_ups
        }
    
    @staticmethod
    async def get_for_export(
        status: Optional[str] = None,
        lead_heat: Optional[str] = None,
        assigned_to: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> List[dict]:
        """Get appointments for CSV export"""
        db = get_database()
        
        query = {}
        
        if status:
            query["status"] = status
        
        if lead_heat:
            query["lead_heat"] = lead_heat
        
        if assigned_to:
            query["assigned_to"] = assigned_to
        
        if date_from or date_to:
            query["created_at"] = {}
            if date_from:
                query["created_at"]["$gte"] = date_from.isoformat()
            if date_to:
                query["created_at"]["$lte"] = date_to.isoformat()
        
        cursor = db[AppointmentService.COLLECTION].find(
            query,
            {"_id": 0}
        ).sort("created_at", -1)
        
        docs = await cursor.to_list(length=10000)
        
        # Flatten for CSV
        export_data = []
        for doc in docs:
            export_data.append({
                "ID": doc.get("id"),
                "İsim": doc.get("name"),
                "Telefon": doc.get("phone"),
                "E-posta": doc.get("email", ""),
                "Evcil Hayvan Adı": doc.get("pet_name", ""),
                "Evcil Hayvan Türü": doc.get("pet_type", ""),
                "Talep Edilen Hizmet": doc.get("service_requested", ""),
                "Tercih Edilen Tarih": doc.get("preferred_date", ""),
                "Tercih Edilen Saat": doc.get("preferred_time", ""),
                "Mesaj": doc.get("message", ""),
                "Kaynak": doc.get("source", ""),
                "Durum": doc.get("status"),
                "Atanan": doc.get("assigned_to_email", ""),
                "Lead Puanı": doc.get("lead_score", 0),
                "Lead Sıcaklığı": doc.get("lead_heat", ""),
                "Oluşturulma": doc.get("created_at", ""),
                "Takip Tarihi": doc.get("follow_up_at", ""),
            })
        
        return export_data
