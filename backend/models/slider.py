"""Slider models for Hero Slider management"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from uuid import uuid4
from enum import Enum


class SlideButtonStyle(str, Enum):
    PRIMARY = "primary"
    SECONDARY = "secondary"
    OUTLINE = "outline"
    GHOST = "ghost"


class SlideButton(BaseModel):
    """Button configuration for a slide"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    text: str
    href: str
    style: SlideButtonStyle = SlideButtonStyle.PRIMARY
    icon: Optional[str] = None  # lucide icon name
    is_visible: bool = True


class SlideOverlay(BaseModel):
    """Overlay configuration for a slide"""
    enabled: bool = True
    opacity: int = 50  # 0-100
    gradient_direction: str = "to-r"  # to-r, to-l, to-t, to-b, radial
    color: str = "black"  # black, teal, custom
    
    model_config = {"extra": "ignore"}


class SlideBadge(BaseModel):
    """Badge configuration for hero section"""
    enabled: bool = True
    text: str = "7/24 Acil Veteriner Hizmeti"
    icon: str = "sparkles"
    show_pulse: bool = True


class SlideStats(BaseModel):
    """Stats configuration"""
    enabled: bool = True
    items: List[dict] = Field(default_factory=lambda: [
        {"value": "15+", "label": "Yıllık Deneyim"},
        {"value": "10K+", "label": "Mutlu Dost"},
        {"value": "24/7", "label": "Acil Hizmet"}
    ])


class Slide(BaseModel):
    """Individual slide model"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    title: str
    subtitle: Optional[str] = None
    image_url: str
    image_alt: Optional[str] = None
    mobile_image_url: Optional[str] = None  # Different image for mobile
    buttons: List[SlideButton] = Field(default_factory=list)
    overlay: SlideOverlay = Field(default_factory=SlideOverlay)
    is_active: bool = True
    sort_order: int = 0
    animation_duration: int = 6000  # milliseconds
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "subtitle": self.subtitle,
            "image_url": self.image_url,
            "image_alt": self.image_alt,
            "mobile_image_url": self.mobile_image_url,
            "buttons": [b.model_dump() for b in self.buttons],
            "overlay": self.overlay.model_dump(),
            "is_active": self.is_active,
            "sort_order": self.sort_order,
            "animation_duration": self.animation_duration,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class SliderSettings(BaseModel):
    """Global slider settings"""
    id: str = "slider_settings"
    auto_play: bool = True
    auto_play_interval: int = 6000  # milliseconds
    show_navigation_arrows: bool = True
    show_navigation_dots: bool = True
    show_progress_bar: bool = True
    show_slide_counter: bool = True
    show_scroll_indicator: bool = True
    badge: SlideBadge = Field(default_factory=SlideBadge)
    stats: SlideStats = Field(default_factory=SlideStats)
    ken_burns_effect: bool = True
    scan_line_effect: bool = True
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "auto_play": self.auto_play,
            "auto_play_interval": self.auto_play_interval,
            "show_navigation_arrows": self.show_navigation_arrows,
            "show_navigation_dots": self.show_navigation_dots,
            "show_progress_bar": self.show_progress_bar,
            "show_slide_counter": self.show_slide_counter,
            "show_scroll_indicator": self.show_scroll_indicator,
            "badge": self.badge.model_dump(),
            "stats": self.stats.model_dump(),
            "ken_burns_effect": self.ken_burns_effect,
            "scan_line_effect": self.scan_line_effect,
            "updated_at": self.updated_at.isoformat(),
        }
