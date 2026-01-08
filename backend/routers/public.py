from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Query
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime, timezone
import os
import uuid
import io

from schemas.service import ServicePublicResponse, ServicePublicListResponse
from schemas.team import TeamMemberPublicResponse, TeamMemberPublicListResponse
from schemas.appointment_request import AppointmentRequestCreate, AppointmentRequestResponse, AppointmentNoteResponse, LeadScoreReasonResponse
from schemas.blog import BlogPostPublicResponse, BlogPostPublicListResponse, BlogPostListItemResponse, BlogSEOResponse, AIMetadataResponse, FAQItemResponse, CTABlockResponse
from schemas.gallery import GalleryAlbumPublicResponse, GalleryPublicListResponse, GalleryItemResponse
from schemas.testimonial import (
    TestimonialPublicResponse, TestimonialPublicListResponse, 
    PublicFeedbackSubmit, FeedbackSubmitResponse
)
from schemas.slider import SlidePublicResponse, SliderPublicResponse, SlideButtonResponse, SlideOverlayResponse, SliderSettingsResponse
from services.service_service import ServiceService
from services.team_service import TeamService
from services.appointment_service import AppointmentService
from services.blog_service import BlogService
from services.gallery_service import GalleryService
from services.testimonial_service import TestimonialService
from services.slider_service import SliderService
import logging

# Try to import PIL, but don't fail if not available
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

# Rate limiting storage (simple in-memory, use Redis for production)
_rate_limit_store: dict = {}

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/public", tags=["Public Content"])

# --- Public Settings (Contact Info + Social Links) ---

from services.settings_service import SettingsService

@router.get("/settings")
async def get_public_settings():
    """Get public clinic settings (contact info, social links - no auth required)"""
    settings = await SettingsService.get_settings()
    
    return {
        "clinic_name": settings.clinic_name,
        "phone": settings.phone,
        "whatsapp": settings.whatsapp,
        "emergency_phone": settings.emergency_phone,
        "email": settings.email,
        "address": settings.address,
        "city": settings.city,
        "district": settings.district,
        "is_24_7_emergency": settings.is_24_7_emergency,
        "social_links": {
            "facebook": settings.facebook_url,
            "instagram": settings.instagram_url,
            "twitter": settings.twitter_url,
            "youtube": settings.youtube_url,
            "pinterest": settings.pinterest_url,
            "tiktok": settings.tiktok_url
        }
    }


@router.get("/maintenance-status")
async def get_maintenance_status():
    """Get site maintenance status (public, no auth)"""
    settings = await SettingsService.get_settings()
    
    return {
        "maintenance_mode": settings.maintenance_mode,
        "maintenance_message": settings.maintenance_message,
        "maintenance_end_date": settings.maintenance_end_date.isoformat() if settings.maintenance_end_date else None,
        "phone": settings.phone,
        "whatsapp": settings.whatsapp,
        "email": settings.email
    }

# --- Public Services ---

@router.get("/services", response_model=ServicePublicListResponse)
async def get_public_services():
    """Get all published services (public, no auth)"""
    services = await ServiceService.get_published()
    
    return ServicePublicListResponse(
        services=[
            ServicePublicResponse(
                id=s.id,
                title=s.title,
                slug=s.slug,
                short_description=s.short_description,
                long_description=s.long_description,
                cover_image_url=s.cover_image_url,
                cover_image_alt=s.cover_image_alt,
                icon=s.icon,
                price_mode=s.price_mode,
                price_value=s.price_value,
                tags=s.tags,
                category=s.category,
                seo=s.seo
            ) for s in services
        ],
        total=len(services)
    )

@router.get("/services/{slug}", response_model=ServicePublicResponse)
async def get_public_service_by_slug(slug: str):
    """Get published service by slug (public, no auth)"""
    service = await ServiceService.get_published_by_slug(slug)
    
    if not service:
        raise HTTPException(status_code=404, detail="Hizmet bulunamadı")
    
    return ServicePublicResponse(
        id=service.id,
        title=service.title,
        slug=service.slug,
        short_description=service.short_description,
        long_description=service.long_description,
        cover_image_url=service.cover_image_url,
        cover_image_alt=service.cover_image_alt,
        icon=service.icon,
        price_mode=service.price_mode,
        price_value=service.price_value,
        tags=service.tags,
        category=service.category,
        seo=service.seo
    )

