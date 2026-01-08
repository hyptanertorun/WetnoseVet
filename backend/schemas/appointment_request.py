from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models.appointment_request import AppointmentStatus, LeadHeat, FeedbackStatus, AppointmentNote, LeadScoreReason

# --- Create/Update Schemas ---

class AppointmentRequestCreate(BaseModel):
    name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=10)
    email: Optional[str] = None
    pet_name: Optional[str] = None
    pet_type: Optional[str] = None
    pet_breed: Optional[str] = None
    service_requested: Optional[str] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    message: Optional[str] = None
    source: str = "website"

class AppointmentRequestUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    pet_name: Optional[str] = None
    pet_type: Optional[str] = None
    pet_breed: Optional[str] = None
    service_requested: Optional[str] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    message: Optional[str] = None
    assigned_to: Optional[str] = None
    follow_up_at: Optional[datetime] = None

class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus

class AppointmentAssignUpdate(BaseModel):
    assigned_to: str

class AppointmentFollowUpUpdate(BaseModel):
    follow_up_at: datetime

class AppointmentNoteCreate(BaseModel):
    content: str = Field(..., min_length=1)

class FeedbackSentUpdate(BaseModel):
    """Mark feedback as sent"""
    pass  # No fields needed, just triggers the action

# --- Response Schemas ---

class AppointmentNoteResponse(BaseModel):
    id: str
    content: str
    created_by: str
    created_by_email: str
    created_at: str

class LeadScoreReasonResponse(BaseModel):
    factor: str
    points: int
    description: str

class AppointmentRequestResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str]
    pet_name: Optional[str]
    pet_type: Optional[str]
    pet_breed: Optional[str]
    service_requested: Optional[str]
    preferred_date: Optional[str]
    preferred_time: Optional[str]
    message: Optional[str]
    source: str
    status: AppointmentStatus
    assigned_to: Optional[str]
    assigned_to_email: Optional[str]
    follow_up_at: Optional[str]
    notes: List[AppointmentNoteResponse]
    lead_score: int
    lead_heat: LeadHeat
    lead_score_reasons: List[LeadScoreReasonResponse]
    created_at: str
    updated_at: str
    contacted_at: Optional[str]
    scheduled_at: Optional[str]
    completed_at: Optional[str]
    # Feedback fields
    feedback_link: Optional[str]
    feedback_sent_at: Optional[str]
    feedback_status: str

class AppointmentRequestListResponse(BaseModel):
    appointments: List[AppointmentRequestResponse]
    total: int
    page: int
    page_size: int

# --- Statistics Schema ---

class AppointmentStats(BaseModel):
    total: int
    new: int
    contacted: int
    scheduled: int
    completed: int
    cancelled: int
    no_show: int
    hot_leads: int
    warm_leads: int
    cold_leads: int
    today_follow_ups: int
