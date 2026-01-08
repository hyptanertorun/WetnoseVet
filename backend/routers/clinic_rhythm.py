from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import date

from services.clinic_rhythm_service import ClinicRhythmService
from services.pool_service import PoolService
from middleware.auth import get_current_user, get_current_active_user
from middleware.rbac import check_role
from schemas.clinic_rhythm import (
    ClinicRhythmCreate,
    ClinicRhythmUpdate,
    ClinicRhythmStatusUpdate,
    ClinicRhythmResponse,
    ClinicRhythmListResponse,
)
from schemas.pool_item import (
    QuestionPoolCreate,
    QuestionPoolUpdate,
    QuestionPoolResponse,
    QuestionPoolListResponse,
    AlarmPoolCreate,
    AlarmPoolUpdate,
    AlarmPoolResponse,
    AlarmPoolListResponse,
    PoolStatsResponse,
)
from models.user import User

router = APIRouter(prefix="/admin/clinic-rhythm", tags=["Admin - Clinic Rhythm"])


# ===================
# POOL CRUD ENDPOINTS
# ===================

# --- Pool Stats ---

@router.get("/pool/stats", response_model=PoolStatsResponse)
async def get_pool_stats(
    current_user: User = Depends(get_current_active_user)
):
    """Get content pool statistics"""
    stats = await PoolService.get_pool_stats()
    return stats


@router.post("/pool/seed")
async def seed_pool(
    current_user: User = Depends(check_role(["admin"]))
):
    """Seed the pool from static data (admin only, one-time)"""
    result = await PoolService.seed_from_static_pool()
    return result


# --- Question Pool CRUD ---

@router.get("/pool/questions", response_model=QuestionPoolListResponse)
async def list_pool_questions(
    status: Optional[str] = Query(None, pattern="^(active|inactive|archived)$"),
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_active_user)
):
    """List all questions from the content pool"""
    questions, total = await PoolService.list_questions(
        status=status,
        category=category,
        search=search,
        skip=skip,
        limit=limit
    )
    return QuestionPoolListResponse(
        questions=[
            QuestionPoolResponse(
                id=q.id,
                question_text=q.question_text,
                short_answer=q.short_answer,
                related_blog_slug=q.related_blog_slug,
                related_blog_title=q.related_blog_title,
                category=q.category,
                status=q.status.value,
                usage_count=q.usage_count,
                last_used_date=q.last_used_date,
                created_at=q.created_at.isoformat() if q.created_at else None,
                updated_at=q.updated_at.isoformat() if q.updated_at else None,
            )
            for q in questions
        ],
        total=total
    )


