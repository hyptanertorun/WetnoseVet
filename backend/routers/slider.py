"""Slider router for Hero Slider management"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional

from services.slider_service import SliderService
from middleware.auth import get_current_active_user
from middleware.rbac import check_role
from schemas.slider import (
    SlideCreate,
    SlideUpdate,
    SlideResponse,
    SlideListResponse,
    SlideReorderRequest,
    SliderSettingsUpdate,
    SliderSettingsResponse,
    SlideButtonResponse,
    SlideOverlayResponse,
    SlidePublicResponse,
    SliderPublicResponse,
)
from models.user import User

router = APIRouter(prefix="/admin/slider", tags=["Admin - Slider"])


def _format_slide_response(slide) -> SlideResponse:
    return SlideResponse(
        id=slide.id,
        title=slide.title,
        subtitle=slide.subtitle,
        image_url=slide.image_url,
        image_alt=slide.image_alt,
        mobile_image_url=slide.mobile_image_url,
        buttons=[
            SlideButtonResponse(
                id=b.id,
                text=b.text,
                href=b.href,
                style=b.style.value,
                icon=b.icon,
                is_visible=b.is_visible
            ) for b in slide.buttons
        ],
        overlay=SlideOverlayResponse(
            enabled=slide.overlay.enabled,
            opacity=slide.overlay.opacity,
            gradient_direction=slide.overlay.gradient_direction,
            color=slide.overlay.color
        ),
        is_active=slide.is_active,
        sort_order=slide.sort_order,
        animation_duration=slide.animation_duration,
        created_at=slide.created_at.isoformat() if slide.created_at else None,
        updated_at=slide.updated_at.isoformat() if slide.updated_at else None,
    )


# =====================
# SLIDE ENDPOINTS
# =====================

@router.get("/slides", response_model=SlideListResponse)
async def list_slides(
    include_inactive: bool = False,
    current_user: User = Depends(get_current_active_user)
):
    """List all slides"""
    slides, total = await SliderService.list_slides(include_inactive=include_inactive)
    return SlideListResponse(
        slides=[_format_slide_response(s) for s in slides],
        total=total
    )


@router.get("/slides/{slide_id}", response_model=SlideResponse)
async def get_slide(
    slide_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific slide"""
    slide = await SliderService.get_slide_by_id(slide_id)
    if not slide:
        raise HTTPException(status_code=404, detail="Slide bulunamadı")
    return _format_slide_response(slide)


@router.post("/slides", response_model=dict)
async def create_slide(
    data: SlideCreate,
    current_user: User = Depends(check_role(["admin", "manager"]))
):
    """Create a new slide"""
    slide = await SliderService.create_slide(
        title=data.title,
        image_url=data.image_url,
        created_by=current_user.id,
        created_by_email=current_user.email,
        subtitle=data.subtitle,
        image_alt=data.image_alt,
        mobile_image_url=data.mobile_image_url,
        buttons=[b.model_dump() for b in data.buttons] if data.buttons else [],
        overlay=data.overlay.model_dump() if data.overlay else None,
        is_active=data.is_active,
        animation_duration=data.animation_duration
    )
    return {"message": "Slide oluşturuldu", "id": slide.id}


@router.put("/slides/{slide_id}", response_model=SlideResponse)
async def update_slide(
    slide_id: str,
    data: SlideUpdate,
    current_user: User = Depends(check_role(["admin", "manager"]))
):
    """Update a slide"""
    update_kwargs = {}
    
    for field in ["title", "subtitle", "image_url", "image_alt", "mobile_image_url", 
                  "is_active", "sort_order", "animation_duration"]:
        value = getattr(data, field, None)
        if value is not None:
            update_kwargs[field] = value
    
    if data.buttons is not None:
        update_kwargs["buttons"] = [b.model_dump() for b in data.buttons]
    
    if data.overlay is not None:
        update_kwargs["overlay"] = data.overlay.model_dump()
    
    slide = await SliderService.update_slide(
        slide_id=slide_id,
        updated_by=current_user.id,
        updated_by_email=current_user.email,
        **update_kwargs
    )
    
    if not slide:
        raise HTTPException(status_code=404, detail="Slide bulunamadı")
    return _format_slide_response(slide)


@router.delete("/slides/{slide_id}")
async def delete_slide(
    slide_id: str,
    current_user: User = Depends(check_role(["admin", "manager"]))
):
    """Delete a slide"""
    success = await SliderService.delete_slide(
        slide_id=slide_id,
        deleted_by=current_user.id,
        deleted_by_email=current_user.email
    )
    if not success:
        raise HTTPException(status_code=404, detail="Slide bulunamadı")
    return {"message": "Slide silindi"}


@router.post("/slides/reorder")
async def reorder_slides(
    data: SlideReorderRequest,
    current_user: User = Depends(check_role(["admin", "manager"]))
):
    """Reorder slides"""
    await SliderService.reorder_slides(
        items=[item.model_dump() for item in data.items],
        updated_by=current_user.id,
        updated_by_email=current_user.email
    )
    return {"message": "Sıralama güncellendi"}


@router.post("/slides/seed")
async def seed_slides(
    current_user: User = Depends(check_role(["admin"]))
):
    """Seed default slides (admin only)"""
    result = await SliderService.seed_default_slides()
    return result


# =====================
# SETTINGS ENDPOINTS
# =====================

@router.get("/settings", response_model=SliderSettingsResponse)
async def get_settings(
    current_user: User = Depends(get_current_active_user)
):
    """Get slider settings"""
    settings = await SliderService.get_settings()
    return SliderSettingsResponse(
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


@router.put("/settings", response_model=SliderSettingsResponse)
async def update_settings(
    data: SliderSettingsUpdate,
    current_user: User = Depends(check_role(["admin", "manager"]))
):
    """Update slider settings"""
    update_kwargs = {}
    
    for field in ["auto_play", "auto_play_interval", "show_navigation_arrows",
                  "show_navigation_dots", "show_progress_bar", "show_slide_counter",
                  "show_scroll_indicator", "ken_burns_effect", "scan_line_effect"]:
        value = getattr(data, field, None)
        if value is not None:
            update_kwargs[field] = value
    
    if data.badge is not None:
        update_kwargs["badge"] = data.badge.model_dump()
    
    if data.stats is not None:
        update_kwargs["stats"] = data.stats.model_dump()
    
    settings = await SliderService.update_settings(
        updated_by=current_user.id,
        updated_by_email=current_user.email,
        **update_kwargs
    )
    
    return SliderSettingsResponse(
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
