"""Admin Contact Messages Router"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone

from middleware.auth import get_current_active_user
from middleware.rbac import check_role
from models.user import User
from db.mongodb import get_database

router = APIRouter(prefix="/admin/contact", tags=["Admin - Contact Messages"])


class ContactMessageResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str]
    subject: str
    message: str
    status: str  # new, read, replied, archived
    created_at: str
    read_at: Optional[str]
    replied_at: Optional[str]


class ContactListResponse(BaseModel):
    messages: List[ContactMessageResponse]
    total: int
    page: int
    limit: int


class ContactStatsResponse(BaseModel):
    total: int
    new: int
    read: int
    replied: int
    archived: int


class ContactStatusUpdate(BaseModel):
    status: str  # new, read, replied, archived


@router.get("/messages", response_model=ContactListResponse)
async def list_contact_messages(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """List all contact messages with pagination"""
    db = get_database()
    
    # Build query
    query = {}
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"subject": {"$regex": search, "$options": "i"}},
        ]
    
    # Get total count
    total = await db["contact_submissions"].count_documents(query)
    
    # Get messages with pagination
    skip = (page - 1) * limit
    cursor = db["contact_submissions"].find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
    messages = await cursor.to_list(length=limit)
    
    return ContactListResponse(
        messages=[ContactMessageResponse(**msg) for msg in messages],
        total=total,
        page=page,
        limit=limit
    )


@router.get("/messages/stats", response_model=ContactStatsResponse)
async def get_contact_stats(
    current_user: User = Depends(get_current_active_user)
):
    """Get contact message statistics"""
    db = get_database()
    
    total = await db["contact_submissions"].count_documents({})
    new = await db["contact_submissions"].count_documents({"status": "new"})
    read = await db["contact_submissions"].count_documents({"status": "read"})
    replied = await db["contact_submissions"].count_documents({"status": "replied"})
    archived = await db["contact_submissions"].count_documents({"status": "archived"})
    
    return ContactStatsResponse(
        total=total,
        new=new,
        read=read,
        replied=replied,
        archived=archived
    )


@router.get("/messages/{message_id}", response_model=ContactMessageResponse)
async def get_contact_message(
    message_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get a single contact message and mark as read"""
    db = get_database()
    
    message = await db["contact_submissions"].find_one({"id": message_id}, {"_id": 0})
    if not message:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı")
    
    # Mark as read if new
    if message.get("status") == "new":
        await db["contact_submissions"].update_one(
            {"id": message_id},
            {"$set": {"status": "read", "read_at": datetime.now(timezone.utc).isoformat()}}
        )
        message["status"] = "read"
        message["read_at"] = datetime.now(timezone.utc).isoformat()
    
    return ContactMessageResponse(**message)


@router.put("/messages/{message_id}/status")
async def update_message_status(
    message_id: str,
    data: ContactStatusUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update contact message status"""
    db = get_database()
    
    valid_statuses = ["new", "read", "replied", "archived"]
    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Geçersiz durum. Geçerli değerler: {valid_statuses}")
    
    update_data = {"status": data.status}
    if data.status == "read":
        update_data["read_at"] = datetime.now(timezone.utc).isoformat()
    elif data.status == "replied":
        update_data["replied_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db["contact_submissions"].update_one(
        {"id": message_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı")
    
    return {"message": "Durum güncellendi", "status": data.status}


@router.delete("/messages/{message_id}")
async def delete_contact_message(
    message_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete a contact message"""
    db = get_database()
    
    result = await db["contact_submissions"].delete_one({"id": message_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı")
    
    return {"message": "Mesaj silindi"}
