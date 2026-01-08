from fastapi import APIRouter, HTTPException, Depends, Query, Response
from typing import Optional
from datetime import datetime
import csv
import io

from schemas.appointment_request import (
    AppointmentRequestCreate,
    AppointmentRequestUpdate,
    AppointmentStatusUpdate,
    AppointmentAssignUpdate,
    AppointmentFollowUpUpdate,
    AppointmentNoteCreate,
    AppointmentRequestResponse,
    AppointmentRequestListResponse,
    AppointmentNoteResponse,
    LeadScoreReasonResponse,
    AppointmentStats
)
from services.appointment_service import AppointmentService
from services.user_service import UserService
from services.audit_service import AuditService
from middleware.auth import get_current_user, get_current_active_user
from models.user import User
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/crm", tags=["CRM"])

def format_appointment_response(appointment) -> AppointmentRequestResponse:
    """Convert appointment model to response schema"""
    notes = []
    if appointment.notes:
        for note in appointment.notes:
            notes.append(AppointmentNoteResponse(
                id=note.id,
                content=note.content,
                created_by=note.created_by,
                created_by_email=note.created_by_email,
                created_at=note.created_at.isoformat() if hasattr(note.created_at, 'isoformat') else str(note.created_at)
            ))
    
    reasons = []
    if appointment.lead_score_reasons:
        for reason in appointment.lead_score_reasons:
            reasons.append(LeadScoreReasonResponse(
                factor=reason.factor,
                points=reason.points,
                description=reason.description
            ))
    
    return AppointmentRequestResponse(
        id=appointment.id,
        name=appointment.name,
        phone=appointment.phone,
        email=appointment.email,
        pet_name=appointment.pet_name,
        pet_type=appointment.pet_type,
        pet_breed=appointment.pet_breed,
        service_requested=appointment.service_requested,
        preferred_date=appointment.preferred_date,
        preferred_time=appointment.preferred_time,
        message=appointment.message,
        source=appointment.source,
        status=appointment.status,
        assigned_to=appointment.assigned_to,
        assigned_to_email=appointment.assigned_to_email,
        follow_up_at=appointment.follow_up_at.isoformat() if appointment.follow_up_at else None,
        notes=notes,
        lead_score=appointment.lead_score,
        lead_heat=appointment.lead_heat,
        lead_score_reasons=reasons,
        created_at=appointment.created_at.isoformat() if hasattr(appointment.created_at, 'isoformat') else str(appointment.created_at),
        updated_at=appointment.updated_at.isoformat() if hasattr(appointment.updated_at, 'isoformat') else str(appointment.updated_at),
        contacted_at=appointment.contacted_at.isoformat() if appointment.contacted_at else None,
        scheduled_at=appointment.scheduled_at.isoformat() if appointment.scheduled_at else None,
        completed_at=appointment.completed_at.isoformat() if appointment.completed_at else None,
        feedback_link=appointment.feedback_link,
        feedback_sent_at=appointment.feedback_sent_at.isoformat() if appointment.feedback_sent_at else None,
        feedback_status=appointment.feedback_status or "not_sent"
    )

