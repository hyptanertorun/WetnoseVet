from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from config import settings

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment validation at startup
def validate_environment():
    """Validate required environment variables at startup"""
    required_vars = ['MONGO_URL', 'DB_NAME']
    missing = [var for var in required_vars if not os.environ.get(var)]
    if missing:
        raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
    
    # Log current environment
    logger.info(f"APP_ENV: {settings.APP_ENV}")
    logger.info(f"COOKIE_SECURE: {settings.COOKIE_SECURE}")
    logger.info(f"COOKIE_DOMAIN: {settings.COOKIE_DOMAIN or '(not set)'}")
    
    # Preview environment checks
    if settings.is_preview:
        if not settings.STAGE_ADMIN_PASSWORD:
            logger.warning("STAGE_ADMIN_PASSWORD not set - admin login may fail in preview")
        else:
            logger.info(f"Stage admin configured: {settings.STAGE_ADMIN_EMAIL}")
        
        # Warn if cookie domain is set but might mismatch
        if settings.COOKIE_DOMAIN:
            logger.warning(f"COOKIE_DOMAIN is set to '{settings.COOKIE_DOMAIN}' in preview - ensure it matches your preview domain")
    
    # Production environment checks - STRICT ENFORCEMENT
    if settings.is_production:
        errors = []
        
        # COOKIE_SECURE MUST be true
        if not settings.COOKIE_SECURE:
            errors.append("COOKIE_SECURE must be 'true' in production environment")
        
        # COOKIE_DOMAIN should be set for cross-subdomain support
        if not settings.COOKIE_DOMAIN:
            logger.warning("COOKIE_DOMAIN not set in production - cookies may not work across subdomains")
        elif not settings.COOKIE_DOMAIN.startswith('.'):
            logger.warning(f"COOKIE_DOMAIN '{settings.COOKIE_DOMAIN}' should start with '.' for subdomain support (e.g., '.wetnose.com.tr')")
        
        # CORS should not be wildcard
        cors = os.environ.get('CORS_ORIGINS', '*')
        if cors == '*':
            errors.append("CORS_ORIGINS must not be '*' in production - set specific domains")
        else:
            # Validate allowed origins
            allowed_origins = [o.strip() for o in cors.split(',')]
            for origin in allowed_origins:
                if not origin.startswith('https://'):
                    logger.warning(f"Non-HTTPS origin in CORS_ORIGINS: {origin}")
        
        # JWT secrets should not be defaults
        if 'change-in-production' in settings.JWT_SECRET:
            errors.append("JWT_SECRET must be changed from default value in production")
        if 'change-in-production' in settings.JWT_REFRESH_SECRET:
            errors.append("JWT_REFRESH_SECRET must be changed from default value in production")
        
        # Initial admin credentials for first setup
        if not settings.INITIAL_ADMIN_EMAIL or not settings.INITIAL_ADMIN_PASSWORD:
            logger.warning("INITIAL_ADMIN_EMAIL/PASSWORD not set - initial admin must be created manually")
        
        # Fail fast if critical errors
        if errors:
            for err in errors:
                logger.error(f"PRODUCTION ERROR: {err}")
            raise ValueError(f"Production environment validation failed: {'; '.join(errors)}")
        
        logger.info("Production environment validation PASSED")

validate_environment()

# Ensure upload directories exist
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
(UPLOAD_DIR / "testimonials").mkdir(exist_ok=True)

# Import database functions
from db.mongodb import connect_to_mongo, close_mongo_connection

# Import routers
from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.settings import router as settings_router
from routers.audit import router as audit_router
from routers.services import router as services_router, public_services_router
from routers.team import router as team_router, public_team_router
from routers.public import router as public_router
from routers.crm import router as crm_router
from routers.dashboard import router as dashboard_router
from routers.blog import router as blog_router, public_blog_router
from routers.gallery import router as gallery_router, public_router as gallery_public_router, public_gallery_router
from routers.testimonials import router as testimonials_router
from routers.ai_blog import router as ai_blog_router
from routers.clinic_rhythm import router as clinic_rhythm_router
from routers.preview import router as preview_router
from routers.public_preview import router as public_preview_router
from routers.blog_categories import router as blog_categories_router
from routers.uploads import router as uploads_router
from routers.ai_image import router as ai_image_router
from routers.ai_usage import router as ai_usage_router
from routers.slider import router as slider_router
from routers.contact import router as contact_router
from routers.admin_contact import router as admin_contact_router
from routers.role_permissions import router as role_permissions_router

# Import rate limiting
from middleware.rate_limit import rate_limit_login, rate_limit_refresh, rate_limit_public_form

# Import user service for admin sync
from services.user_service import UserService

# Configure logging (already done above)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting WETNOSE Admin API...")
    await connect_to_mongo()
    
    # Ensure admin user based on environment
    try:
        if settings.is_preview:
            await UserService.ensure_stage_admin()
        else:
            await UserService.ensure_production_admin()
    except Exception as e:
        logger.error(f"Failed to ensure admin user: {e}")
    
    yield
    # Shutdown
    logger.info("Shutting down WETNOSE Admin API...")
    await close_mongo_connection()

# Create FastAPI app
app = FastAPI(
    title="WETNOSE Veteriner Klinigi - Admin API",
    description="Admin Panel Backend API for WETNOSE Veterinary Clinic",
    version="1.0.0",
    lifespan=lifespan
)


# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # HSTS only in production
        if settings.is_production:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response


# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)


# Configure CORS based on environment
cors_origins = os.environ.get('CORS_ORIGINS', '*')
if cors_origins == '*':
    cors_allow_origins = ['*']
else:
    cors_allow_origins = [origin.strip() for origin in cors_origins.split(',')]


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(settings_router, prefix="/api")
app.include_router(audit_router, prefix="/api")
app.include_router(services_router, prefix="/api")
app.include_router(public_services_router, prefix="/api")
app.include_router(team_router, prefix="/api")
app.include_router(public_team_router, prefix="/api")
app.include_router(public_router, prefix="/api")
app.include_router(crm_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(blog_router, prefix="/api")
app.include_router(public_blog_router, prefix="/api")
app.include_router(gallery_router, prefix="/api")
app.include_router(gallery_public_router, prefix="/api")
app.include_router(public_gallery_router, prefix="/api")
app.include_router(testimonials_router, prefix="/api")
app.include_router(ai_blog_router, prefix="/api")
app.include_router(clinic_rhythm_router, prefix="/api")
app.include_router(preview_router, prefix="/api")
app.include_router(public_preview_router, prefix="/api")
app.include_router(blog_categories_router, prefix="/api")
app.include_router(uploads_router, prefix="/api")
app.include_router(ai_image_router, prefix="/api")
app.include_router(ai_usage_router, prefix="/api")
app.include_router(slider_router, prefix="/api")
app.include_router(contact_router)
app.include_router(admin_contact_router, prefix="/api")
app.include_router(role_permissions_router, prefix="/api")

# Static file serving for uploads with cache control
from starlette.responses import FileResponse

class CachedStaticFiles(StaticFiles):
    """StaticFiles with cache headers for performance"""
    async def get_response(self, path: str, scope):
        response = await super().get_response(path, scope)
        if isinstance(response, FileResponse):
            # 1 year cache for immutable uploads (WebP optimized images)
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
            response.headers["Vary"] = "Accept-Encoding"
        return response

app.mount("/uploads", CachedStaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Health check endpoint
@app.get("/api")
async def root():
    return {
        "message": "WETNOSE Admin API",
        "version": "1.0.0",
        "status": "healthy"
    }

# Health check endpoints - both paths for compatibility
@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
