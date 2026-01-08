"""
AI Image Generation Router
Uses OpenAI GPT Image 1 for generating images.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from middleware.auth import get_current_active_user
from middleware.rbac import require_admin_manager_editor
from services.audit_service import AuditService
from dotenv import load_dotenv
import os
import base64
import uuid
from datetime import datetime
import logging

load_dotenv()

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/ai-image", tags=["AI Image Generation"])

# Configuration
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
UPLOAD_DIR = "/app/frontend/public/uploads/ai_generated"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


class GenerateImageRequest(BaseModel):
    title: str
    category: Optional[str] = None
    style: Optional[str] = "professional"  # professional, artistic, minimalist
    

class GenerateImageResponse(BaseModel):
    url: str
    prompt_used: str


def build_prompt(title: str, category: Optional[str], style: str) -> str:
    """Build an optimized prompt for veterinary clinic blog cover images"""
    
    base_context = "Professional veterinary clinic blog cover image"
    
    # Category-specific elements
    category_elements = {
        "Kedi Sağlığı": "featuring a healthy cat, soft lighting, clean veterinary environment",
        "Köpek Sağlığı": "featuring a happy dog, warm tones, professional veterinary setting",
        "Beslenme": "showing healthy pet food, fresh ingredients, clean presentation",
        "Bakım": "grooming theme, clean and bright, pet care products",
        "Davranış": "pet and owner interaction, positive atmosphere, trust",
        "Aşılar": "veterinary medical theme, professional equipment, care",
        "Acil Durumlar": "urgent care theme, professional veterinary team, reassuring",
        "Genel Bilgi": "general pet health, happy pets, informative mood",
    }
    
    style_modifiers = {
        "professional": "clean, modern, medical aesthetic, soft colors, trustworthy",
        "artistic": "creative, warm colors, emotional, artistic composition",
        "minimalist": "simple, clean background, focused subject, minimal elements"
    }
    
    category_hint = category_elements.get(category, "healthy pets, veterinary care theme")
    style_hint = style_modifiers.get(style, style_modifiers["professional"])
    
    prompt = f"""{base_context} for article titled "{title}". 
{category_hint}. 
Style: {style_hint}. 
16:9 aspect ratio, high quality, no text overlay, suitable for web banner.
Turkish veterinary clinic aesthetic, warm and welcoming."""

    return prompt


@router.post("/generate", response_model=GenerateImageResponse)
async def generate_cover_image(
    request: GenerateImageRequest,
    current_user = Depends(require_admin_manager_editor)
):
    """
    Generate an AI cover image based on blog title and category.
    Uses OpenAI GPT Image 1 via Emergent LLM Key.
    """
    
    if not EMERGENT_LLM_KEY:
        raise HTTPException(
            status_code=500,
            detail="AI görsel üretimi yapılandırılmamış. EMERGENT_LLM_KEY gerekli."
        )
    
    try:
        # Import here to avoid startup errors if not installed
        from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
        
        # Build the prompt
        prompt = build_prompt(request.title, request.category, request.style)
        logger.info(f"Generating image with prompt: {prompt[:100]}...")
        
        # Initialize generator
        image_gen = OpenAIImageGeneration(api_key=EMERGENT_LLM_KEY)
        
        # Generate image
        images = await image_gen.generate_images(
            prompt=prompt,
            model="gpt-image-1",
            number_of_images=1
        )
        
        if not images or len(images) == 0:
            raise HTTPException(
                status_code=500,
                detail="Görsel oluşturulamadı. Lütfen tekrar deneyin."
            )
        
        # Save the image
        image_bytes = images[0]
        unique_id = str(uuid.uuid4())[:8]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"ai_{timestamp}_{unique_id}.png"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as f:
            f.write(image_bytes)
        
        # Generate URL
        url = f"/uploads/ai_generated/{filename}"
        
        # Audit log
        await AuditService.log(
            entity_type="ai_image",
            action="generate",
            entity_id=filename,
            actor_user_id=current_user.id,
            actor_email=current_user.email,
            metadata={
                "title": request.title,
                "category": request.category,
                "style": request.style,
                "prompt_length": len(prompt)
            }
        )
        
        logger.info(f"AI image generated successfully: {filename}")
        
        return GenerateImageResponse(
            url=url,
            prompt_used=prompt
        )
        
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="AI görsel üretimi kütüphanesi yüklü değil."
        )
    except Exception as e:
        logger.error(f"AI image generation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Görsel oluşturulurken hata: {str(e)}"
        )


@router.get("/styles")
async def get_available_styles(
    current_user = Depends(require_admin_manager_editor)
):
    """Get available image generation styles"""
    return {
        "styles": [
            {"id": "professional", "name": "Profesyonel", "description": "Temiz, modern, tıbbi estetik"},
            {"id": "artistic", "name": "Artistik", "description": "Yaratıcı, sıcak renkler, duygusal"},
            {"id": "minimalist", "name": "Minimalist", "description": "Sade, temiz arka plan, odaklı"}
        ]
    }
