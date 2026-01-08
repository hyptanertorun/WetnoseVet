from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# --- Input Schemas ---

class FeaturedQuestionInput(BaseModel):
    question_text: str = Field(..., min_length=5, max_length=500)
    short_answer: str = Field(..., min_length=10, max_length=1000)
    related_blog_slug: Optional[str] = None
    related_blog_title: Optional[str] = None
    source_hint: Optional[str] = None


class FalseAlarmInput(BaseModel):
    message_title: Optional[str] = Field(None, max_length=200)
    message_body: str = Field(..., min_length=20, max_length=1000)
    supportive_line: str = Field(
        default="Şüphede kalırsanız yazmanız yeterli.",
        max_length=300
    )


class ClinicRhythmCreate(BaseModel):
    date_key: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")  # YYYY-MM-DD
    featured_question: Optional[FeaturedQuestionInput] = None
    false_alarm: Optional[FalseAlarmInput] = None


class ClinicRhythmUpdate(BaseModel):
    featured_question: Optional[FeaturedQuestionInput] = None
    false_alarm: Optional[FalseAlarmInput] = None


class ClinicRhythmStatusUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(draft|published|archived)$")


# --- Response Schemas ---

class FeaturedQuestionResponse(BaseModel):
    question_text: str
    short_answer: str
    related_blog_slug: Optional[str] = None
    related_blog_title: Optional[str] = None
    source_hint: Optional[str] = None


class FalseAlarmResponse(BaseModel):
    message_title: Optional[str] = None
    message_body: str
    supportive_line: str


class ClinicRhythmResponse(BaseModel):
    id: str
    date_key: str
    featured_question: Optional[FeaturedQuestionResponse] = None
    false_alarm: Optional[FalseAlarmResponse] = None
    status: str
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    published_at: Optional[str] = None


class ClinicRhythmListResponse(BaseModel):
    entries: List[ClinicRhythmResponse]
    total: int


# --- Public Response (minimal) ---

class ClinicRhythmPublicResponse(BaseModel):
    date_key: str
    featured_question: Optional[FeaturedQuestionResponse] = None
    false_alarm: Optional[FalseAlarmResponse] = None
