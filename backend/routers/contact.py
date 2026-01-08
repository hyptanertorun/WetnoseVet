"""Contact form router for public contact submissions"""
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, timezone
from uuid import uuid4

from db.mongodb import get_database
from middleware.rate_limit import rate_limit_public_form

router = APIRouter(prefix="/api/public", tags=["Public - Contact"])


class ContactFormSubmission(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    subject: str = Field(..., min_length=3, max_length=200)
    message: str = Field(..., min_length=10, max_length=2000)


class ContactResponse(BaseModel):
    success: bool
    message: str
    submission_id: Optional[str] = None


@router.post("/contact", response_model=ContactResponse)
async def submit_contact_form(
    request: Request,
    data: ContactFormSubmission,
    _: None = Depends(rate_limit_public_form)  # Rate limiting: max 20/saat
):
    """Submit a contact form message"""
    db = get_database()
    
    submission = {
        "id": str(uuid4()),
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "subject": data.subject,
        "message": data.message,
        "status": "new",  # new, read, replied, archived
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read_at": None,
        "replied_at": None,
    }
    
    try:
        await db["contact_submissions"].insert_one(submission)
        
        return ContactResponse(
            success=True,
            message="Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.",
            submission_id=submission["id"]
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Mesaj gönderilemedi. Lütfen tekrar deneyin.")
