"""Slider service for managing hero slides"""
from typing import Optional, List, Tuple
from datetime import datetime, timezone
from uuid import uuid4
import logging

from db.mongodb import get_database
from models.slider import Slide, SliderSettings, SlideButton, SlideOverlay, SlideBadge, SlideStats
from services.audit_service import AuditService

logger = logging.getLogger(__name__)


class SliderService:
    SLIDES_COLLECTION = "hero_slides"
    SETTINGS_COLLECTION = "slider_settings"

    # =====================
    # SLIDE METHODS
    # =====================

    @staticmethod
    def _deserialize_slide(doc: dict) -> Slide:
        """Convert MongoDB document to Slide"""
        if not doc:
            return None
        
        buttons = []
        for b in doc.get("buttons", []):
            buttons.append(SlideButton(**b))
        
        overlay = SlideOverlay(**doc.get("overlay", {}))
        
        return Slide(
            id=doc.get("id"),
            title=doc.get("title"),
            subtitle=doc.get("subtitle"),
            image_url=doc.get("image_url"),
            image_alt=doc.get("image_alt"),
            mobile_image_url=doc.get("mobile_image_url"),
            buttons=buttons,
            overlay=overlay,
            is_active=doc.get("is_active", True),
            sort_order=doc.get("sort_order", 0),
            animation_duration=doc.get("animation_duration", 6000),
            created_at=datetime.fromisoformat(doc["created_at"]) if doc.get("created_at") else datetime.now(timezone.utc),
            updated_at=datetime.fromisoformat(doc["updated_at"]) if doc.get("updated_at") else datetime.now(timezone.utc),
        )

    @staticmethod
    async def list_slides(include_inactive: bool = False) -> Tuple[List[Slide], int]:
        """List all slides"""
        db = get_database()
        
        query = {} if include_inactive else {"is_active": True}
        total = await db[SliderService.SLIDES_COLLECTION].count_documents(query)
        cursor = db[SliderService.SLIDES_COLLECTION].find(
            query, {"_id": 0}
        ).sort("sort_order", 1)
        
        docs = await cursor.to_list(100)
        return [SliderService._deserialize_slide(doc) for doc in docs], total

    @staticmethod
    async def get_slide_by_id(slide_id: str) -> Optional[Slide]:
        """Get a slide by ID"""
        db = get_database()
        doc = await db[SliderService.SLIDES_COLLECTION].find_one(
            {"id": slide_id}, {"_id": 0}
        )
        return SliderService._deserialize_slide(doc) if doc else None

    @staticmethod
    async def create_slide(
        title: str,
        image_url: str,
        created_by: str,
        created_by_email: str,
        subtitle: Optional[str] = None,
        image_alt: Optional[str] = None,
        mobile_image_url: Optional[str] = None,
        buttons: List[dict] = None,
        overlay: dict = None,
        is_active: bool = True,
        animation_duration: int = 6000
    ) -> Slide:
        """Create a new slide"""
        db = get_database()
        
        # Get max sort_order
        max_order = await db[SliderService.SLIDES_COLLECTION].find_one(
            {}, {"sort_order": 1}, sort=[("sort_order", -1)]
        )
        next_order = (max_order.get("sort_order", 0) + 1) if max_order else 0
        
        # Create buttons
        slide_buttons = []
        for b in (buttons or []):
            # Filter None values
            clean_button = {k: v for k, v in b.items() if v is not None}
            slide_buttons.append(SlideButton(**clean_button))
        
        # Create overlay - filter None values and use defaults
        if overlay:
            clean_overlay = {k: v for k, v in overlay.items() if v is not None}
            slide_overlay = SlideOverlay(**clean_overlay)
        else:
            slide_overlay = SlideOverlay()
        
        slide = Slide(
            title=title,
            subtitle=subtitle,
            image_url=image_url,
            image_alt=image_alt,
            mobile_image_url=mobile_image_url,
            buttons=slide_buttons,
            overlay=slide_overlay,
            is_active=is_active,
            sort_order=next_order,
            animation_duration=animation_duration,
        )
        
        doc = slide.to_dict()
        doc["_id"] = slide.id
        await db[SliderService.SLIDES_COLLECTION].insert_one(doc)
        
        await AuditService.log(
            action="slider.slide.create",
            actor_user_id=created_by,
            actor_email=created_by_email,
            entity_type="slide",
            entity_id=slide.id,
            metadata={"title": title}
        )
        
        return slide

    @staticmethod
    async def update_slide(
        slide_id: str,
        updated_by: str,
        updated_by_email: str,
        **kwargs
    ) -> Optional[Slide]:
        """Update a slide"""
        db = get_database()
        
        slide = await SliderService.get_slide_by_id(slide_id)
        if not slide:
            return None
        
        update_data = {
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Handle simple fields
        simple_fields = ["title", "subtitle", "image_url", "image_alt", 
                        "mobile_image_url", "is_active", "sort_order", "animation_duration"]
        for field in simple_fields:
            if field in kwargs and kwargs[field] is not None:
                update_data[field] = kwargs[field]
        
        # Handle buttons
        if "buttons" in kwargs and kwargs["buttons"] is not None:
            update_data["buttons"] = [
                SlideButton(**b).model_dump() for b in kwargs["buttons"]
            ]
        
        # Handle overlay
        if "overlay" in kwargs and kwargs["overlay"] is not None:
            current_overlay = slide.overlay.model_dump()
            current_overlay.update({k: v for k, v in kwargs["overlay"].items() if v is not None})
            update_data["overlay"] = current_overlay
        
        await db[SliderService.SLIDES_COLLECTION].update_one(
            {"id": slide_id},
            {"$set": update_data}
        )
        
        await AuditService.log(
            action="slider.slide.update",
            actor_user_id=updated_by,
            actor_email=updated_by_email,
            entity_type="slide",
            entity_id=slide_id,
            metadata={"updated_fields": list(update_data.keys())}
        )
        
        return await SliderService.get_slide_by_id(slide_id)

    @staticmethod
    async def delete_slide(
        slide_id: str,
        deleted_by: str,
        deleted_by_email: str
    ) -> bool:
        """Delete a slide"""
        db = get_database()
        
        slide = await SliderService.get_slide_by_id(slide_id)
        if not slide:
            return False
        
        result = await db[SliderService.SLIDES_COLLECTION].delete_one({"id": slide_id})
        
        if result.deleted_count > 0:
            await AuditService.log(
                action="slider.slide.delete",
                actor_user_id=deleted_by,
                actor_email=deleted_by_email,
                entity_type="slide",
                entity_id=slide_id,
                metadata={"title": slide.title}
            )
            return True
        return False

    @staticmethod
    async def reorder_slides(items: List[dict], updated_by: str, updated_by_email: str):
        """Reorder slides"""
        db = get_database()
        
        for item in items:
            await db[SliderService.SLIDES_COLLECTION].update_one(
                {"id": item["id"]},
                {"$set": {"sort_order": item["sort_order"], "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
        
        await AuditService.log(
            action="slider.slides.reorder",
            actor_user_id=updated_by,
            actor_email=updated_by_email,
            entity_type="slides",
            entity_id="bulk",
            metadata={"count": len(items)}
        )

    # =====================
    # SETTINGS METHODS
    # =====================

    @staticmethod
    async def get_settings() -> SliderSettings:
        """Get slider settings"""
        db = get_database()
        doc = await db[SliderService.SETTINGS_COLLECTION].find_one(
            {"id": "slider_settings"}, {"_id": 0}
        )
        
        if not doc:
            # Create default settings
            settings = SliderSettings()
            doc = settings.to_dict()
            doc["_id"] = "slider_settings"
            await db[SliderService.SETTINGS_COLLECTION].insert_one(doc)
            return settings
        
        return SliderSettings(
            auto_play=doc.get("auto_play", True),
            auto_play_interval=doc.get("auto_play_interval", 6000),
            show_navigation_arrows=doc.get("show_navigation_arrows", True),
            show_navigation_dots=doc.get("show_navigation_dots", True),
            show_progress_bar=doc.get("show_progress_bar", True),
            show_slide_counter=doc.get("show_slide_counter", True),
            show_scroll_indicator=doc.get("show_scroll_indicator", True),
            badge=SlideBadge(**doc.get("badge", {})),
            stats=SlideStats(**doc.get("stats", {})),
            ken_burns_effect=doc.get("ken_burns_effect", True),
            scan_line_effect=doc.get("scan_line_effect", True),
            updated_at=datetime.fromisoformat(doc["updated_at"]) if doc.get("updated_at") else datetime.now(timezone.utc),
        )

    @staticmethod
    async def update_settings(
        updated_by: str,
        updated_by_email: str,
        **kwargs
    ) -> SliderSettings:
        """Update slider settings"""
        db = get_database()
        
        current = await SliderService.get_settings()
        
        update_data = {
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        simple_fields = ["auto_play", "auto_play_interval", "show_navigation_arrows",
                        "show_navigation_dots", "show_progress_bar", "show_slide_counter",
                        "show_scroll_indicator", "ken_burns_effect", "scan_line_effect"]
        
        for field in simple_fields:
            if field in kwargs and kwargs[field] is not None:
                update_data[field] = kwargs[field]
        
        # Handle badge
        if "badge" in kwargs and kwargs["badge"] is not None:
            current_badge = current.badge.model_dump()
            current_badge.update({k: v for k, v in kwargs["badge"].items() if v is not None})
            update_data["badge"] = current_badge
        
        # Handle stats
        if "stats" in kwargs and kwargs["stats"] is not None:
            current_stats = current.stats.model_dump()
            current_stats.update({k: v for k, v in kwargs["stats"].items() if v is not None})
            update_data["stats"] = current_stats
        
        await db[SliderService.SETTINGS_COLLECTION].update_one(
            {"id": "slider_settings"},
            {"$set": update_data},
            upsert=True
        )
        
        await AuditService.log(
            action="slider.settings.update",
            actor_user_id=updated_by,
            actor_email=updated_by_email,
            entity_type="slider_settings",
            entity_id="slider_settings",
            metadata={"updated_fields": list(update_data.keys())}
        )
        
        return await SliderService.get_settings()

    # =====================
    # SEED DATA
    # =====================

    @staticmethod
    async def seed_default_slides():
        """Seed default slides from static data"""
        db = get_database()
        
        existing = await db[SliderService.SLIDES_COLLECTION].count_documents({})
        if existing > 0:
            logger.info(f"Slides already exist: {existing}")
            return {"seeded": False, "existing": existing}
        
        default_slides = [
            {
                "title": "Dostlarınıza Özel Bakım",
                "subtitle": "Modern teknoloji ile sağlık takibi",
                "image_url": "/images/slider/slider1.png",
                "buttons": [
                    {"text": "Online Randevu Al", "href": "/randevu", "style": "primary", "icon": "calendar"},
                    {"text": "Keşfet", "href": "#services", "style": "secondary", "icon": "play"}
                ],
                "overlay": {"enabled": True, "opacity": 50}
            },
            {
                "title": "Uzman Veteriner Ekibi",
                "subtitle": "7/24 Acil Veteriner Hizmeti",
                "image_url": "/images/slider/slider2.png",
                "buttons": [
                    {"text": "Online Randevu Al", "href": "/randevu", "style": "primary", "icon": "calendar"},
                    {"text": "Ekibimiz", "href": "/ekibimiz", "style": "secondary", "icon": "users"}
                ],
                "overlay": {"enabled": True, "opacity": 50}
            },
            {
                "title": "Minik Dostlarınız Güvende",
                "subtitle": "Profesyonel sağlık hizmetleri",
                "image_url": "/images/slider/slider1.png",
                "buttons": [
                    {"text": "Hizmetlerimiz", "href": "/hizmetler", "style": "primary", "icon": "stethoscope"},
                    {"text": "İletişim", "href": "/iletisim", "style": "secondary", "icon": "phone"}
                ],
                "overlay": {"enabled": True, "opacity": 50}
            }
        ]
        
        for i, data in enumerate(default_slides):
            buttons = [SlideButton(**b) for b in data["buttons"]]
            overlay = SlideOverlay(**data["overlay"])
            
            slide = Slide(
                title=data["title"],
                subtitle=data["subtitle"],
                image_url=data["image_url"],
                buttons=buttons,
                overlay=overlay,
                sort_order=i,
                is_active=True
            )
            
            doc = slide.to_dict()
            doc["_id"] = slide.id
            await db[SliderService.SLIDES_COLLECTION].insert_one(doc)
        
        logger.info(f"Seeded {len(default_slides)} default slides")
        return {"seeded": True, "count": len(default_slides)}
