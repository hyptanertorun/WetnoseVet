from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid

class AppointmentStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class LeadHeat(str, Enum):
    COLD = "cold"
    WARM = "warm"
    HOT = "hot"

class FeedbackStatus(str, Enum):
    NOT_SENT = "not_sent"
    SENT = "sent"
    RECEIVED = "received"

class AppointmentNote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content: str
    created_by: str
    created_by_email: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LeadScoreReason(BaseModel):
    factor: str
    points: int
    description: str

class AppointmentRequest(BaseModel):
    model_config = ConfigDict(use_enum_values=True)
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Contact Info
    name: str
    phone: str
    email: Optional[str] = None
    
    # Pet Info
    pet_name: Optional[str] = None
    pet_type: Optional[str] = None  # dog, cat, bird, etc.
    pet_breed: Optional[str] = None
    
    # Request Details
    service_requested: Optional[str] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    message: Optional[str] = None
    source: str = "website"  # website, whatsapp, phone, walk-in
    
    # CRM Fields
    status: AppointmentStatus = AppointmentStatus.NEW
    assigned_to: Optional[str] = None  # user_id
    assigned_to_email: Optional[str] = None
    follow_up_at: Optional[datetime] = None
    notes: List[AppointmentNote] = []
    
    # Lead Scoring
    lead_score: int = 50  # 0-100
    lead_heat: LeadHeat = LeadHeat.WARM
    lead_score_reasons: List[LeadScoreReason] = []
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    contacted_at: Optional[datetime] = None
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # Feedback tracking
    feedback_link: Optional[str] = None
    feedback_sent_at: Optional[datetime] = None
    feedback_status: str = "not_sent"  # not_sent, sent, received
    
    def calculate_lead_score(self) -> None:
        """Calculate lead score based on various factors"""
        score = 50  # Base score
        reasons = []
        
        # Email provided (+10)
        if self.email:
            score += 10
            reasons.append(LeadScoreReason(
                factor="email_provided",
                points=10,
                description="E-posta adresi verildi"
            ))
        
        # Pet info complete (+15)
        if self.pet_name and self.pet_type:
            score += 15
            reasons.append(LeadScoreReason(
                factor="pet_info_complete",
                points=15,
                description="Evcil hayvan bilgileri tam"
            ))
        
        # Specific service requested (+10)
        if self.service_requested:
            score += 10
            reasons.append(LeadScoreReason(
                factor="service_specified",
                points=10,
                description="Belirli bir hizmet talep edildi"
            ))
        
        # Preferred date/time specified (+15)
        if self.preferred_date or self.preferred_time:
            score += 15
            reasons.append(LeadScoreReason(
                factor="time_preference",
                points=15,
                description="Tercih edilen tarih/saat belirtildi"
            ))
        
        # Message with details (+10)
        if self.message and len(self.message) > 50:
            score += 10
            reasons.append(LeadScoreReason(
                factor="detailed_message",
                points=10,
                description="Detaylı mesaj yazıldı"
            ))
        
        # Urgency keywords (+20)
        urgency_keywords = ["acil", "hemen", "bugün", "yarın", "emergency", "urgent"]
        if self.message and any(kw in self.message.lower() for kw in urgency_keywords):
            score += 20
            reasons.append(LeadScoreReason(
                factor="urgency_detected",
                points=20,
                description="Acil durum tespit edildi"
            ))
        
        # Cap at 100
        score = min(score, 100)
        
        # Determine heat
        if score >= 80:
            heat = LeadHeat.HOT
        elif score >= 60:
            heat = LeadHeat.WARM
        else:
            heat = LeadHeat.COLD
        
        self.lead_score = score
        self.lead_heat = heat
        self.lead_score_reasons = reasons
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "phone": self.phone,
            "email": self.email,
            "pet_name": self.pet_name,
            "pet_type": self.pet_type,
            "pet_breed": self.pet_breed,
            "service_requested": self.service_requested,
            "preferred_date": self.preferred_date,
            "preferred_time": self.preferred_time,
            "message": self.message,
            "source": self.source,
            "status": self.status,
            "assigned_to": self.assigned_to,
            "assigned_to_email": self.assigned_to_email,
            "follow_up_at": self.follow_up_at.isoformat() if self.follow_up_at else None,
            "notes": [note.model_dump() for note in self.notes] if self.notes else [],
            "lead_score": self.lead_score,
            "lead_heat": self.lead_heat,
            "lead_score_reasons": [r.model_dump() for r in self.lead_score_reasons],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "contacted_at": self.contacted_at.isoformat() if self.contacted_at else None,
            "scheduled_at": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "feedback_link": self.feedback_link,
            "feedback_sent_at": self.feedback_sent_at.isoformat() if self.feedback_sent_at else None,
            "feedback_status": self.feedback_status,
        }
