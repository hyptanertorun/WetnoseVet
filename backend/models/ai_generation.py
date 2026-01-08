from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid

class ContentTone(str, Enum):
    PROFESSIONAL = "professional"
    WARM = "warm"
    INFORMATIVE = "informative"

class ContentLength(str, Enum):
    SHORT = "short"      # 800-1000 words
    MEDIUM = "medium"    # 1200-1600 words
    LONG = "long"        # 1800-2200 words

class CTAType(str, Enum):
    APPOINTMENT = "appointment"
    WHATSAPP = "whatsapp"
    NONE = "none"

class AIGeneration(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    blog_post_id: Optional[str] = None
    
    # Input payload
    topic_title: str
    target_keyword: str
    secondary_keywords: Optional[List[str]] = []
    location_target: Optional[str] = None
    tone: ContentTone = ContentTone.PROFESSIONAL
    content_length: ContentLength = ContentLength.MEDIUM
    cta_preference: CTAType = CTAType.APPOINTMENT
    
    # Output
    output_json: Optional[dict] = None
    model: str = "gpt-5.1"
    
    # Revision tracking
    is_revision: bool = False
    revision_instruction: Optional[str] = None
    parent_generation_id: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    processing_time_ms: Optional[int] = None
    
    # Status
    status: str = "pending"  # pending, completed, failed
    error_message: Optional[str] = None
