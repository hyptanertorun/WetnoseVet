from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import re

class WorkingHours(BaseModel):
    day: str  # monday, tuesday, etc.
    open_time: str  # "09:00"
    close_time: str  # "18:00"
    is_closed: bool = False

class ClinicSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Contact Info
    clinic_name: str = "WETNOSE Veteriner Kliniği"
    phone: str = "0553 484 54 24"
    whatsapp: str = "905534845424"
    emergency_phone: str = "0553 484 54 24"  # Acil Hat Numarası
    email: str = "info@wetnose.com.tr"
    
    # Address
    address: str = "Kadıköy Mah. Atatürk Bulvarı Atatürk Ortaokulu Karşısı İZMİT/KOCAELİ"
    city: str = "Kocaeli"
    district: str = "İzmit"
    maps_embed_url: Optional[str] = None
    
    # Social Media
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    twitter_url: Optional[str] = None
    youtube_url: Optional[str] = None  # NEW
    pinterest_url: Optional[str] = None  # NEW
    tiktok_url: Optional[str] = None  # NEW
    
    # Working Hours
    working_hours: List[WorkingHours] = Field(default_factory=lambda: [
        WorkingHours(day="monday", open_time="09:00", close_time="18:00"),
        WorkingHours(day="tuesday", open_time="09:00", close_time="18:00"),
        WorkingHours(day="wednesday", open_time="09:00", close_time="18:00"),
        WorkingHours(day="thursday", open_time="09:00", close_time="18:00"),
        WorkingHours(day="friday", open_time="09:00", close_time="18:00"),
        WorkingHours(day="saturday", open_time="09:00", close_time="14:00"),
        WorkingHours(day="sunday", open_time="00:00", close_time="00:00", is_closed=True),
    ])
    is_24_7_emergency: bool = True
    
    # Legal
    kvkk_text: Optional[str] = "Kişisel verileriniz 6698 sayılı KVKK kapsamında işlenmektedir."
    
    # Maintenance Mode
    maintenance_mode: bool = False
    maintenance_message: Optional[str] = "Sitemiz şu anda güncelleniyor. Çok yakında daha iyi bir deneyimle karşınızda olacağız!"
    maintenance_end_date: Optional[datetime] = None
    
    # Metadata
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_by: Optional[str] = None  # User ID
    
    @field_validator('facebook_url', 'instagram_url', 'twitter_url', 'youtube_url', 'pinterest_url', 'tiktok_url', mode='before')
    @classmethod
    def validate_and_normalize_url(cls, v):
        """Validate URL format and normalize (trim spaces)"""
        if v is None or v == '':
            return None
        
        # Trim spaces
        v = v.strip()
        
        if not v:
            return None
        
        # Basic URL validation
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain
            r'localhost|'  # localhost
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        if not url_pattern.match(v):
            # If no protocol, try adding https://
            if not v.startswith('http'):
                v = 'https://' + v
                if not url_pattern.match(v):
                    raise ValueError(f'Geçersiz URL formatı: {v}')
        
        return v