# --- Public Slider ---

@router.get("/slider", response_model=SliderPublicResponse)
async def get_public_slider():
    """Get active slides and settings for public display"""
    slides, _ = await SliderService.list_slides(include_inactive=False)
    settings = await SliderService.get_settings()
    
    return SliderPublicResponse(
        slides=[
            SlidePublicResponse(
                id=s.id,
                title=s.title,
                subtitle=s.subtitle,
                image_url=s.image_url,
                image_alt=s.image_alt,
                mobile_image_url=s.mobile_image_url,
                buttons=[
                    SlideButtonResponse(
                        id=b.id,
                        text=b.text,
                        href=b.href,
                        style=b.style.value,
                        icon=b.icon,
                        is_visible=b.is_visible
                    ) for b in s.buttons if b.is_visible
                ],
                overlay=SlideOverlayResponse(
                    enabled=s.overlay.enabled,
                    opacity=s.overlay.opacity,
                    gradient_direction=s.overlay.gradient_direction,
                    color=s.overlay.color
                ),
                animation_duration=s.animation_duration
            ) for s in slides
        ],
        settings=SliderSettingsResponse(
            id=settings.id,
            auto_play=settings.auto_play,
            auto_play_interval=settings.auto_play_interval,
            show_navigation_arrows=settings.show_navigation_arrows,
            show_navigation_dots=settings.show_navigation_dots,
            show_progress_bar=settings.show_progress_bar,
            show_slide_counter=settings.show_slide_counter,
            show_scroll_indicator=settings.show_scroll_indicator,
            badge=settings.badge.model_dump(),
            stats=settings.stats.model_dump(),
            ken_burns_effect=settings.ken_burns_effect,
            scan_line_effect=settings.scan_line_effect,
            updated_at=settings.updated_at.isoformat() if settings.updated_at else None,
        )
    )

# --- Public Team ---

@router.get("/team-members", response_model=TeamMemberPublicListResponse)
async def get_public_team_members():
    """Get all published team members (public, no auth)"""
    members = await TeamService.get_published()
    
    return TeamMemberPublicListResponse(
        team_members=[
            TeamMemberPublicResponse(
                id=m.id,
                full_name=m.full_name,
                slug=m.slug,
                role_title=m.role_title,
                department=getattr(m, 'department', None),
                specialties=m.specialties,
                bio=m.bio,
                short_bio=getattr(m, 'short_bio', None),
                photo_url=m.photo_url,
                photo_alt=m.photo_alt,
                photo_thumbnail=getattr(m, 'photo_thumbnail', None),
                email=getattr(m, 'email', None) if getattr(m, 'show_contact_info', True) else None,
                phone=getattr(m, 'phone', None) if getattr(m, 'show_contact_info', True) else None,
                social_links=m.social_links,
                experience=m.experience,
                experience_years=getattr(m, 'experience_years', None),
                quote=m.quote,
                education=getattr(m, 'education', []) or [],
                certifications=getattr(m, 'certifications', []) or [],
                working_schedule=getattr(m, 'working_schedule', None),
                accepts_appointments=getattr(m, 'accepts_appointments', True),
                is_owner=m.is_owner,
                is_featured=getattr(m, 'is_featured', False),
                show_contact_info=getattr(m, 'show_contact_info', True)
            ) for m in members
        ],
        total=len(members)
    )