@router.get("/appointments", response_model=AppointmentRequestListResponse)
async def get_appointments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    lead_heat: Optional[str] = None,
    assigned_to: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    current_user: User = Depends(get_current_active_user)
):
    """Get all appointment requests with filters"""
    appointments, total = await AppointmentService.get_all(
        page=page,
        page_size=page_size,
        status=status,
        lead_heat=lead_heat,
        assigned_to=assigned_to,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    return AppointmentRequestListResponse(
        appointments=[format_appointment_response(a) for a in appointments],
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/appointments/stats", response_model=AppointmentStats)
async def get_appointment_stats(current_user: User = Depends(get_current_active_user)):
    """Get appointment statistics for dashboard"""
    stats = await AppointmentService.get_stats()
    return AppointmentStats(**stats)

@router.get("/appointments/{appointment_id}", response_model=AppointmentRequestResponse)
async def get_appointment(
    appointment_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get a single appointment request"""
    appointment = await AppointmentService.get_by_id(appointment_id)
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Randevu talebi bulunamadı")
    
    return format_appointment_response(appointment)

@router.post("/appointments", response_model=AppointmentRequestResponse)
async def create_appointment(
    data: AppointmentRequestCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Create a new appointment request (manual entry)"""
    appointment = await AppointmentService.create(data.model_dump())
    
    # Log audit
    await AuditService.log(
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role,
        entity_type="appointment_request",
        entity_id=appointment.id,
        action="create",
        after_state=appointment.to_dict()
    )
    
    return format_appointment_response(appointment)

@router.put("/appointments/{appointment_id}", response_model=AppointmentRequestResponse)
async def update_appointment(
    appointment_id: str,
    data: AppointmentRequestUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update an appointment request"""
    existing = await AppointmentService.get_by_id(appointment_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Randevu talebi bulunamadı")
    
    before_state = existing.to_dict()
    
    # Handle assigned_to - get email if assigning
    update_data = data.model_dump(exclude_unset=True)
    if "assigned_to" in update_data and update_data["assigned_to"]:
        user = await UserService.get_by_id(update_data["assigned_to"])
        if user:
            update_data["assigned_to_email"] = user.email
    
    appointment = await AppointmentService.update(appointment_id, update_data, current_user.id)
    
    if not appointment:
        raise HTTPException(status_code=400, detail="Güncelleme başarısız")
    
    # Log audit
    await AuditService.log(
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role,
        entity_type="appointment_request",
        entity_id=appointment_id,
        action="update",
        before_state=before_state,
        after_state=appointment.to_dict()
    )
    
    return format_appointment_response(appointment)

@router.patch("/appointments/{appointment_id}/status", response_model=AppointmentRequestResponse)
async def update_appointment_status(
    appointment_id: str,
    data: AppointmentStatusUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update appointment status"""
    existing = await AppointmentService.get_by_id(appointment_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Randevu talebi bulunamadı")
    
    before_state = {"status": existing.status}
    
    appointment = await AppointmentService.update_status(
        appointment_id,
        data.status,
        current_user.id
    )
    
    if not appointment:
        raise HTTPException(status_code=400, detail="Durum güncelleme başarısız")
    
    # Log audit
    await AuditService.log(
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role,
        entity_type="appointment_request",
        entity_id=appointment_id,
        action="status_change",
        before_state=before_state,
        after_state={"status": appointment.status}
    )
    
    return format_appointment_response(appointment)

@router.patch("/appointments/{appointment_id}/assign", response_model=AppointmentRequestResponse)
async def assign_appointment(
    appointment_id: str,
    data: AppointmentAssignUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Assign appointment to a user"""
    existing = await AppointmentService.get_by_id(appointment_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Randevu talebi bulunamadı")
    
    # Get assignee info
    assignee = await UserService.get_by_id(data.assigned_to)
    if not assignee:
        raise HTTPException(status_code=404, detail="Atanan kullanıcı bulunamadı")
    
    before_state = {"assigned_to": existing.assigned_to, "assigned_to_email": existing.assigned_to_email}
    
    appointment = await AppointmentService.assign(
        appointment_id,
        data.assigned_to,
        assignee.email
    )
    
    if not appointment:
        raise HTTPException(status_code=400, detail="Atama başarısız")
    
    # Log audit
    await AuditService.log(
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role,
        entity_type="appointment_request",
        entity_id=appointment_id,
        action="assign",
        before_state=before_state,
        after_state={"assigned_to": appointment.assigned_to, "assigned_to_email": appointment.assigned_to_email}
    )
    
    return format_appointment_response(appointment)

@router.patch("/appointments/{appointment_id}/follow-up", response_model=AppointmentRequestResponse)
async def set_follow_up(
    appointment_id: str,
    data: AppointmentFollowUpUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Set follow-up date for appointment"""
    existing = await AppointmentService.get_by_id(appointment_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Randevu talebi bulunamadı")
    
    before_state = {"follow_up_at": existing.follow_up_at.isoformat() if existing.follow_up_at else None}
    
    appointment = await AppointmentService.set_follow_up(appointment_id, data.follow_up_at)
    
    if not appointment:
        raise HTTPException(status_code=400, detail="Takip tarihi güncellenemedi")
    
    # Log audit
    await AuditService.log(
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role,
        entity_type="appointment_request",
        entity_id=appointment_id,
        action="follow_up_set",
        before_state=before_state,
        after_state={"follow_up_at": appointment.follow_up_at.isoformat() if appointment.follow_up_at else None}
    )
    
    return format_appointment_response(appointment)

@router.post("/appointments/{appointment_id}/notes", response_model=AppointmentRequestResponse)
async def add_note(
    appointment_id: str,
    data: AppointmentNoteCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Add a note to appointment request"""
    existing = await AppointmentService.get_by_id(appointment_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Randevu talebi bulunamadı")
    
    appointment = await AppointmentService.add_note(
        appointment_id,
        data.content,
        current_user.id,
        current_user.email
    )
    
    if not appointment:
        raise HTTPException(status_code=400, detail="Not eklenemedi")
    
    # Log audit
    await AuditService.log(
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role,
        entity_type="appointment_request",
        entity_id=appointment_id,
        action="note_added",
        after_state={"note_content": data.content[:100]}
    )
    
    return format_appointment_response(appointment)

@router.get("/appointments/export/csv")
async def export_appointments_csv(
    status: Optional[str] = None,
    lead_heat: Optional[str] = None,
    assigned_to: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Export appointments to CSV"""
    data = await AppointmentService.get_for_export(
        status=status,
        lead_heat=lead_heat,
        assigned_to=assigned_to,
        date_from=date_from,
        date_to=date_to
    )
    
    if not data:
        raise HTTPException(status_code=404, detail="Dışa aktarılacak veri bulunamadı")
    
    # Create CSV
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)
    
    # Log audit
    await AuditService.log(
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role,
        entity_type="appointment_request",
        entity_id=None,
        action="csv_export",
        metadata={"count": len(data), "filters": {"status": status, "lead_heat": lead_heat}}
    )
    
    csv_content = output.getvalue()
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=randevu_talepleri_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        }
    )


@router.post("/appointments/{appointment_id}/feedback-sent", response_model=AppointmentRequestResponse)
async def mark_feedback_sent(
    appointment_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Mark feedback as sent for completed appointment"""
    existing = await AppointmentService.get_by_id(appointment_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Randevu talebi bulunamadı")
    
    if existing.status != "completed":
        raise HTTPException(status_code=400, detail="Sadece tamamlanmış randevular için feedback gönderilebilir")
    
    appointment = await AppointmentService.mark_feedback_sent(appointment_id)
    
    if not appointment:
        raise HTTPException(status_code=400, detail="İşlem başarısız")
    
    # Log audit
    await AuditService.log(
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role,
        entity_type="appointment_request",
        entity_id=appointment_id,
        action="feedback_sent",
        after_state={"feedback_status": "sent"}
    )
    
    return format_appointment_response(appointment)


@router.get("/appointments/{appointment_id}/feedback-message")
async def get_feedback_message(
    appointment_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get pre-formatted WhatsApp feedback message"""
    appointment = await AppointmentService.get_by_id(appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Randevu talebi bulunamadı")
    
    if appointment.status != "completed":
        raise HTTPException(status_code=400, detail="Sadece tamamlanmış randevular için mesaj oluşturulabilir")
    
    # Generate feedback link if not exists
    if not appointment.feedback_link:
        feedback_link = AppointmentService.generate_feedback_link(appointment)
    else:
        feedback_link = appointment.feedback_link
    
    # Message template (Turkish)
    name = appointment.name.split()[0] if appointment.name else "Değerli müşterimiz"
    
    message = f"""Merhaba {name}, 🐾

Wetnose Veteriner Kliniği ziyaretiniz için teşekkür ederiz!

30 saniyelik geri bildiriminiz bizim için çok değerli. Deneyiminizi bizimle paylaşır mısınız?

📋 Form: {{BASE_URL}}{feedback_link}

Sağlıklı günler dileriz! 🙏
Wetnose Ekibi"""
    
    return {
        "message": message,
        "phone": appointment.phone,
        "feedback_link": feedback_link
    }
