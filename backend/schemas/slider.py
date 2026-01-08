"""Slider schemas"""
from pydantic import BaseModel, Field
from typing import Optional, List
from models.slider import SlideButtonStyle


# Button schemas
class SlideButtonCreate(BaseModel):
    text: str
    href: str
    style: SlideButtonStyle = SlideButtonStyle.PRIMARY
    icon: Optional[str] = None
    is_visible: bool = True


class SlideButtonUpdate(BaseModel):
    text: Optional[str] = None
    href: Optional[str] = None
    style: Optional[SlideButtonStyle] = None
    icon: Optional[str] = None
    is_visible: Optional[bool] = None


class SlideButtonResponse(BaseModel):
    id: str
    text: str
    href: str
    style: str
    icon: Optional[str]
    is_visible: bool


# Overlay schemas
class SlideOverlayUpdate(BaseModel):
    enabled: Optional[bool] = None
    opacity: Optional[int] = Field(None, ge=0, le=100)
    gradient_direction: Optional[str] = None
    color: Optional[str] = None


class SlideOverlayResponse(BaseModel):
    enabled: bool
    opacity: int
    gradient_direction: str
    color: str


# Slide schemas
class SlideCreate(BaseModel):
    title: str = Field(..., min_length=1)
    subtitle: Optional[str] = None
    image_url: str = Field(..., min_length=1)
    image_alt: Optional[str] = None
    mobile_image_url: Optional[str] = None
    buttons: List[SlideButtonCreate] = []
    overlay: Optional[SlideOverlayUpdate] = None
    is_active: bool = True
    sort_order: int = 0
    animation_duration: int = 6000


class SlideUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    image_alt: Optional[str] = None
    mobile_image_url: Optional[str] = None
    buttons: Optional[List[SlideButtonCreate]] = None
    overlay: Optional[SlideOverlayUpdate] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    animation_duration: Optional[int] = None


class SlideResponse(BaseModel):
    id: str
    title: str
    subtitle: Optional[str]
    image_url: str
    image_alt: Optional[str]
    mobile_image_url: Optional[str]
    buttons: List[SlideButtonResponse]
    overlay: SlideOverlayResponse
    is_active: bool
    sort_order: int
    animation_duration: int
    created_at: str
    updated_at: str


class SlideListResponse(BaseModel):
    slides: List[SlideResponse]
    total: int


# Reorder schema
class SlideReorderItem(BaseModel):
    id: str
    sort_order: int


class SlideReorderRequest(BaseModel):
    items: List[SlideReorderItem]


# Settings schemas
class BadgeSettingsUpdate(BaseModel):
    enabled: Optional[bool] = None
    text: Optional[str] = None
    icon: Optional[str] = None
    show_pulse: Optional[bool] = None


class StatsItemUpdate(BaseModel):
    value: str
    label: str


class StatsSettingsUpdate(BaseModel):
    enabled: Optional[bool] = None
    items: Optional[List[StatsItemUpdate]] = None


class SliderSettingsUpdate(BaseModel):
    auto_play: Optional[bool] = None
    auto_play_interval: Optional[int] = None
    show_navigation_arrows: Optional[bool] = None
    show_navigation_dots: Optional[bool] = None
    show_progress_bar: Optional[bool] = None
    show_slide_counter: Optional[bool] = None
    show_scroll_indicator: Optional[bool] = None
    badge: Optional[BadgeSettingsUpdate] = None
    stats: Optional[StatsSettingsUpdate] = None
    ken_burns_effect: Optional[bool] = None
    scan_line_effect: Optional[bool] = None


class SliderSettingsResponse(BaseModel):
    id: str
    auto_play: bool
    auto_play_interval: int
    show_navigation_arrows: bool
    show_navigation_dots: bool
    show_progress_bar: bool
    show_slide_counter: bool
    show_scroll_indicator: bool
    badge: dict
    stats: dict
    ken_burns_effect: bool
    scan_line_effect: bool
    updated_at: str


# Public response for frontend
class SlidePublicResponse(BaseModel):
    id: str
    title: str
    subtitle: Optional[str]
    image_url: str
    image_alt: Optional[str]
    mobile_image_url: Optional[str]
    buttons: List[SlideButtonResponse]
    overlay: SlideOverlayResponse
    animation_duration: int


class SliderPublicResponse(BaseModel):
    slides: List[SlidePublicResponse]
    settings: SliderSettingsResponse
