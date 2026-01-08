"""
Rate Limiting Middleware for FastAPI
Simple in-memory implementation - Use Redis for production scaling
"""
from fastapi import Request, HTTPException
from datetime import datetime, timedelta
from typing import Dict, Tuple
import asyncio
import logging
import os

logger = logging.getLogger(__name__)

# Configuration from environment
RATE_LIMIT_LOGIN = int(os.environ.get("RATE_LIMIT_LOGIN", "15"))  # per 15 min (increased for admin friendliness)
RATE_LIMIT_LOGIN_WINDOW = int(os.environ.get("RATE_LIMIT_LOGIN_WINDOW", "900"))  # 15 min in seconds
RATE_LIMIT_REFRESH = int(os.environ.get("RATE_LIMIT_REFRESH", "30"))  # per 15 min
RATE_LIMIT_PUBLIC_FORMS = int(os.environ.get("RATE_LIMIT_PUBLIC_FORMS", "20"))  # per hour
RATE_LIMIT_PUBLIC_FORMS_WINDOW = int(os.environ.get("RATE_LIMIT_PUBLIC_FORMS_WINDOW", "3600"))  # 1 hour

# In-memory storage (use Redis for production)
_rate_limit_store: Dict[str, Dict[str, list]] = {
    "login": {},
    "refresh": {},
    "public_forms": {},
}

# Lock for thread safety
_rate_lock = asyncio.Lock()


async def check_rate_limit(
    key: str,
    limit_type: str,
    max_requests: int,
    window_seconds: int
) -> Tuple[bool, int]:
    """
    Check if the request should be rate limited.
    Returns (is_allowed, retry_after_seconds)
    """
    async with _rate_lock:
        now = datetime.now()
        window_start = now - timedelta(seconds=window_seconds)
        
        if limit_type not in _rate_limit_store:
            _rate_limit_store[limit_type] = {}
        
        store = _rate_limit_store[limit_type]
        
        if key not in store:
            store[key] = []
        
        # Clean old entries
        store[key] = [ts for ts in store[key] if ts > window_start]
        
        # Check limit
        if len(store[key]) >= max_requests:
            # Calculate retry after
            oldest = min(store[key])
            retry_after = int((oldest + timedelta(seconds=window_seconds) - now).total_seconds())
            return False, max(retry_after, 1)
        
        # Add current request
        store[key].append(now)
        return True, 0


async def rate_limit_login(request: Request, email: str = None):
    """Rate limit for login attempts"""
    ip = request.client.host if request.client else "unknown"
    
    # Check IP-based limit
    is_allowed, retry_after = await check_rate_limit(
        f"ip:{ip}",
        "login",
        RATE_LIMIT_LOGIN,
        RATE_LIMIT_LOGIN_WINDOW
    )
    
    if not is_allowed:
        logger.warning(f"Rate limit exceeded for login from IP: {ip}")
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Çok fazla giriş denemesi",
                "message": "Lütfen daha sonra tekrar deneyin.",
                "retry_after_seconds": retry_after
            }
        )
    
    # Also check email-based limit if provided
    if email:
        is_allowed, retry_after = await check_rate_limit(
            f"email:{email}",
            "login",
            RATE_LIMIT_LOGIN,
            RATE_LIMIT_LOGIN_WINDOW
        )
        
        if not is_allowed:
            logger.warning(f"Rate limit exceeded for login email: {email}")
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Çok fazla giriş denemesi",
                    "message": "Lütfen daha sonra tekrar deneyin.",
                    "retry_after_seconds": retry_after
                }
            )


async def rate_limit_refresh(request: Request):
    """Rate limit for token refresh"""
    ip = request.client.host if request.client else "unknown"
    
    is_allowed, retry_after = await check_rate_limit(
        f"ip:{ip}",
        "refresh",
        RATE_LIMIT_REFRESH,
        RATE_LIMIT_LOGIN_WINDOW
    )
    
    if not is_allowed:
        logger.warning(f"Rate limit exceeded for refresh from IP: {ip}")
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Çok fazla istek",
                "message": "Lütfen daha sonra tekrar deneyin.",
                "retry_after_seconds": retry_after
            }
        )


async def rate_limit_public_form(request: Request):
    """Rate limit for public form submissions"""
    ip = request.client.host if request.client else "unknown"
    
    is_allowed, retry_after = await check_rate_limit(
        f"ip:{ip}",
        "public_forms",
        RATE_LIMIT_PUBLIC_FORMS,
        RATE_LIMIT_PUBLIC_FORMS_WINDOW
    )
    
    if not is_allowed:
        logger.warning(f"Rate limit exceeded for public form from IP: {ip}")
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Çok fazla form gönderimi",
                "message": "Lütfen bir süre bekleyip tekrar deneyin.",
                "retry_after_seconds": retry_after
            }
        )


def clear_rate_limit_store():
    """Clear all rate limit data - useful for testing"""
    global _rate_limit_store
    _rate_limit_store = {
        "login": {},
        "refresh": {},
        "public_forms": {},
    }