@router.get("/team-members/{slug}", response_model=TeamMemberPublicResponse)
async def get_public_team_member_by_slug(slug: str):
    """Get published team member by slug (public, no auth)"""
    member = await TeamService.get_published_by_slug(slug)
    
    if not member:
        raise HTTPException(status_code=404, detail="Ekip üyesi bulunamadı")
    
    return TeamMemberPublicResponse(
        id=member.id,
        full_name=member.full_name,
        slug=member.slug,
        role_title=member.role_title,
        department=getattr(member, 'department', None),
        specialties=member.specialties,
        bio=member.bio,
        short_bio=getattr(member, 'short_bio', None),
        photo_url=member.photo_url,
        photo_alt=member.photo_alt,
        photo_thumbnail=getattr(member, 'photo_thumbnail', None),
        email=getattr(member, 'email', None) if getattr(member, 'show_contact_info', True) else None,
        phone=getattr(member, 'phone', None) if getattr(member, 'show_contact_info', True) else None,
        social_links=member.social_links,
        experience=member.experience,
        experience_years=getattr(member, 'experience_years', None),
        quote=member.quote,
        education=getattr(member, 'education', []) or [],
        certifications=getattr(member, 'certifications', []) or [],
        working_schedule=getattr(member, 'working_schedule', None),
        accepts_appointments=getattr(member, 'accepts_appointments', True),
        is_owner=member.is_owner,
        is_featured=getattr(member, 'is_featured', False),
        show_contact_info=getattr(member, 'show_contact_info', True)
    )

# --- Public Appointment Request ---

@router.post("/appointment-request")
async def create_public_appointment_request(data: AppointmentRequestCreate):
    """Submit appointment request from website (public, no auth)"""
    try:
        appointment = await AppointmentService.create(data.model_dump())
        
        logger.info(f"New appointment request from website: {appointment.id} - {appointment.name}")
        
        return {
            "success": True,
            "message": "Randevu talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.",
            "request_id": appointment.id
        }
    except Exception as e:
        logger.error(f"Error creating appointment request: {e}")
        raise HTTPException(status_code=500, detail="Randevu talebi oluşturulurken bir hata oluştu")

# --- Public Blog (Sağlık Rehberi) ---

def _calculate_reading_time(content: str) -> int:
    """Calculate reading time in minutes based on word count"""
    if not content:
        return 1
    # Average reading speed: 200 words per minute
    word_count = len(content.split())
    return max(1, round(word_count / 200))

def _format_ai_metadata(ai_metadata: dict) -> AIMetadataResponse:
    """Format AI metadata for public response"""
    if not ai_metadata:
        return None
    
    faq = None
    if ai_metadata.get("faq"):
        faq = [FAQItemResponse(question=f["question"], answer=f["answer"]) for f in ai_metadata["faq"]]
    
    cta_block = None
    if ai_metadata.get("cta_block"):
        cta_block = CTABlockResponse(**ai_metadata["cta_block"])
    
    return AIMetadataResponse(
        faq=faq,
        schema_jsonld=ai_metadata.get("schema_jsonld"),
        cta_block=cta_block,
        disclaimer=ai_metadata.get("disclaimer"),
        outline=ai_metadata.get("outline")
    )

@router.get("/blog")
async def get_public_blog_posts():
    """Get all published blog posts (public, no auth) - optimized for list view"""
    posts, total = await BlogService.get_published()
    
    return BlogPostPublicListResponse(
        posts=[
            BlogPostListItemResponse(
                id=p.id,
                title=p.title,
                slug=p.slug,
                excerpt=p.excerpt,
                cover_image_url=p.cover_image_url,
                cover_image_alt=p.cover_image_alt,
                category=p.category,
                tags=p.tags,
                published_at=p.published_at.isoformat() if p.published_at else None,
                reading_time=_calculate_reading_time(p.content)
            ) for p in posts
        ],
        total=total
    )

@router.get("/blog/{slug}")
async def get_public_blog_post(slug: str):
    """Get single published blog post by slug (public, no auth)"""
    post = await BlogService.get_published_by_slug(slug)
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog yazısı bulunamadı")
    
    return BlogPostPublicResponse(
        id=post.id,
        title=post.title,
        slug=post.slug,
        excerpt=post.excerpt,
        cover_image_url=post.cover_image_url,
        cover_image_alt=post.cover_image_alt,
        content=post.content,
        category=post.category,
        tags=post.tags,
        seo=BlogSEOResponse(
            meta_title=post.seo.meta_title if post.seo else None,
            meta_description=post.seo.meta_description if post.seo else None,
            og_image=post.seo.og_image if post.seo else None
        ) if post.seo else None,
        published_at=post.published_at.isoformat() if post.published_at else None,
        ai_generated=getattr(post, 'ai_generated', False),
        ai_metadata=_format_ai_metadata(getattr(post, 'ai_metadata', None)),
        reading_time=_calculate_reading_time(post.content),
        view_count=getattr(post, 'view_count', 0)
    )

