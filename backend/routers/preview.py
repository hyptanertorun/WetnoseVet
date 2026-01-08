"""
Preview Token System for Draft Content Preview
Generates short-lived tokens for previewing unpublished content
"""

from fastapi import APIRouter, HTTPException, Depends, Header, Query
from typing import Optional
from datetime import datetime, timezone, timedelta
from uuid import uuid4
import secrets
import jwt

from middleware.auth import get_current_user
from middleware.rbac import require_admin_manager_editor
from models.user import User
from services.audit_service import AuditService
from config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/preview", tags=["Admin - Preview"])

# In-memory preview token store (use Redis in production)
_preview_tokens: dict = {}

# Preview token settings
PREVIEW_TOKEN_EXPIRE_SECONDS = 600  # 10 minutes
PREVIEW_TOKEN_SECRET = settings.JWT_SECRET + "-preview"


def create_preview_token(user_id: str, user_email: str) -> tuple[str, int]:
    """Create a short-lived preview token"""
    token_id = str(uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=PREVIEW_TOKEN_EXPIRE_SECONDS)
    
    payload = {
        "token_id": token_id,
        "user_id": user_id,
        "user_email": user_email,
        "scope": "preview",
        "exp": expires_at.timestamp(),
        "iat": datetime.now(timezone.utc).timestamp()
    }
    
    token = jwt.encode(payload, PREVIEW_TOKEN_SECRET, algorithm="HS256")
    
    # Store token info
    _preview_tokens[token_id] = {
        "user_id": user_id,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    }
    
    # Cleanup old tokens
    _cleanup_expired_tokens()
    
    return token, PREVIEW_TOKEN_EXPIRE_SECONDS


def validate_preview_token(token: str) -> Optional[dict]:
    """Validate a preview token and return payload if valid"""
    try:
        payload = jwt.decode(token, PREVIEW_TOKEN_SECRET, algorithms=["HS256"])
        
        if payload.get("scope") != "preview":
            return None
        
        token_id = payload.get("token_id")
        if token_id not in _preview_tokens:
            # Token was revoked or never existed in this server instance
            # Still allow if JWT is valid (for multi-server deployments)
            pass
        
        return payload
    except jwt.ExpiredSignatureError:
        logger.debug("Preview token expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.debug(f"Invalid preview token: {e}")
        return None


def _cleanup_expired_tokens():
    """Remove expired tokens from memory"""
    now = datetime.now(timezone.utc)
    expired = [k for k, v in _preview_tokens.items() if v["expires_at"] < now]
    for k in expired:
        del _preview_tokens[k]


async def get_preview_token(
    x_preview_token: Optional[str] = Header(None, alias="X-Preview-Token"),
    token: Optional[str] = Query(None)
) -> dict:
    """Dependency to validate preview token from header or query param"""
    preview_token = x_preview_token or token
    
    if not preview_token:
        raise HTTPException(
            status_code=401, 
            detail="Önizleme token'ı gerekli. Admin panelden yeni bir önizleme linki oluşturun."
        )
    
    payload = validate_preview_token(preview_token)
    if not payload:
        raise HTTPException(
            status_code=401, 
            detail="Önizleme token'ı geçersiz veya süresi dolmuş. Admin panelden yeni bir önizleme linki oluşturun."
        )
    
    return payload


# --- Admin Endpoints ---

@router.post("/token")
async def generate_preview_token(
    current_user: User = Depends(require_admin_manager_editor)
):
    """Generate a short-lived preview token (10 minutes)"""
    token, expires_in = create_preview_token(current_user.id, current_user.email)
    
    # Audit log (do not log the actual token)
    await AuditService.log(
        action="preview.token_issued",
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        entity_type="preview",
        entity_id="token",
        metadata={"expires_in": expires_in}
    )
    
    return {
        "preview_token": token,
        "expires_in": expires_in,
        "message": f"Token {expires_in // 60} dakika geçerlidir"
    }
