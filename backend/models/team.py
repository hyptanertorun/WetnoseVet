from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict
from datetime import datetime, timezone
from enum import Enum
import uuid
from models.service import generate_slug, ContentStatus


class SocialLinks(BaseModel):
    instagram: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    facebook: Optional[str] = None
    website: Optional[str] = None


class Education(BaseModel):
    """Education history item"""
    degree: str  # e.g., "Veteriner Hekim", "Doktora"
    institution: str  # e.g., "İstanbul Üniversitesi"
    year: Optional[str] = None  # e.g., "2015"
    field: Optional[str] = None  # e.g., "Veteriner Fakültesi"


class Certification(BaseModel):
    """Professional certification"""
    name: str  # e.g., "Ortopedi Uzmanlığı"
    issuer: Optional[str] = None  # e.g., "Türk Veteriner Hekimleri Birliği"
    year: Optional[str] = None
    valid_until: Optional[str] = None


class WorkingSchedule(BaseModel):
    """Working days and hours"""
    monday: Optional[str] = None  # e.g., "09:00-18:00" or null if not working
    tuesday: Optional[str] = None
    wednesday: Optional[str] = None
    thursday: Optional[str] = None
    friday: Optional[str] = None
    saturday: Optional[str] = None
    sunday: Optional[str] = None


class TeamMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    slug: str
    role_title: str  # e.g., "Veteriner Hekim", "Klinik Sahibi"
    department: Optional[str] = None  # e.g., "Cerrahi", "Dahiliye", "İdari"
    specialties: List[str] = Field(default_factory=list)
    bio: Optional[str] = None  # Rich text HTML
    short_bio: Optional[str] = None  # Short bio for cards (max 150 chars)
    
    # Photo
    photo_url: str
    photo_alt: Optional[str] = None
    photo_thumbnail: Optional[str] = None  # Smaller version for lists
    
    # Contact & Social
    email: Optional[str] = None
    phone: Optional[str] = None
    social_links: SocialLinks = Field(default_factory=SocialLinks)
    
    # Professional Info
    experience: Optional[str] = None  # e.g., "15+ Yıl Deneyim"
    experience_years: Optional[int] = None  # Numeric for sorting/filtering
    quote: Optional[str] = None  # Personal quote
    education: List[Education] = Field(default_factory=list)
    certifications: List[Certification] = Field(default_factory=list)
    
    # Working Schedule
    working_schedule: Optional[WorkingSchedule] = None
    accepts_appointments: bool = True  # Can book appointments with this member
    
    # Display Options
    is_owner: bool = False  # Clinic owner flag for special display
    is_featured: bool = False  # Show on homepage
    show_contact_info: bool = True  # Show email/phone publicly
    
    # Status & Order
    status: ContentStatus = ContentStatus.DRAFT
    sort_order: int = 0
    archived_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

class TeamMemberPublic(BaseModel):
    """Public-facing team member model"""
    model_config = ConfigDict(extra="ignore")
    
    id: str
    full_name: str
    slug: str
    role_title: str
    department: Optional[str] = None
    specialties: List[str] = []
    bio: Optional[str] = None
    short_bio: Optional[str] = None
    photo_url: str
    photo_alt: Optional[str] = None
    photo_thumbnail: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    social_links: SocialLinks
    experience: Optional[str] = None
    experience_years: Optional[int] = None
    quote: Optional[str] = None
    education: List[Education] = []
    certifications: List[Certification] = []
    working_schedule: Optional[WorkingSchedule] = None
    accepts_appointments: bool = True
    is_owner: bool = False
    is_featured: bool = False
    show_contact_info: bool = True
