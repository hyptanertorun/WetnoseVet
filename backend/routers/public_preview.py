"""
Public Preview API - Token-gated access to draft content
All responses include no-cache headers and noindex directive
"""

from fastapi import APIRouter, HTTPException, Depends, Response
from typing import Optional

from routers.preview import get_preview_token
from services.blog_service import BlogService
from services.service_service import ServiceService
from services.team_service import TeamService
from services.clinic_rhythm_service import ClinicRhythmService
from services.testimonial_service import TestimonialService
from db.mongodb import get_database
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/public/preview", tags=["Public Preview"])


def add_preview_headers(response: Response):
    """Add no-cache and noindex headers to preview responses"""
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["X-Robots-Tag"] = "noindex, nofollow"
    response.headers["X-Preview-Mode"] = "true"


# --- Blog Preview ---

@router.get("/blog/{post_id}")
async def preview_blog_post(
    post_id: str,
    response: Response,
    token_payload: dict = Depends(get_preview_token)
):
    """Preview a blog post (any status including draft)"""
    add_preview_headers(response)
    
    db = get_database()
    post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog yazısı bulunamadı")
    
    return {
        "id": post.get("id"),
        "title": post.get("title"),
        "slug": post.get("slug"),
        "excerpt": post.get("excerpt"),
        "content": post.get("content"),
        "cover_image_url": post.get("cover_image_url"),
        "category": post.get("category"),
        "tags": post.get("tags", []),
        "seo": post.get("seo", {}),
        "faqs": post.get("faqs", []),
        "cta_block": post.get("cta_block"),
        "status": post.get("status"),
        "author_name": post.get("author_name"),
        "author_title": post.get("author_title"),
        "author_avatar_url": post.get("author_avatar_url"),
        "created_at": post.get("created_at"),
        "updated_at": post.get("updated_at"),
        "published_at": post.get("published_at"),
        "_preview": True,
        "_preview_by": token_payload.get("user_email")
    }


# --- Service Preview ---

@router.get("/services/{service_id}")
async def preview_service(
    service_id: str,
    response: Response,
    token_payload: dict = Depends(get_preview_token)
):
    """Preview a service (any status including draft)"""
    add_preview_headers(response)
    
    db = get_database()
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    
    if not service:
        raise HTTPException(status_code=404, detail="Hizmet bulunamadı")
    
    return {
        "id": service.get("id"),
        "title": service.get("title"),
        "slug": service.get("slug"),
        "short_description": service.get("short_description"),
        "full_description": service.get("full_description"),
        "icon_name": service.get("icon_name"),
        "cover_image_url": service.get("cover_image_url"),
        "price_info": service.get("price_info"),
        "duration": service.get("duration"),
        "is_popular": service.get("is_popular", False),
        "is_emergency": service.get("is_emergency", False),
        "status": service.get("status"),
        "order_index": service.get("order_index", 0),
        "_preview": True,
        "_preview_by": token_payload.get("user_email")
    }


# --- Team Member Preview ---

@router.get("/team-members/{member_id}")
async def preview_team_member(
    member_id: str,
    response: Response,
    token_payload: dict = Depends(get_preview_token)
):
    """Preview a team member (any status including draft)"""
    add_preview_headers(response)
    
    db = get_database()
    member = await db.team_members.find_one({"id": member_id}, {"_id": 0})
    
    if not member:
        raise HTTPException(status_code=404, detail="Ekip üyesi bulunamadı")
    
    return {
        "id": member.get("id"),
        "full_name": member.get("full_name"),
        "slug": member.get("slug"),
        "title": member.get("title"),
        "bio": member.get("bio"),
        "photo_url": member.get("photo_url"),
        "specialties": member.get("specialties", []),
        "education": member.get("education", []),
        "certifications": member.get("certifications", []),
        "is_veterinarian": member.get("is_veterinarian", False),
        "status": member.get("status"),
        "order_index": member.get("order_index", 0),
        "_preview": True,
        "_preview_by": token_payload.get("user_email")
    }


# --- Clinic Rhythm Preview ---

@router.get("/clinic-rhythm/{entry_id}")
async def preview_clinic_rhythm(
    entry_id: str,
    response: Response,
    token_payload: dict = Depends(get_preview_token)
):
    """Preview a clinic rhythm entry (any status including draft)"""
    add_preview_headers(response)
    
    entry = await ClinicRhythmService.get_by_id(entry_id)
    
    if not entry:
        raise HTTPException(status_code=404, detail="Klinik ritmi kaydı bulunamadı")
    
    return {
        "id": entry.id,
        "date_key": entry.date_key,
        "featured_question": entry.featured_question,
        "false_alarm": entry.false_alarm,
        "status": entry.status,
        "created_at": entry.created_at,
        "updated_at": entry.updated_at,
        "_preview": True,
        "_preview_by": token_payload.get("user_email")
    }


# --- Testimonial Preview ---

@router.get("/testimonials/{testimonial_id}")
async def preview_testimonial(
    testimonial_id: str,
    response: Response,
    token_payload: dict = Depends(get_preview_token)
):
    """Preview a testimonial (any status including pending)"""
    add_preview_headers(response)
    
    db = get_database()
    testimonial = await db.testimonials.find_one({"id": testimonial_id}, {"_id": 0})
    
    if not testimonial:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    
    return {
        "id": testimonial.get("id"),
        "owner_name": testimonial.get("owner_name"),
        "pet_name": testimonial.get("pet_name"),
        "pet_type": testimonial.get("pet_type"),
        "rating": testimonial.get("rating"),
        "comment": testimonial.get("comment"),
        "photo_url": testimonial.get("photo_url"),
        "status": testimonial.get("status"),
        "consent_public": testimonial.get("consent_public", False),
        "created_at": testimonial.get("created_at"),
        "_preview": True,
        "_preview_by": token_payload.get("user_email")
    }
