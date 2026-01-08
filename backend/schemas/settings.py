from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models.settings import WorkingHours

class SettingsUpdate(BaseModel):
    clinic_name: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    emergency_phone: Optional[str] = None  # Acil Hat Numarası
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    maps_embed_url: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    twitter_url: Optional[str] = None
    youtube_url: Optional[str] = None  # NEW
    pinterest_url: Optional[str] = None  # NEW
    tiktok_url: Optional[str] = None  # NEW
    working_hours: Optional[List[WorkingHours]] = None
    is_24_7_emergency: Optional[bool] = None
    kvkk_text: Optional[str] = None
    maintenance_mode: Optional[bool] = None
    maintenance_message: Optional[str] = None
    maintenance_end_date: Optional[datetime] = None

class SettingsResponse(BaseModel):
    id: str
    clinic_name: str
    phone: str
    whatsapp: str
    emergency_phone: str  # Acil Hat Numarası
    email: str
    address: str
    city: str
    district: str
    maps_embed_url: Optional[str]
    facebook_url: Optional[str]
    instagram_url: Optional[str]
    twitter_url: Optional[str]
    youtube_url: Optional[str]  # NEW
    pinterest_url: Optional[str]  # NEW
    tiktok_url: Optional[str]  # NEW
    working_hours: List[WorkingHours]
    is_24_7_emergency: bool
    kvkk_text: Optional[str]
    maintenance_mode: bool
    maintenance_message: Optional[str]
    maintenance_end_date: Optional[datetime]
    updated_at: datetime
    updated_by: Optional[str]
