from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# --- AI Generation Input Schema ---

class AIBlogGenerateRequest(BaseModel):
    """Request schema for AI blog generation"""
    topic_title: str = Field(..., min_length=5, max_length=200)
    target_keyword: str = Field(..., min_length=2, max_length=100)
    secondary_keywords: Optional[str] = None  # Comma-separated
    location_target: Optional[str] = None
    tone: str = Field(default="professional", pattern="^(professional|warm|informative)$")
    content_length: str = Field(default="medium", pattern="^(short|medium|long)$")
    cta_preference: str = Field(default="appointment", pattern="^(appointment|whatsapp|none)$")

class AIBlogReviseRequest(BaseModel):
    """Request schema for AI content revision"""
    blog_post_id: str
    instruction: str = Field(..., min_length=5, max_length=500)
    # Predefined instructions:
    # - "Daha kısa yap"
    # - "Daha tıbbi anlat"
    # - "Daha sıcak bir dil kullan"
    # - "SEO'yu güçlendir"
    # - "FAQ sayısını artır"

# --- AI Output Schema (what GPT returns) ---

class FAQItem(BaseModel):
    question: str
    answer: str

class CTABlock(BaseModel):
    type: str  # appointment, whatsapp, none
    text: str

class AIBlogOutput(BaseModel):
    """Structured output from AI"""
    title: str
    slug: str
    meta_title: str
    meta_description: str
    outline: List[str]
    content_html: str
    faq: List[FAQItem]
    schema_jsonld: str
    tags: List[str]
    category_suggestion: str
    cta_block: CTABlock
    disclaimer: str

# --- Response Schemas ---

class AIGenerationResponse(BaseModel):
    id: str
    user_id: str
    user_email: str
    blog_post_id: Optional[str]
    topic_title: str
    target_keyword: str
    tone: str
    content_length: str
    output_json: Optional[dict]
    model: str
    is_revision: bool
    revision_instruction: Optional[str]
    status: str
    error_message: Optional[str]
    created_at: str
    processing_time_ms: Optional[int]

class AIGenerationListResponse(BaseModel):
    generations: List[AIGenerationResponse]
    total: int
