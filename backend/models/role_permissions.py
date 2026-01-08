"""Role permissions model and service"""
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime, timezone
import uuid

# Tüm mevcut yetkiler
ALL_PERMISSIONS = {
    "dashboard": {
        "label": "Dashboard",
        "description": "Ana kontrol paneli"
    },
    "crm": {
        "label": "Randevu Talepleri (CRM)",
        "description": "Randevu taleplerini görüntüleme ve yönetme"
    },
    "contact": {
        "label": "İletişim Mesajları",
        "description": "İletişim formundan gelen mesajları yönetme"
    },
    "slider": {
        "label": "Slider Yönetimi",
        "description": "Ana sayfa slider'ını düzenleme"
    },
    "clinic_rhythm": {
        "label": "Klinik Ritmi",
        "description": "Klinik çalışma saatlerini yönetme"
    },
    "services": {
        "label": "Hizmetler",
        "description": "Klinik hizmetlerini yönetme"
    },
    "team": {
        "label": "Ekip",
        "description": "Ekip üyelerini yönetme"
    },
    "blog": {
        "label": "Blog",
        "description": "Blog yazılarını yönetme"
    },
    "ai_blog": {
        "label": "AI Blog Writer",
        "description": "AI ile blog yazısı oluşturma"
    },
    "gallery": {
        "label": "Galeri",
        "description": "Galeri ve fotoğrafları yönetme"
    },
    "testimonials": {
        "label": "Yorumlar",
        "description": "Müşteri yorumlarını yönetme"
    },
    "users": {
        "label": "Kullanıcılar",
        "description": "Kullanıcı hesaplarını yönetme"
    },
    "settings": {
        "label": "Ayarlar",
        "description": "Site ayarlarını değiştirme"
    },
    "maintenance": {
        "label": "Bakım Modu",
        "description": "Site bakım modunu yönetme"
    },
    "audit_logs": {
        "label": "Audit Logları",
        "description": "Sistem loglarını görüntüleme"
    }
}

# Varsayılan rol yetkileri
DEFAULT_ROLE_PERMISSIONS = {
    "admin": list(ALL_PERMISSIONS.keys()),  # Tüm yetkiler
    "manager": [
        "dashboard", "crm", "contact", "slider", "clinic_rhythm",
        "services", "team", "blog", "ai_blog", "gallery", "testimonials",
        "settings"
    ],
    "reception": [
        "dashboard", "crm", "contact"
    ],
    "editor": [
        "dashboard", "services", "team", "blog", "ai_blog", "gallery", "testimonials"
    ]
}


class RolePermissions(BaseModel):
    """Role permissions model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str  # admin, manager, reception, editor
    permissions: List[str] = Field(default_factory=list)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_by: Optional[str] = None


class RolePermissionsService:
    @staticmethod
    async def get_all_permissions() -> Dict:
        """Get all available permissions with labels"""
        return ALL_PERMISSIONS
    
    @staticmethod
    async def get_role_permissions(role: str) -> List[str]:
        """Get permissions for a specific role"""
        from db.mongodb import get_database
        db = get_database()
        
        doc = await db.role_permissions.find_one({"role": role}, {"_id": 0})
        
        if doc:
            return doc.get("permissions", [])
        
        # Return default if not customized
        return DEFAULT_ROLE_PERMISSIONS.get(role, [])
    
    @staticmethod
    async def get_all_role_permissions() -> Dict[str, List[str]]:
        """Get permissions for all roles"""
        from db.mongodb import get_database
        db = get_database()
        
        result = {}
        for role in ["admin", "manager", "reception", "editor"]:
            doc = await db.role_permissions.find_one({"role": role}, {"_id": 0})
            if doc:
                result[role] = doc.get("permissions", [])
            else:
                result[role] = DEFAULT_ROLE_PERMISSIONS.get(role, [])
        
        return result
    
    @staticmethod
    async def update_role_permissions(role: str, permissions: List[str], updated_by: str) -> bool:
        """Update permissions for a role"""
        from db.mongodb import get_database
        db = get_database()
        
        # Admin always has all permissions (cannot be reduced)
        if role == "admin":
            permissions = list(ALL_PERMISSIONS.keys())
        
        # Validate permissions
        valid_permissions = [p for p in permissions if p in ALL_PERMISSIONS]
        
        doc = {
            "role": role,
            "permissions": valid_permissions,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "updated_by": updated_by
        }
        
        await db.role_permissions.update_one(
            {"role": role},
            {"$set": doc},
            upsert=True
        )
        
        return True
    
    @staticmethod
    async def has_permission(role: str, permission: str) -> bool:
        """Check if a role has a specific permission"""
        permissions = await RolePermissionsService.get_role_permissions(role)
        return permission in permissions
    
    @staticmethod
    async def reset_to_defaults() -> bool:
        """Reset all role permissions to defaults"""
        from db.mongodb import get_database
        db = get_database()
        
        await db.role_permissions.delete_many({})
        return True
