from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from uuid import uuid4
from enum import Enum


class ClinicRhythmStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class FeaturedQuestion(BaseModel):
    """The daily featured question block"""
    question_text: str = Field(..., min_length=5, max_length=500)
    short_answer: str = Field(..., min_length=10, max_length=1000)
    related_blog_slug: Optional[str] = None
    related_blog_title: Optional[str] = None
    source_hint: Optional[str] = None  # "crm", "blog", "feedback", "manual"


class FalseAlarm(BaseModel):
    """The false alarm reassurance block"""
    message_title: Optional[str] = Field(None, max_length=200)
    message_body: str = Field(..., min_length=20, max_length=1000)
    supportive_line: str = Field(
        default="Şüphede kalırsanız yazmanız yeterli.",
        max_length=300
    )


class ClinicRhythmEntry(BaseModel):
    """Daily clinic rhythm entry model"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    date_key: str = Field(...)  # YYYY-MM-DD format, unique
    
    featured_question: Optional[FeaturedQuestion] = None
    false_alarm: Optional[FalseAlarm] = None
    
    status: ClinicRhythmStatus = ClinicRhythmStatus.DRAFT
    
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None
    
    def to_dict(self) -> dict:
        """Convert to dictionary for MongoDB storage"""
        data = {
            "id": self.id,
            "date_key": self.date_key,
            "featured_question": self.featured_question.model_dump() if self.featured_question else None,
            "false_alarm": self.false_alarm.model_dump() if self.false_alarm else None,
            "status": self.status.value,
            "created_by": self.created_by,
            "updated_by": self.updated_by,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "published_at": self.published_at.isoformat() if self.published_at else None,
        }
        return data
