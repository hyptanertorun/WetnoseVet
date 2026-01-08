from fastapi import APIRouter, HTTPException, Request, Depends
from typing import Optional, List

from schemas.ai_generation import (
    AIBlogGenerateRequest, AIBlogReviseRequest,
    AIGenerationResponse, AIGenerationListResponse
)
from services.ai_blog_service import AIBlogService
from services.audit_service import AuditService
from middleware.auth import get_current_active_user
from middleware.rbac import require_admin_manager_editor, require_admin_or_manager
from models.user import User
from models.audit import AuditAction
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/ai-blog", tags=["AI Blog Writer"])


@router.post("/generate")
async def generate_blog_content(
    request: Request,
    data: AIBlogGenerateRequest,
    current_user: User = Depends(require_admin_manager_editor)
):
    """
    Generate blog content using AI (GPT-5.1).
    Creates a new blog post as draft with the generated content.
    """
    ip_address = request.client.host if request.client else None
    
    # Parse secondary keywords
    secondary_keywords = []
    if data.secondary_keywords:
        secondary_keywords = [kw.strip() for kw in data.secondary_keywords.split(",") if kw.strip()]
    
    try:
        result = await AIBlogService.generate_blog_content(
            user_id=current_user.id,
            user_email=current_user.email,
            topic_title=data.topic_title,
            target_keyword=data.target_keyword,
            secondary_keywords=secondary_keywords,
            location_target=data.location_target,
            tone=data.tone,
            content_length=data.content_length,
            cta_preference=data.cta_preference
        )
        
        # Audit log
        await AuditService.log(
            entity_type="blog_post",
            entity_id=result.get("blog_post_id"),
            action=AuditAction.CREATE,
            actor_user_id=current_user.id,
            actor_email=current_user.email,
            actor_role=current_user.role.value if hasattr(current_user.role, 'value') else current_user.role,
            after_state={
                "ai_generated": True,
                "generation_id": result.get("generation_id"),
                "topic": data.topic_title
            },
            metadata={"action": "ai_generate"},
            ip_address=ip_address
        )
        
        return {
            "success": True,
            "message": "Blog taslağı AI ile oluşturuldu",
            "data": result
        }
        
    except Exception as e:
        logger.error(f"AI blog generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"AI içerik oluşturma hatası: {str(e)}"
        )


@router.post("/revise")
async def revise_blog_content(
    request: Request,
    data: AIBlogReviseRequest,
    current_user: User = Depends(require_admin_manager_editor)
):
    """
    Revise existing blog content using AI.
    Updates the blog post with revised content.
    """
    ip_address = request.client.host if request.client else None
    
    try:
        result = await AIBlogService.revise_blog_content(
            user_id=current_user.id,
            user_email=current_user.email,
            blog_post_id=data.blog_post_id,
            instruction=data.instruction
        )
        
        # Audit log
        await AuditService.log(
            entity_type="blog_post",
            entity_id=data.blog_post_id,
            action=AuditAction.UPDATE,
            actor_user_id=current_user.id,
            actor_email=current_user.email,
            actor_role=current_user.role.value if hasattr(current_user.role, 'value') else current_user.role,
            after_state={
                "revision_instruction": data.instruction,
                "generation_id": result.get("generation_id")
            },
            metadata={"action": "ai_revise"},
            ip_address=ip_address
        )
        
        return {
            "success": True,
            "message": "İçerik AI ile revize edildi",
            "data": result
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"AI blog revision failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"AI revizyon hatası: {str(e)}"
        )


@router.get("/history")
async def get_generation_history(
    blog_post_id: Optional[str] = None,
    limit: int = 20,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Get AI generation history for a blog post or user"""
    generations = await AIBlogService.get_generation_history(
        user_id=current_user.id if not blog_post_id else None,
        blog_post_id=blog_post_id,
        limit=limit
    )
    
    return {
        "generations": generations,
        "total": len(generations)
    }


@router.get("/generation/{generation_id}")
async def get_generation(
    generation_id: str,
    current_user: User = Depends(require_admin_manager_editor)
):
    """Get single AI generation details"""
    generation = await AIBlogService.get_generation_by_id(generation_id)
    
    if not generation:
        raise HTTPException(status_code=404, detail="AI generation bulunamadı")
    
    return generation


# Predefined revision instructions
REVISION_TEMPLATES = [
    {"id": "shorter", "label": "Daha kısa yap", "instruction": "İçeriği daha kısa ve öz hale getir. Gereksiz detayları çıkar, ana mesajı koru."},
    {"id": "medical", "label": "Daha tıbbi anlat", "instruction": "İçeriği daha tıbbi ve bilimsel bir dille yeniden yaz. Teknik terimler ekle ama anlaşılır tut."},
    {"id": "warm", "label": "Daha sıcak bir dil kullan", "instruction": "İçeriği daha sıcak, samimi ve empatik bir dille yeniden yaz. Okuyucuyla duygusal bağ kur."},
    {"id": "seo", "label": "SEO'yu güçlendir", "instruction": "SEO performansını artır: anahtar kelimeleri daha iyi yerleştir, başlıkları optimize et, meta açıklamayı güçlendir."},
    {"id": "faq", "label": "FAQ sayısını artır", "instruction": "FAQ bölümüne 3 yeni soru-cevap ekle. Konuyla ilgili sık sorulan soruları kapsa."},
]

@router.get("/revision-templates")
async def get_revision_templates(
    current_user: User = Depends(require_admin_manager_editor)
):
    """Get predefined revision instruction templates"""
    return {"templates": REVISION_TEMPLATES}
