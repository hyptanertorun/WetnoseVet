from pydantic import BaseModel, Field
from typing import Optional, List
from models.service import ContentStatus
from models.team import SocialLinks, Education, Certification, WorkingSchedule

# --- Team Member Schemas ---

class TeamMemberCreate(BaseModel):
    full_name: str = Field(..., min_length=2)
    slug: Optional[str] = None
    role_title: str = Field(..., min_length=2)
    department: Optional[str] = None
    specialties: List[str] = []
    bio: Optional[str] = None
    short_bio: Optional[str] = None
    photo_url: str
    photo_alt: Optional[str] = None
    photo_thumbnail: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    social_links: Optional[SocialLinks] = None
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
    status: ContentStatus = ContentStatus.DRAFT
    sort_order: int = 0


class TeamMemberUpdate(BaseModel):
    full_name: Optional[str] = None
    slug: Optional[str] = None
    role_title: Optional[str] = None
    department: Optional[str] = None
    specialties: Optional[List[str]] = None
    bio: Optional[str] = None
    short_bio: Optional[str] = None
    photo_url: Optional[str] = None
    photo_alt: Optional[str] = None
    photo_thumbnail: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    social_links: Optional[SocialLinks] = None
    experience: Optional[str] = None
    experience_years: Optional[int] = None
    quote: Optional[str] = None
    education: Optional[List[Education]] = None
    certifications: Optional[List[Certification]] = None
    working_schedule: Optional[WorkingSchedule] = None
    accepts_appointments: Optional[bool] = None
    is_owner: Optional[bool] = None
    is_featured: Optional[bool] = None
    show_contact_info: Optional[bool] = None
    sort_order: Optional[int] = None


class TeamMemberStatusUpdate(BaseModel):
    status: ContentStatus


class TeamMemberReorderItem(BaseModel):
    id: str
    sort_order: int


class TeamMemberReorderRequest(BaseModel):
    items: List[TeamMemberReorderItem]


class TeamMemberResponse(BaseModel):
    id: str
    full_name: str
    slug: str
    role_title: str
    department: Optional[str]
    specialties: List[str]
    bio: Optional[str]
    short_bio: Optional[str]
    photo_url: str
    photo_alt: Optional[str]
    photo_thumbnail: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    social_links: SocialLinks
    experience: Optional[str]
    experience_years: Optional[int]
    quote: Optional[str]
    education: List[Education]
    certifications: List[Certification]
    working_schedule: Optional[WorkingSchedule]
    accepts_appointments: bool
    is_owner: bool
    is_featured: bool
    show_contact_info: bool
    status: ContentStatus
    sort_order: int
    archived_at: Optional[str]
    created_at: str
    updated_at: str
    created_by: Optional[str]
    updated_by: Optional[str]


class TeamMemberListResponse(BaseModel):
    team_members: List[TeamMemberResponse]
    total: int
    page: int
    page_size: int


class TeamMemberPublicResponse(BaseModel):
    id: str
    full_name: str
    slug: str
    role_title: str
    department: Optional[str]
    specialties: List[str]
    bio: Optional[str]
    short_bio: Optional[str]
    photo_url: str
    photo_alt: Optional[str]
    photo_thumbnail: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    social_links: SocialLinks
    experience: Optional[str]
    experience_years: Optional[int]
    quote: Optional[str]
    education: List[Education]
    certifications: List[Certification]
    working_schedule: Optional[WorkingSchedule]
    accepts_appointments: bool
    is_owner: bool
    is_featured: bool
    show_contact_info: bool


class TeamMemberPublicListResponse(BaseModel):
    team_members: List[TeamMemberPublicResponse]
    total: int