@router.get("/pool/questions/{question_id}", response_model=QuestionPoolResponse)
async def get_pool_question(
    question_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific question from the pool"""
    question = await PoolService.get_question_by_id(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Soru bulunamadı")
    return QuestionPoolResponse(
        id=question.id,
        question_text=question.question_text,
        short_answer=question.short_answer,
        related_blog_slug=question.related_blog_slug,
        related_blog_title=question.related_blog_title,
        category=question.category,
        status=question.status.value,
        usage_count=question.usage_count,
        last_used_date=question.last_used_date,
        created_at=question.created_at.isoformat() if question.created_at else None,
        updated_at=question.updated_at.isoformat() if question.updated_at else None,
    )


@router.post("/pool/questions", response_model=dict)
async def create_pool_question(
    data: QuestionPoolCreate,
    current_user: User = Depends(check_role(["admin", "manager", "editor"]))
):
    """Create a new question in the pool"""
    question = await PoolService.create_question(
        question_text=data.question_text,
        short_answer=data.short_answer,
        created_by=current_user.id,
        created_by_email=current_user.email,
        related_blog_slug=data.related_blog_slug,
        related_blog_title=data.related_blog_title,
        category=data.category
    )
    return {"message": "Soru oluşturuldu", "id": question.id}


@router.put("/pool/questions/{question_id}", response_model=QuestionPoolResponse)
async def update_pool_question(
    question_id: str,
    data: QuestionPoolUpdate,
    current_user: User = Depends(check_role(["admin", "manager", "editor"]))
):
    """Update a question in the pool"""
    question = await PoolService.update_question(
        question_id=question_id,
        updated_by=current_user.id,
        updated_by_email=current_user.email,
        question_text=data.question_text,
        short_answer=data.short_answer,
        related_blog_slug=data.related_blog_slug,
        related_blog_title=data.related_blog_title,
        category=data.category,
        status=data.status
    )
    if not question:
        raise HTTPException(status_code=404, detail="Soru bulunamadı")
    return QuestionPoolResponse(
        id=question.id,
        question_text=question.question_text,
        short_answer=question.short_answer,
        related_blog_slug=question.related_blog_slug,
        related_blog_title=question.related_blog_title,
        category=question.category,
        status=question.status.value,
        usage_count=question.usage_count,
        last_used_date=question.last_used_date,
        created_at=question.created_at.isoformat() if question.created_at else None,
        updated_at=question.updated_at.isoformat() if question.updated_at else None,
    )


@router.delete("/pool/questions/{question_id}")
async def delete_pool_question(
    question_id: str,
    current_user: User = Depends(check_role(["admin", "manager"]))
):
    """Delete a question from the pool"""
    success = await PoolService.delete_question(
        question_id=question_id,
        deleted_by=current_user.id,
        deleted_by_email=current_user.email
    )
    if not success:
        raise HTTPException(status_code=404, detail="Soru bulunamadı")
    return {"message": "Soru silindi"}


# --- Alarm Pool CRUD ---

@router.get("/pool/alarms", response_model=AlarmPoolListResponse)
async def list_pool_alarms(
    status: Optional[str] = Query(None, pattern="^(active|inactive|archived)$"),
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_active_user)
):
    """List all alarms from the content pool"""
    alarms, total = await PoolService.list_alarms(
        status=status,
        category=category,
        search=search,
        skip=skip,
        limit=limit
    )
    return AlarmPoolListResponse(
        alarms=[
            AlarmPoolResponse(
                id=a.id,
                message_title=a.message_title,
                message_body=a.message_body,
                supportive_line=a.supportive_line,
                category=a.category,
                status=a.status.value,
                usage_count=a.usage_count,
                last_used_date=a.last_used_date,
                created_at=a.created_at.isoformat() if a.created_at else None,
                updated_at=a.updated_at.isoformat() if a.updated_at else None,
            )
            for a in alarms
        ],
        total=total
    )


@router.get("/pool/alarms/{alarm_id}", response_model=AlarmPoolResponse)
async def get_pool_alarm(
    alarm_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific alarm from the pool"""
    alarm = await PoolService.get_alarm_by_id(alarm_id)
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm bulunamadı")
    return AlarmPoolResponse(
        id=alarm.id,
        message_title=alarm.message_title,
        message_body=alarm.message_body,
        supportive_line=alarm.supportive_line,
        category=alarm.category,
        status=alarm.status.value,
        usage_count=alarm.usage_count,
        last_used_date=alarm.last_used_date,
        created_at=alarm.created_at.isoformat() if alarm.created_at else None,
        updated_at=alarm.updated_at.isoformat() if alarm.updated_at else None,
    )


@router.post("/pool/alarms", response_model=dict)
async def create_pool_alarm(
    data: AlarmPoolCreate,
    current_user: User = Depends(check_role(["admin", "manager", "editor"]))
):
    """Create a new alarm in the pool"""
    alarm = await PoolService.create_alarm(
        message_title=data.message_title,
        message_body=data.message_body,
        supportive_line=data.supportive_line,
        created_by=current_user.id,
        created_by_email=current_user.email,
        category=data.category
    )
    return {"message": "Alarm oluşturuldu", "id": alarm.id}


@router.put("/pool/alarms/{alarm_id}", response_model=AlarmPoolResponse)
async def update_pool_alarm(
    alarm_id: str,
    data: AlarmPoolUpdate,
    current_user: User = Depends(check_role(["admin", "manager", "editor"]))
):
    """Update an alarm in the pool"""
    alarm = await PoolService.update_alarm(
        alarm_id=alarm_id,
        updated_by=current_user.id,
        updated_by_email=current_user.email,
        message_title=data.message_title,
        message_body=data.message_body,
        supportive_line=data.supportive_line,
        category=data.category,
        status=data.status
    )
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm bulunamadı")
    return AlarmPoolResponse(
        id=alarm.id,
        message_title=alarm.message_title,
        message_body=alarm.message_body,
        supportive_line=alarm.supportive_line,
        category=alarm.category,
        status=alarm.status.value,
        usage_count=alarm.usage_count,
        last_used_date=alarm.last_used_date,
        created_at=alarm.created_at.isoformat() if alarm.created_at else None,
        updated_at=alarm.updated_at.isoformat() if alarm.updated_at else None,
    )


@router.delete("/pool/alarms/{alarm_id}")
async def delete_pool_alarm(
    alarm_id: str,
    current_user: User = Depends(check_role(["admin", "manager"]))
):
    """Delete an alarm from the pool"""
    success = await PoolService.delete_alarm(
        alarm_id=alarm_id,
        deleted_by=current_user.id,
        deleted_by_email=current_user.email
    )
    if not success:
        raise HTTPException(status_code=404, detail="Alarm bulunamadı")
    return {"message": "Alarm silindi"}


def entry_to_response(entry) -> ClinicRhythmResponse:
    """Convert ClinicRhythmEntry to response schema"""
    if not entry:
        return None
    return ClinicRhythmResponse(
        id=entry.id,
        date_key=entry.date_key,
        featured_question=entry.featured_question.model_dump() if entry.featured_question else None,
        false_alarm=entry.false_alarm.model_dump() if entry.false_alarm else None,
        status=entry.status.value,
        created_by=entry.created_by,
        updated_by=entry.updated_by,
        created_at=entry.created_at.isoformat() if entry.created_at else None,
        updated_at=entry.updated_at.isoformat() if entry.updated_at else None,
        published_at=entry.published_at.isoformat() if entry.published_at else None,
    )


@router.get("", response_model=ClinicRhythmListResponse)
async def list_clinic_rhythm_entries(
    status: Optional[str] = Query(None, regex="^(draft|published|archived)$"),
    date_from: Optional[str] = Query(None, regex=r"^\d{4}-\d{2}-\d{2}$"),
    date_to: Optional[str] = Query(None, regex=r"^\d{4}-\d{2}-\d{2}$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_active_user)
):
    """List clinic rhythm entries with filters"""
    entries, total = await ClinicRhythmService.list_entries(
        status=status,
        date_from=date_from,
        date_to=date_to,
        skip=skip,
        limit=limit
    )
    
    return ClinicRhythmListResponse(
        entries=[entry_to_response(e) for e in entries],
        total=total
    )


@router.get("/{entry_id}", response_model=ClinicRhythmResponse)
async def get_clinic_rhythm_entry(
    entry_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific clinic rhythm entry"""
    entry = await ClinicRhythmService.get_by_id(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    return entry_to_response(entry)


@router.post("", response_model=dict)
async def create_clinic_rhythm_entry(
    data: ClinicRhythmCreate,
    current_user: User = Depends(check_role(["admin", "manager", "editor"]))
):
    """Create a new clinic rhythm entry"""
    try:
        entry = await ClinicRhythmService.create(
            date_key=data.date_key,
            created_by=current_user.id,
            created_by_email=current_user.email,
            featured_question=data.featured_question.model_dump() if data.featured_question else None,
            false_alarm=data.false_alarm.model_dump() if data.false_alarm else None
        )
        return {"message": "Kayıt oluşturuldu", "id": entry.id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{entry_id}", response_model=ClinicRhythmResponse)
async def update_clinic_rhythm_entry(
    entry_id: str,
    data: ClinicRhythmUpdate,
    current_user: User = Depends(check_role(["admin", "manager", "editor"]))
):
    """Update a clinic rhythm entry"""
    entry = await ClinicRhythmService.update(
        entry_id=entry_id,
        updated_by=current_user.id,
        updated_by_email=current_user.email,
        featured_question=data.featured_question.model_dump() if data.featured_question else None,
        false_alarm=data.false_alarm.model_dump() if data.false_alarm else None
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    return entry_to_response(entry)


@router.patch("/{entry_id}/status", response_model=ClinicRhythmResponse)
async def update_clinic_rhythm_status(
    entry_id: str,
    data: ClinicRhythmStatusUpdate,
    current_user: User = Depends(check_role(["admin", "manager", "editor"]))
):
    """Update entry status (publish/unpublish/archive)"""
    entry = await ClinicRhythmService.update_status(
        entry_id=entry_id,
        status=data.status,
        updated_by=current_user.id,
        updated_by_email=current_user.email
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    return entry_to_response(entry)


@router.delete("/{entry_id}")
async def delete_clinic_rhythm_entry(
    entry_id: str,
    current_user: User = Depends(check_role(["admin", "manager"]))
):
    """Delete a clinic rhythm entry"""
    success = await ClinicRhythmService.delete(
        entry_id=entry_id,
        deleted_by=current_user.id,
        deleted_by_email=current_user.email
    )
    if not success:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    return {"message": "Kayıt silindi"}


@router.get("/by-date/{date_key}", response_model=ClinicRhythmResponse)
async def get_clinic_rhythm_by_date(
    date_key: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get clinic rhythm entry by date"""
    entry = await ClinicRhythmService.get_by_date(date_key)
    if not entry:
        raise HTTPException(status_code=404, detail="Bu tarih için kayıt bulunamadı")
    return entry_to_response(entry)


# --- Version Management ---

from services.version_service import VersionService
from schemas.version import VersionListResponse, VersionResponse


@router.get("/{entry_id}/versions")
async def get_clinic_rhythm_versions(
    entry_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get version history for a clinic rhythm entry"""
    entry = await ClinicRhythmService.get_by_id(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    
    versions = await VersionService.get_versions("clinic_rhythm", entry_id)
    
    return {
        "versions": [
            {
                "id": v.id,
                "entity_type": v.entity_type,
                "entity_id": v.entity_id,
                "version_no": v.version_no,
                "snapshot": v.snapshot,
                "change_reason": v.change_reason,
                "created_at": v.created_at.isoformat() if v.created_at else None,
                "created_by": v.created_by,
                "created_by_email": v.created_by_email
            }
            for v in versions
        ],
        "total": len(versions)
    }


@router.post("/{entry_id}/versions/{version_id}/restore")
async def restore_clinic_rhythm_version(
    entry_id: str,
    version_id: str,
    current_user: User = Depends(check_role(["admin", "manager", "editor"]))
):
    """Restore a clinic rhythm entry from a previous version"""
    entry = await ClinicRhythmService.get_by_id(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    
    version = await VersionService.get_version_by_id(version_id)
    if not version or version.entity_id != entry_id:
        raise HTTPException(status_code=404, detail="Versiyon bulunamadı")
    
    # Create snapshot of current state before restore
    await VersionService.create_version(
        entity_type="clinic_rhythm",
        entity_id=entry_id,
        snapshot=entry.to_dict(),
        created_by=current_user.id,
        created_by_email=current_user.email,
        change_reason=f"Versiyon {version.version_no} geri yükleme öncesi otomatik kayıt"
    )
    
    # Restore from snapshot
    snapshot = version.snapshot
    await ClinicRhythmService.update(
        entry_id=entry_id,
        updated_by=current_user.id,
        updated_by_email=current_user.email,
        featured_question=snapshot.get("featured_question"),
        false_alarm=snapshot.get("false_alarm")
    )
    
    from services.audit_service import AuditService
    await AuditService.log(
        action="clinic_rhythm.restore",
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        entity_type="clinic_rhythm",
        entity_id=entry_id,
        details={"restored_from_version": version.version_no, "version_id": version_id}
    )
    
    return {"message": f"Versiyon {version.version_no} başarıyla geri yüklendi"}
