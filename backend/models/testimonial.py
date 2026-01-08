from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid

class FeedbackType(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"

class TestimonialStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class TestimonialSource(str, Enum):
    POST_TREATMENT = "post-treatment"
    MANUAL = "manual"
    IMPORT = "import"

class Testimonial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Contact info
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    
    # Pet info
    pet_name: str
    pet_type: Optional[str] = None
    pet_photo_url: Optional[str] = None
    owner_photo_url: Optional[str] = None
    treatment: Optional[str] = None
    
    # Service reference
    service_id: Optional[str] = None
    service_name_snapshot: Optional[str] = None
    
    # Feedback content
    rating: int = Field(ge=1, le=5)
    feedback_type: FeedbackType = FeedbackType.POSITIVE
    comment: str
    
    # Consent flags
    consent_internal: bool = True  # Required, always true on submit
    consent_public: bool = False   # Optional, for public display
    
    # Status & admin
    status: TestimonialStatus = TestimonialStatus.PENDING
    admin_note: Optional[str] = None
    
    # Timestamps
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    
    # Source tracking
    source: TestimonialSource = TestimonialSource.POST_TREATMENT
    
    # Soft delete
    archived_at: Optional[datetime] = None
    
    # Display order for approved ones
    sort_order: int = 0
    
    # Legacy compatibility
    @property
    def author_name(self) -> str:
        return self.full_name
    
    @property
    def content(self) -> str:
        return self.comment
    
    @property
    def approved(self) -> bool:
        return self.status == TestimonialStatus.APPROVED and self.consent_public