@router.post("/blog/{slug}/view")
async def track_blog_view(slug: str, request: Request):
    """Track a view for a blog post"""
    try:
        # Get client IP for basic deduplication
        client_ip = request.client.host if request.client else "unknown"
        
        # Update view count
        view_count = await BlogService.increment_view_count(slug, client_ip)
        
        return {"view_count": view_count}
    except Exception as e:
        logger.error(f"View tracking error: {e}")
        return {"view_count": 0}

# --- Public Gallery ---

@router.get("/gallery")
async def get_public_gallery():
    """Get all active gallery albums with items (public, no auth)"""
    albums = await GalleryService.get_active_albums_with_items()
    
    return GalleryPublicListResponse(
        albums=[
            GalleryAlbumPublicResponse(
                id=a["id"],
                title=a["title"],
                slug=a["slug"],
                description=a.get("description"),
                cover_image_url=a.get("cover_image_url"),
                items=[GalleryItemResponse(**i) for i in a.get("items", [])]
            ) for a in albums
        ],
        total=len(albums)
    )


import random

@router.get("/gallery/random")
async def get_random_gallery_items(
    limit: int = Query(8, ge=1, le=24),
    album_slug: Optional[str] = Query(None, description="Filter by album slug")
):
    """
    Get random gallery items from all albums for homepage display.
    - Returns shuffled items from active albums
    - Cache-Control: max-age=60 for balance between freshness and performance
    """
    albums = await GalleryService.get_active_albums_with_items()
    
    # Collect all items with their album info
    all_items = []
    for album in albums:
        # Filter by album slug if specified
        if album_slug and album["slug"] != album_slug:
            continue
            
        for item in album.get("items", []):
            all_items.append({
                "id": item["id"],
                "image_url": item["image_url"],
                "image_alt": item.get("image_alt"),
                "caption": item.get("caption"),
                "category": album["title"],  # Use album title as category
                "album_id": album["id"],
                "album_slug": album["slug"]
            })
    
    # Shuffle and limit
    random.shuffle(all_items)
    selected_items = all_items[:limit]
    
    # Return with cache headers
    response = JSONResponse(content={
        "items": selected_items,
        "total": len(selected_items),
        "available": len(all_items)
    })
    
    # Cache for 60 seconds, allow stale for 5 minutes while revalidating
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=300"
    
    return response

# --- Public Testimonials ---

@router.get("/testimonials")
async def get_public_testimonials(limit: int = Query(10, ge=1, le=20)):
    """Get approved + consent_public testimonials (public, no auth)"""
    testimonials = await TestimonialService.get_public_testimonials(limit=limit)
    
    return TestimonialPublicListResponse(
        testimonials=[
            TestimonialPublicResponse(
                id=t["id"],
                full_name=t["full_name"],
                pet_name=t["pet_name"],
                pet_type=t.get("pet_type"),
                pet_photo_url=t.get("pet_photo_url"),
                owner_photo_url=t.get("owner_photo_url"),
                service_name=t.get("service_name"),
                treatment=t.get("treatment"),
                rating=t["rating"],
                comment=t["comment"],
                submitted_at=t.get("submitted_at")
            ) for t in testimonials
        ],
        total=len(testimonials)
    )


# --- Public Feedback Form ---

# Upload config for public form
MAX_FILE_SIZE = 3 * 1024 * 1024  # 3MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_IMAGE_DIMENSION = 2048
UPLOAD_DIR = "/app/backend/uploads/testimonials"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _check_rate_limit(ip: str, max_requests: int = 5, window_seconds: int = 3600) -> bool:
    """Simple rate limiting - max 5 submissions per hour per IP"""
    now = datetime.now(timezone.utc)
    key = f"feedback:{ip}"
    
    if key not in _rate_limit_store:
        _rate_limit_store[key] = []
    
    # Clean old entries
    _rate_limit_store[key] = [
        ts for ts in _rate_limit_store[key] 
        if (now - ts).total_seconds() < window_seconds
    ]
    
    if len(_rate_limit_store[key]) >= max_requests:
        return False
    
    _rate_limit_store[key].append(now)
    return True


