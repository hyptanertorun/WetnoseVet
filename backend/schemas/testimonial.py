from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime


# --- Public Feedback Form Schema ---

class PublicFeedbackSubmit(BaseModel):
    """Schema for public feedback form submission"""
    full_name: str = Field(..., min_length=2, max_length=100)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    pet_name: str = Field(..., min_length=1, max_length=100)
    pet_photo_url: Optional[str] = None  # Will be set after upload
    service_id: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    feedback_type: str = Field(..., pattern="^(positive|neutral|negative)$")
    comment: str = Field(..., min_length=10, max_length=2000)
    consent_internal: bool = True  # Always required
    consent_public: bool = False   # Optional
    honeypot: Optional[str] = None  # Anti-spam field
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if v and '@' not in v:
            raise ValueError('Geçersiz e-posta adresi')
        return v
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v:
            # Basic phone validation - allow digits, spaces, +, (, )
            cleaned = ''.join(c for c in v if c.isdigit())
            if len(cleaned) < 10:
                raise ValueError('Geçersiz telefon numarası')
        return v


# --- Admin Create/Update Schemas ---

class TestimonialCreate(BaseModel):
    """Admin creates testimonial manually"""
    full_name: str = Field(..., min_length=2)
    email: Optional[str] = None
    phone: Optional[str] = None
    pet_name: str = Field(..., min_length=1)
    pet_type: Optional[str] = None
    pet_photo_url: Optional[str] = None
    owner_photo_url: Optional[str] = None
    treatment: Optional[str] = None
    service_id: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    feedback_type: str = "positive"
    comment: str = Field(..., min_length=10)
    consent_internal: bool = True
    consent_public: bool = False
    status: str = "pending"
    admin_note: Optional[str] = None
    sort_order: int = 0


class TestimonialUpdate(BaseModel):
    """Admin updates testimonial"""
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    pet_name: Optional[str] = None
    pet_photo_url: Optional[str] = None
    service_id: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback_type: Optional[str] = None
    comment: Optional[str] = None
    consent_public: Optional[bool] = None  # Can be edited by admin
    status: Optional[str] = None
    admin_note: Optional[str] = None
    sort_order: Optional[int] = None


class TestimonialStatusUpdate(BaseModel):
    """Quick status change"""
    status: str = Field(..., pattern="^(pending|approved|rejected)$")


class TestimonialBulkAction(BaseModel):
    """Bulk actions on multiple testimonials"""
    ids: List[str] = Field(..., min_length=1)
    action: str = Field(..., pattern="^(approve|reject|archive)$")


class TestimonialReorderItem(BaseModel):
    id: str
    sort_order: int


class TestimonialReorder(BaseModel):
    items: List[TestimonialReorderItem]


# --- Response Schemas ---

class TestimonialResponse(BaseModel):
    id: str
    full_name: str
    email: Optional[str]
    phone: Optional[str]
    pet_name: str
    pet_photo_url: Optional[str]
    service_id: Optional[str]
    service_name_snapshot: Optional[str]
    rating: int
    feedback_type: str
    comment: str
    consent_internal: bool
    consent_public: bool
    status: str
    admin_note: Optional[str]
    submitted_at: Optional[str]
    approved_at: Optional[str]
    approved_by: Optional[str]
    approved_by_email: Optional[str] = None
    source: str
    archived_at: Optional[str]
    sort_order: int


class TestimonialListResponse(BaseModel):
    testimonials: List[TestimonialResponse]
    total: int
    page: int
    page_size: int


# --- Public Response Schemas ---

class TestimonialPublicResponse(BaseModel):
    """What the public sees - minimal info"""
    id: str
    full_name: str  # First name + initial of last name for privacy
    pet_name: str
    pet_type: Optional[str] = None
    pet_photo_url: Optional[str] = None
    owner_photo_url: Optional[str] = None
    service_name: Optional[str] = None
    treatment: Optional[str] = None
    rating: int
    comment: str  # May be truncated or edited version
    submitted_at: Optional[str] = None


class TestimonialPublicListResponse(BaseModel):
    testimonials: List[TestimonialPublicResponse]
    total: int


# --- Analytics Schemas ---

class RatingDistribution(BaseModel):
    rating: int
    count: int
    percentage: float


class ServiceRatingStats(BaseModel):
    service_id: str
    service_name: str
    count: int
    avg_rating: float


class TestimonialAnalytics(BaseModel):
    overall_avg_rating: float
    last_30_days_avg_rating: float
    total_count: int
    rating_distribution: List[RatingDistribution]
    positive_count: int
    neutral_count: int
    negative_count: int
    positive_ratio: float
    service_stats: List[ServiceRatingStats]
    attention_needed_count: int  # rating <= 2
    pending_count: int


# --- Feedback Success Response ---

class FeedbackSubmitResponse(BaseModel):
    success: bool
    message: str
    id: Optional[str] = None
