from fastapi import APIRouter, HTTPException, status, Request, Depends
from typing import Optional

from schemas.settings import SettingsUpdate, SettingsResponse
from services.settings_service import SettingsService
from services.audit_service import AuditService
from middleware.auth import get_current_active_user
from middleware.rbac import require_admin_or_manager
from models.user import User
from models.audit import AuditAction
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/settings", tags=["Settings Management"])

@router.get("", response_model=SettingsResponse)
async def get_settings(current_user: User = Depends(require_admin_or_manager)):
    """Get clinic settings (Admin/Manager only)"""
    settings = await SettingsService.get_settings()
    return SettingsResponse(
        id=settings.id,
        clinic_name=settings.clinic_name,
        phone=settings.phone,
        whatsapp=settings.whatsapp,
        emergency_phone=settings.emergency_phone,
        email=settings.email,
        address=settings.address,
        city=settings.city,
        district=settings.district,
        maps_embed_url=settings.maps_embed_url,
        facebook_url=settings.facebook_url,
        instagram_url=settings.instagram_url,
        twitter_url=settings.twitter_url,
        youtube_url=settings.youtube_url,
        pinterest_url=settings.pinterest_url,
        tiktok_url=settings.tiktok_url,
        working_hours=settings.working_hours,
        is_24_7_emergency=settings.is_24_7_emergency,
        kvkk_text=settings.kvkk_text,
        maintenance_mode=settings.maintenance_mode,
        maintenance_message=settings.maintenance_message,
        maintenance_end_date=settings.maintenance_end_date,
        updated_at=settings.updated_at,
        updated_by=settings.updated_by
    )

@router.put("", response_model=SettingsResponse)
async def update_settings(
    request: Request,
    settings_data: SettingsUpdate,
    current_user: User = Depends(require_admin_or_manager)
):
    """Update clinic settings (Admin/Manager only)"""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    # Get before state
    before_settings = await SettingsService.get_settings()
    
    # Update settings
    updated_settings = await SettingsService.update_settings(
        updated_by=current_user.id,
        clinic_name=settings_data.clinic_name,
        phone=settings_data.phone,
        whatsapp=settings_data.whatsapp,
        emergency_phone=settings_data.emergency_phone,
        email=settings_data.email,
        address=settings_data.address,
        city=settings_data.city,
        district=settings_data.district,
        maps_embed_url=settings_data.maps_embed_url,
        facebook_url=settings_data.facebook_url,
        instagram_url=settings_data.instagram_url,
        twitter_url=settings_data.twitter_url,
        youtube_url=settings_data.youtube_url,
        pinterest_url=settings_data.pinterest_url,
        tiktok_url=settings_data.tiktok_url,
        working_hours=settings_data.working_hours,
        is_24_7_emergency=settings_data.is_24_7_emergency,
        kvkk_text=settings_data.kvkk_text,
        maintenance_mode=settings_data.maintenance_mode,
        maintenance_message=settings_data.maintenance_message,
        maintenance_end_date=settings_data.maintenance_end_date
    )
    
    # Get changes for audit
    changes = await SettingsService.get_settings_diff(before_settings, updated_settings)
    
    if changes:
        # Log settings update
        await AuditService.log(
            entity_type="settings",
            entity_id=updated_settings.id,
            action=AuditAction.UPDATE,
            actor_user_id=current_user.id,
            actor_email=current_user.email,
            actor_role=current_user.role.value,
            before_state={k: v["before"] for k, v in changes.items()},
            after_state={k: v["after"] for k, v in changes.items()},
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    return SettingsResponse(
        id=updated_settings.id,
        clinic_name=updated_settings.clinic_name,
        phone=updated_settings.phone,
        whatsapp=updated_settings.whatsapp,
        email=updated_settings.email,
        address=updated_settings.address,
        city=updated_settings.city,
        district=updated_settings.district,
        maps_embed_url=updated_settings.maps_embed_url,
        facebook_url=updated_settings.facebook_url,
        instagram_url=updated_settings.instagram_url,
        twitter_url=updated_settings.twitter_url,
        youtube_url=updated_settings.youtube_url,
        pinterest_url=updated_settings.pinterest_url,
        tiktok_url=updated_settings.tiktok_url,
        working_hours=updated_settings.working_hours,
        is_24_7_emergency=updated_settings.is_24_7_emergency,
        kvkk_text=updated_settings.kvkk_text,
        maintenance_mode=updated_settings.maintenance_mode,
        maintenance_message=updated_settings.maintenance_message,
        maintenance_end_date=updated_settings.maintenance_end_date,
        updated_at=updated_settings.updated_at,
        updated_by=updated_settings.updated_by
    )
