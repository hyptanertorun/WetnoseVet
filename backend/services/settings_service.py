from typing import Optional, Dict, Any
from datetime import datetime, timezone

from db.mongodb import get_database
from models.settings import ClinicSettings, WorkingHours
import logging

logger = logging.getLogger(__name__)

class SettingsService:
    SETTINGS_ID = "main_settings"  # Single settings document
    
    @staticmethod
    async def get_settings() -> ClinicSettings:
        """Get clinic settings"""
        db = get_database()
        settings_doc = await db.settings.find_one({"id": SettingsService.SETTINGS_ID}, {"_id": 0})
        
        if not settings_doc:
            # Create default settings
            default_settings = ClinicSettings(id=SettingsService.SETTINGS_ID)
            doc = default_settings.model_dump()
            doc['updated_at'] = doc['updated_at'].isoformat()
            doc['working_hours'] = [wh.model_dump() for wh in default_settings.working_hours]
            await db.settings.insert_one(doc)
            return default_settings
        
        # Parse datetime
        if settings_doc.get('updated_at') and isinstance(settings_doc['updated_at'], str):
            settings_doc['updated_at'] = datetime.fromisoformat(settings_doc['updated_at'])
        
        # Parse working hours
        if settings_doc.get('working_hours'):
            settings_doc['working_hours'] = [
                WorkingHours(**wh) for wh in settings_doc['working_hours']
            ]
        
        return ClinicSettings(**settings_doc)
    
    @staticmethod
    async def update_settings(
        updated_by: str,
        **kwargs
    ) -> ClinicSettings:
        """Update clinic settings"""
        db = get_database()
        
        # Build update
        update_data = {
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "updated_by": updated_by
        }
        
        for key, value in kwargs.items():
            if value is not None:
                if key == 'working_hours' and value:
                    update_data[key] = [wh.model_dump() if isinstance(wh, WorkingHours) else wh for wh in value]
                else:
                    update_data[key] = value
        
        await db.settings.update_one(
            {"id": SettingsService.SETTINGS_ID},
            {"$set": update_data},
            upsert=True
        )
        
        return await SettingsService.get_settings()
    
    @staticmethod
    async def get_settings_diff(before: ClinicSettings, after: ClinicSettings) -> Dict[str, Any]:
        """Get changed fields between two settings states"""
        changes = {}
        before_dict = before.model_dump()
        after_dict = after.model_dump()
        
        for key in after_dict:
            if key in ['updated_at', 'updated_by', 'id']:
                continue
            if before_dict.get(key) != after_dict.get(key):
                changes[key] = {
                    "before": before_dict.get(key),
                    "after": after_dict.get(key)
                }
        
        return changes
