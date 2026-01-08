from fastapi import APIRouter, Depends
from typing import List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel

from services.appointment_service import AppointmentService
from middleware.auth import get_current_user, get_current_active_user
from models.user import User
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/dashboard", tags=["Admin Dashboard"])

class TodaySummary(BaseModel):
    new_requests: int
    contacted: int
    scheduled: int
    hot_leads: int
    today_follow_ups: int
    overdue_follow_ups: int

class FollowUpItem(BaseModel):
    id: str
    name: str
    phone: str
    email: str | None
    pet_name: str | None
    service_requested: str | None
    follow_up_at: str | None
    status: str
    lead_heat: str
    lead_score: int
    is_overdue: bool

class TrendDataPoint(BaseModel):
    date: str
    count: int

class DashboardResponse(BaseModel):
    today_summary: TodaySummary
    follow_ups_today: List[FollowUpItem]
    overdue_follow_ups: List[FollowUpItem]
    weekly_trend: List[TrendDataPoint]

@router.get("/stats", response_model=DashboardResponse)
async def get_dashboard_stats(current_user: User = Depends(get_current_active_user)):
    """Get dashboard statistics for clinic summary"""
    from db.mongodb import get_database
    db = get_database()
    
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    # Today's summary from CRM stats
    stats = await AppointmentService.get_stats()
    
    # Get today's new requests (created today)
    new_today = await db["appointment_requests"].count_documents({
        "created_at": {
            "$gte": today_start.isoformat(),
            "$lt": today_end.isoformat()
        }
    })
    
    # Get contacted today
    contacted_today = await db["appointment_requests"].count_documents({
        "contacted_at": {
            "$gte": today_start.isoformat(),
            "$lt": today_end.isoformat()
        }
    })
    
    # Get scheduled today
    scheduled_today = await db["appointment_requests"].count_documents({
        "scheduled_at": {
            "$gte": today_start.isoformat(),
            "$lt": today_end.isoformat()
        }
    })
    
    # Hot leads (total)
    hot_leads = await db["appointment_requests"].count_documents({
        "lead_heat": "hot",
        "status": {"$nin": ["completed", "cancelled", "no_show"]}
    })
    
    # Follow-ups due today
    follow_ups_today_count = await db["appointment_requests"].count_documents({
        "follow_up_at": {
            "$gte": today_start.isoformat(),
            "$lt": today_end.isoformat()
        },
        "status": {"$nin": ["completed", "cancelled", "no_show"]}
    })
    
    # Overdue follow-ups (before today, not completed)
    overdue_count = await db["appointment_requests"].count_documents({
        "follow_up_at": {"$lt": today_start.isoformat()},
        "status": {"$nin": ["completed", "cancelled", "no_show"]}
    })
    
    # Get follow-up items for today
    follow_ups_today_cursor = db["appointment_requests"].find(
        {
            "follow_up_at": {
                "$gte": today_start.isoformat(),
                "$lt": today_end.isoformat()
            },
            "status": {"$nin": ["completed", "cancelled", "no_show"]}
        },
        {"_id": 0}
    ).sort("follow_up_at", 1).limit(10)
    
    follow_ups_today_docs = await follow_ups_today_cursor.to_list(length=10)
    
    follow_ups_today = [
        FollowUpItem(
            id=doc["id"],
            name=doc["name"],
            phone=doc["phone"],
            email=doc.get("email"),
            pet_name=doc.get("pet_name"),
            service_requested=doc.get("service_requested"),
            follow_up_at=doc.get("follow_up_at"),
            status=doc["status"],
            lead_heat=doc.get("lead_heat", "warm"),
            lead_score=doc.get("lead_score", 50),
            is_overdue=False
        )
        for doc in follow_ups_today_docs
    ]
    
    # Get overdue follow-ups
    overdue_cursor = db["appointment_requests"].find(
        {
            "follow_up_at": {"$lt": today_start.isoformat()},
            "status": {"$nin": ["completed", "cancelled", "no_show"]}
        },
        {"_id": 0}
    ).sort("follow_up_at", 1).limit(10)
    
    overdue_docs = await overdue_cursor.to_list(length=10)
    
    overdue_follow_ups = [
        FollowUpItem(
            id=doc["id"],
            name=doc["name"],
            phone=doc["phone"],
            email=doc.get("email"),
            pet_name=doc.get("pet_name"),
            service_requested=doc.get("service_requested"),
            follow_up_at=doc.get("follow_up_at"),
            status=doc["status"],
            lead_heat=doc.get("lead_heat", "warm"),
            lead_score=doc.get("lead_score", 50),
            is_overdue=True
        )
        for doc in overdue_docs
    ]
    
    # Weekly trend (last 7 days)
    weekly_trend = []
    for i in range(6, -1, -1):
        day_start = (today_start - timedelta(days=i))
        day_end = day_start + timedelta(days=1)
        
        count = await db["appointment_requests"].count_documents({
            "created_at": {
                "$gte": day_start.isoformat(),
                "$lt": day_end.isoformat()
            }
        })
        
        weekly_trend.append(TrendDataPoint(
            date=day_start.strftime("%Y-%m-%d"),
            count=count
        ))
    
    return DashboardResponse(
        today_summary=TodaySummary(
            new_requests=new_today,
            contacted=contacted_today,
            scheduled=scheduled_today,
            hot_leads=hot_leads,
            today_follow_ups=follow_ups_today_count,
            overdue_follow_ups=overdue_count
        ),
        follow_ups_today=follow_ups_today,
        overdue_follow_ups=overdue_follow_ups,
        weekly_trend=weekly_trend
    )
