"""Pool item schemas for Klinik Ritmi"""
from pydantic import BaseModel, Field
from typing import Optional, List


# --- Question Pool Schemas ---

class QuestionPoolCreate(BaseModel):
    question_text: str = Field(..., min_length=5, max_length=500)
    short_answer: str = Field(..., min_length=10, max_length=1000)
    related_blog_slug: Optional[str] = None
    related_blog_title: Optional[str] = None
    category: Optional[str] = None


class QuestionPoolUpdate(BaseModel):
    question_text: Optional[str] = Field(None, min_length=5, max_length=500)
    short_answer: Optional[str] = Field(None, min_length=10, max_length=1000)
    related_blog_slug: Optional[str] = None
    related_blog_title: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = Field(None, pattern=r"^(active|inactive|archived)$")


class QuestionPoolResponse(BaseModel):
    id: str
    question_text: str
    short_answer: str
    related_blog_slug: Optional[str] = None
    related_blog_title: Optional[str] = None
    category: Optional[str] = None
    status: str
    usage_count: int = 0
    last_used_date: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class QuestionPoolListResponse(BaseModel):
    questions: List[QuestionPoolResponse]
    total: int


# --- Alarm Pool Schemas ---

class AlarmPoolCreate(BaseModel):
    message_title: str = Field(..., min_length=2, max_length=200)
    message_body: str = Field(..., min_length=10, max_length=1000)
    supportive_line: str = Field(..., min_length=10, max_length=500)
    category: Optional[str] = None


class AlarmPoolUpdate(BaseModel):
    message_title: Optional[str] = Field(None, min_length=2, max_length=200)
    message_body: Optional[str] = Field(None, min_length=10, max_length=1000)
    supportive_line: Optional[str] = Field(None, min_length=10, max_length=500)
    category: Optional[str] = None
    status: Optional[str] = Field(None, pattern=r"^(active|inactive|archived)$")


class AlarmPoolResponse(BaseModel):
    id: str
    message_title: str
    message_body: str
    supportive_line: str
    category: Optional[str] = None
    status: str
    usage_count: int = 0
    last_used_date: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class AlarmPoolListResponse(BaseModel):
    alarms: List[AlarmPoolResponse]
    total: int


# --- Stats Schema ---

class PoolStatsResponse(BaseModel):
    total_questions: int
    total_alarms: int
    active_questions: int
    active_alarms: int
    total_combinations: int
