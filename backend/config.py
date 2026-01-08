import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class Settings:
    # Environment
    APP_ENV: str = os.environ.get('APP_ENV', 'preview')  # "preview" | "production"
    
    # Database
    MONGO_URL: str = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    DB_NAME: str = os.environ.get('DB_NAME', 'wetnose_db')
    
    # JWT Settings
    JWT_SECRET: str = os.environ.get('JWT_SECRET', 'wetnose-super-secret-key-change-in-production-2024')
    JWT_REFRESH_SECRET: str = os.environ.get('JWT_REFRESH_SECRET', 'wetnose-refresh-secret-key-change-in-production-2024')
    JWT_ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    REFRESH_TOKEN_EXPIRE_DAYS_REMEMBER: int = 30  # Extended when "Remember Me" is checked
    
    # CORS
    CORS_ORIGINS: str = os.environ.get('CORS_ORIGINS', '*')
    
    # Cookie Settings (env-aware defaults)
    @property
    def COOKIE_SECURE(self) -> bool:
        env_val = os.environ.get('COOKIE_SECURE', '')
        if env_val:
            return env_val.lower() == 'true'
        # Default: false in preview, true in production
        return self.APP_ENV == 'production'
    
    @property
    def COOKIE_DOMAIN(self) -> str:
        return os.environ.get('COOKIE_DOMAIN', '')  # Empty = no domain restriction
    
    @property
    def COOKIE_SAMESITE(self) -> str:
        return os.environ.get('COOKIE_SAMESITE', 'lax')
    
    # Stage Admin (Preview Environment)
    STAGE_ADMIN_EMAIL: str = os.environ.get('STAGE_ADMIN_EMAIL', 'admin@wetnose.com.tr')
    STAGE_ADMIN_PASSWORD: str = os.environ.get('STAGE_ADMIN_PASSWORD', '')
    STAGE_ADMIN_SYNC: bool = os.environ.get('STAGE_ADMIN_SYNC', 'true').lower() == 'true'
    
    # Support Admin (Gizli Destek Erişimi - Veritabanında yok, müşteri göremez)
    SUPPORT_ADMIN_EMAIL: str = os.environ.get('SUPPORT_ADMIN_EMAIL', '')
    SUPPORT_ADMIN_PASSWORD: str = os.environ.get('SUPPORT_ADMIN_PASSWORD', '')
    
    # Production Admin (Initial Setup)
    INITIAL_ADMIN_EMAIL: str = os.environ.get('INITIAL_ADMIN_EMAIL', '')
    INITIAL_ADMIN_PASSWORD: str = os.environ.get('INITIAL_ADMIN_PASSWORD', '')
    
    # Rate Limiting
    LOGIN_RATE_LIMIT: str = "5/minute"
    RATE_LIMIT_LOGIN: int = int(os.environ.get('RATE_LIMIT_LOGIN', '15'))
    
    @property
    def is_preview(self) -> bool:
        return self.APP_ENV != 'production'
    
    @property
    def is_production(self) -> bool:
        return self.APP_ENV == 'production'

settings = Settings()
