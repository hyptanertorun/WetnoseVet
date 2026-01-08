"""Pool item models for Klinik Ritmi content pool"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
from uuid import uuid4
from enum import Enum


class PoolItemStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"


class QuestionPoolItem(BaseModel):
    """Question pool item for Klinik Ritmi"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    question_text: str = Field(..., min_length=5, max_length=500)
    short_answer: str = Field(..., min_length=10, max_length=1000)
    related_blog_slug: Optional[str] = None
    related_blog_title: Optional[str] = None
    category: Optional[str] = None  # e.g., "kedi", "kopek", "genel"
    status: PoolItemStatus = PoolItemStatus.ACTIVE
    usage_count: int = 0
    last_used_date: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

    def to_dict(self) -> dict:
        """Convert to dictionary for MongoDB storage"""
        return {
            "id": self.id,
            "question_text": self.question_text,
            "short_answer": self.short_answer,
            "related_blog_slug": self.related_blog_slug,
            "related_blog_title": self.related_blog_title,
            "category": self.category,
            "status": self.status.value,
            "usage_count": self.usage_count,
            "last_used_date": self.last_used_date,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "created_by": self.created_by,
            "updated_by": self.updated_by,
        }


class AlarmPoolItem(BaseModel):
    """False alarm pool item for Klinik Ritmi"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    message_title: str = Field(..., min_length=2, max_length=200)
    message_body: str = Field(..., min_length=10, max_length=1000)
    supportive_line: str = Field(..., min_length=10, max_length=500)
    category: Optional[str] = None  # e.g., "fiziksel", "davranissal", "mevsimsel"
    status: PoolItemStatus = PoolItemStatus.ACTIVE
    usage_count: int = 0
    last_used_date: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

    def to_dict(self) -> dict:
        """Convert to dictionary for MongoDB storage"""
        return {
            "id": self.id,
            "message_title": self.message_title,
            "message_body": self.message_body,
            "supportive_line": self.supportive_line,
            "category": self.category,
            "status": self.status.value,
            "usage_count": self.usage_count,
            "last_used_date": self.last_used_date,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "created_by": self.created_by,
            "updated_by": self.updated_by,
        }