@router.post("/feedback", response_model=FeedbackSubmitResponse)
async def submit_feedback(
    request: Request,
    feedback_data: PublicFeedbackSubmit
):
    """
    Submit feedback from public form.
    Rate limited: max 5 submissions per hour per IP.
    """
    # Use centralized rate limiting
    from middleware.rate_limit import rate_limit_public_form
    await rate_limit_public_form(request)
    
    ip_address = request.client.host if request.client else "unknown"
    
    # Honeypot check - if filled, it's a bot
    if feedback_data.honeypot:
        logger.warning(f"Honeypot triggered from IP: {ip_address}")
        # Return success to not alert the bot
        return FeedbackSubmitResponse(
            success=True,
            message="Geri bildiriminiz için teşekkürler!"
        )
    
    # Validate consent_internal is true
    if not feedback_data.consent_internal:
        raise HTTPException(status_code=400, detail="Geri bildirim izni gereklidir")
    
    try:
        testimonial = await TestimonialService.submit_public_feedback(
            full_name=feedback_data.full_name,
            email=feedback_data.email,
            phone=feedback_data.phone,
            pet_name=feedback_data.pet_name,
            pet_photo_url=feedback_data.pet_photo_url,
            service_id=feedback_data.service_id,
            rating=feedback_data.rating,
            feedback_type=feedback_data.feedback_type,
            comment=feedback_data.comment,
            consent_internal=feedback_data.consent_internal,
            consent_public=feedback_data.consent_public
        )
        
        logger.info(f"New feedback submitted: {testimonial.id} from IP: {ip_address}")
        
        # Try to mark corresponding appointment as feedback received
        if feedback_data.phone:
            await AppointmentService.check_feedback_received_by_phone(feedback_data.phone)
        
        return FeedbackSubmitResponse(
            success=True,
            message="Geri bildiriminiz için teşekkürler! Değerlendirmeniz bizim için çok değerli.",
            id=testimonial.id
        )
        
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Geri bildirim gönderilirken bir hata oluştu. Lütfen tekrar deneyin."
        )


@router.post("/feedback/upload-image")
async def upload_feedback_image(
    request: Request,
    file: UploadFile = File(...)
):
    """
    Upload pet image for feedback form.
    Rate limited with feedback submissions.
    Max 3MB, JPG/PNG/WebP only.
    """
    ip_address = request.client.host if request.client else "unknown"
    
    # Check file extension
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail="Sadece JPG, PNG ve WebP dosyaları kabul edilir"
        )
    
    # Read file and check size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail="Dosya boyutu 3MB'dan büyük olamaz"
        )
    
    if not PIL_AVAILABLE:
        raise HTTPException(
            status_code=500, 
            detail="Görsel işleme servisi kullanılamıyor"
        )
    
    try:
        # Process image with PIL
        img = Image.open(io.BytesIO(content))
        
        # Strip EXIF data by creating a new image
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        # Resize if needed
        if max(img.size) > MAX_IMAGE_DIMENSION:
            img.thumbnail((MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION), Image.Resampling.LANCZOS)
        
        # Generate unique filename
        filename = f"{uuid.uuid4()}.jpg"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        # Save compressed
        img.save(filepath, "JPEG", quality=85, optimize=True)
        
        # Return URL path
        image_url = f"/uploads/testimonials/{filename}"
        
        logger.info(f"Image uploaded: {filename} from IP: {ip_address}")
        
        return {"url": image_url, "filename": filename}
        
    except Exception as e:
        logger.error(f"Image processing error: {e}")
        raise HTTPException(status_code=400, detail="Görsel işlenemedi")


@router.get("/services-list")
async def get_services_list_for_feedback():
    """Get simple list of services for feedback form dropdown"""
    services = await ServiceService.get_published()
    
    return {
        "services": [
            {"id": s.id, "title": s.title}
            for s in services
        ]
    }


# --- Public Clinic Rhythm ---

from services.clinic_rhythm_service import ClinicRhythmService
from services.pool_service import PoolService
from schemas.clinic_rhythm import ClinicRhythmPublicResponse, FeaturedQuestionResponse, FalseAlarmResponse

async def _get_pool_content_for_date(date_str: str) -> dict:
    """Get pool content from database for a given date (deterministic selection)"""
    import hashlib
    
    # Get active pool items from database
    questions = await PoolService.get_active_questions()
    alarms = await PoolService.get_active_alarms()
    
    # If pool is empty, return defaults
    if not questions or not alarms:
        return {
            "featured_question": {
                "question_text": "Evcil hayvanınızı seviyorsanız onu düzenli veteriner kontrolüne götürün!",
                "short_answer": "Düzenli kontroller olası sağlık sorunlarını erken tespit etmemize yardımcı olur.",
                "related_blog_slug": None,
                "related_blog_title": None
            },
            "false_alarm": {
                "message_title": "Panik Yapmayın",
                "message_body": "Evcil hayvanınızdaki küçük değişiklikler her zaman ciddi bir sorun anlamına gelmez.",
                "supportive_line": "Şüphede kalırsanız veterinerinize danışın."
            }
        }
    
    # Tarih string'inden hash oluştur (deterministic selection)
    date_hash = int(hashlib.md5(date_str.encode()).hexdigest(), 16)
    
    question_index = date_hash % len(questions)
    alarm_index = (date_hash // len(questions)) % len(alarms)
    
    return {
        "featured_question": questions[question_index],
        "false_alarm": alarms[alarm_index]
    }

@router.get("/clinic-rhythm/today", response_model=ClinicRhythmPublicResponse)
async def get_clinic_rhythm_today():
    """
    Get today's clinic rhythm entry.
    1. First checks for manually published content for today
    2. Falls back to content pool (from database) with deterministic daily rotation
    """
    from datetime import date
    
    today_str = date.today().isoformat()
    
    # Get pool content for fallback
    pool_content = await _get_pool_content_for_date(today_str)
    
    # Try to get manually published content first
    entry = await ClinicRhythmService.get_today_published()
    
    if entry:
        featured_q = None
        false_a = None
        
        # Use manual featured question if complete, else use pool
        if entry.featured_question and entry.featured_question.question_text and entry.featured_question.short_answer:
            featured_q = FeaturedQuestionResponse(**entry.featured_question.model_dump())
        else:
            featured_q = FeaturedQuestionResponse(**pool_content["featured_question"])
        
        # Use manual false alarm only if it has all required fields
        if entry.false_alarm and entry.false_alarm.message_title and entry.false_alarm.message_body and entry.false_alarm.supportive_line:
            false_a = FalseAlarmResponse(**entry.false_alarm.model_dump())
        else:
            # Use pool content for false alarm (more consistent)
            false_a = FalseAlarmResponse(**pool_content["false_alarm"])
        
        return ClinicRhythmPublicResponse(
            date_key=entry.date_key,
            featured_question=featured_q,
            false_alarm=false_a
        )
    
    # No manual content - use pool fallback
    return ClinicRhythmPublicResponse(
        date_key=today_str,
        featured_question=FeaturedQuestionResponse(**pool_content["featured_question"]),
        false_alarm=FalseAlarmResponse(**pool_content["false_alarm"])
    )


@router.get("/clinic-rhythm/latest", response_model=ClinicRhythmPublicResponse)
async def get_clinic_rhythm_latest():
    """Get the latest published clinic rhythm entry."""
    entry = await ClinicRhythmService.get_latest_published()
    
    if not entry:
        return ClinicRhythmPublicResponse(
            date_key="",
            featured_question=None,
            false_alarm=None
        )
    
    return ClinicRhythmPublicResponse(
        date_key=entry.date_key,
        featured_question=FeaturedQuestionResponse(**entry.featured_question.model_dump()) if entry.featured_question else None,
        false_alarm=FalseAlarmResponse(**entry.false_alarm.model_dump()) if entry.false_alarm else None
    )