from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
import os
import json
import time
import logging
import re
from dotenv import load_dotenv

from db.mongodb import get_database
from models.ai_generation import AIGeneration, ContentTone, ContentLength, CTAType
from services.blog_service import BlogService
from services.version_service import VersionService

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# System prompt for veterinary blog content
SYSTEM_PROMPT = """Sen Wetnose Veteriner Kliniği için profesyonel blog içeriği üreten bir AI asistanısın.

ZORUNLU KURALLAR:
1. DİL: Tüm içerik Türkçe olmalı
2. HEDEF KİTLE: Evcil hayvan sahipleri (teknik olmayan, anlaşılır dil)
3. TIBBİ ETİK:
   - KESİNLİKLE tedavi garantisi verme
   - KESİNLİKLE dozaj/ilaç talimatı verme
   - KESİNLİKLE teşhis koyma
   - Her zaman "veteriner hekime danışın" öner
4. TON: Sakin, güven veren, açık ve net
5. MARKA: "Wetnose" markasını doğal şekilde en fazla 1-2 kez kullan
6. SEO:
   - Anahtar kelimeyi doğal şekilde içeriğe entegre et
   - Keyword stuffing YAPMA
7. YASAL: İçeriğin sonuna bilgilendirme disclaimer ekle

ÇIKTI FORMATI:
Sadece JSON formatında yanıt ver. Başka hiçbir şey ekleme.
JSON şeması:
{
  "title": "Blog başlığı (H1)",
  "slug": "url-friendly-slug",
  "meta_title": "SEO meta başlığı (60 karakter max)",
  "meta_description": "SEO meta açıklaması (155 karakter max)",
  "outline": ["H2 başlık 1", "H2 başlık 2", ...],
  "content_html": "Tam HTML içerik (h2, p, ul, ol kullan)",
  "faq": [{"question": "Soru?", "answer": "Cevap"}],
  "schema_jsonld": "FAQ schema JSON string",
  "tags": ["tag1", "tag2"],
  "category_suggestion": "Önerilen kategori",
  "cta_block": {"type": "appointment|whatsapp|none", "text": "CTA metni"},
  "disclaimer": "Bilgilendirme disclaimer metni"
}"""

REVISION_PROMPT = """Sen Wetnose Veteriner Kliniği için blog içeriği düzenleyen bir AI asistanısın.

Mevcut içeriği aşağıdaki talimata göre revize et:
- Orijinal yapıyı koru (H2/H3 hiyerarşisi)
- Sadece istenen değişiklikleri yap
- Tıbbi etik kurallarını her zaman uygula:
  - KESİNLİKLE teşhis yapma
  - KESİNLİKLE dozaj/ilaç talimatı verme
  - KESİNLİKLE tedavi garantisi verme
- Türkçe dil kalitesini koru
- "Wetnose" markasını en fazla 1 kez kullan

ÇIKTI FORMATI (JSON):
{
  "title": "Güncellenmiş başlık (veya mevcut başlık)",
  "content_html": "Revize edilmiş HTML içerik",
  "meta_title": "SEO meta başlığı (60 karakter max)",
  "meta_description": "SEO meta açıklaması (155 karakter max)",
  "faq": [{"question": "", "answer": ""}],
  "tags": ["tag1", "tag2"],
  "change_summary": "Yapılan değişikliklerin kısa özeti (1-2 cümle)"
}

Sadece JSON döndür, başka açıklama ekleme."""


class AIBlogService:
    COLLECTION = "ai_generations"
    
    @staticmethod
    def get_word_count_target(content_length: str) -> tuple:
        """Get word count range based on content length setting"""
        if content_length == "short":
            return (800, 1000)
        elif content_length == "long":
            return (1800, 2200)
        else:  # medium
            return (1200, 1600)
    
    @staticmethod
    def get_tone_instruction(tone: str) -> str:
        """Get tone-specific instruction"""
        tones = {
            "professional": "Profesyonel ve otoriter bir ton kullan. Bilimsel referanslar ekle.",
            "warm": "Sıcak, samimi ve empatik bir ton kullan. Hayvan sevgisi hissettir.",
            "informative": "Bilgilendirici ve eğitici bir ton kullan. Adım adım açıkla."
        }
        return tones.get(tone, tones["professional"])
    
    @staticmethod
    def get_cta_instruction(cta: str) -> str:
        """Get CTA-specific instruction"""
        ctas = {
            "appointment": "İçeriğin sonuna randevu almaya teşvik eden bir CTA ekle. Örnek: 'Wetnose'ta uzman veteriner hekimlerimizle randevu alın.'",
            "whatsapp": "İçeriğin sonuna WhatsApp üzerinden iletişime geçmeye teşvik eden bir CTA ekle.",
            "none": "CTA bloğunu boş bırak."
        }
        return ctas.get(cta, ctas["appointment"])
    
    @staticmethod
    async def generate_blog_content(
        user_id: str,
        user_email: str,
        topic_title: str,
        target_keyword: str,
        secondary_keywords: Optional[List[str]] = None,
        location_target: Optional[str] = None,
        tone: str = "professional",
        content_length: str = "medium",
        cta_preference: str = "appointment"
    ) -> Dict[str, Any]:
        """Generate blog content using GPT-5.1"""
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        db = get_database()
        start_time = time.time()
        
        # Create generation record
        generation = AIGeneration(
            user_id=user_id,
            user_email=user_email,
            topic_title=topic_title,
            target_keyword=target_keyword,
            secondary_keywords=secondary_keywords or [],
            location_target=location_target,
            tone=ContentTone(tone),
            content_length=ContentLength(content_length),
            cta_preference=CTAType(cta_preference),
            status="pending"
        )
        
        # Build user prompt
        word_range = AIBlogService.get_word_count_target(content_length)
        
        user_prompt = f"""Aşağıdaki bilgilere göre bir veterinerlik blog yazısı oluştur:

KONU: {topic_title}
ANA ANAHTAR KELİME: {target_keyword}
"""
        
        if secondary_keywords:
            user_prompt += f"İKİNCİL ANAHTAR KELİMELER: {', '.join(secondary_keywords)}\n"
        
        if location_target:
            user_prompt += f"HEDEF LOKASYON: {location_target} (yerel SEO için bu lokasyonu doğal şekilde içeriğe dahil et)\n"
        
        user_prompt += f"""
TON: {AIBlogService.get_tone_instruction(tone)}
İÇERİK UZUNLUĞU: {word_range[0]}-{word_range[1]} kelime arası
CTA: {AIBlogService.get_cta_instruction(cta_preference)}

Lütfen yukarıdaki bilgilere göre SEO optimize edilmiş, tıbbi etik kurallara uygun bir blog yazısı oluştur.
Sadece JSON formatında yanıt ver."""

        try:
            # Initialize LLM
            api_key = os.environ.get("EMERGENT_LLM_KEY")
            if not api_key:
                raise ValueError("EMERGENT_LLM_KEY not found in environment")
            
            chat = LlmChat(
                api_key=api_key,
                session_id=f"blog-gen-{generation.id}",
                system_message=SYSTEM_PROMPT
            ).with_model("openai", "gpt-5.1")
            
            # Send message
            message = UserMessage(text=user_prompt)
            response = await chat.send_message(message)
            
            # Parse JSON response
            output_json = AIBlogService._parse_json_response(response)
            
            if not output_json:
                raise ValueError("AI yanıtı JSON formatında değil")
            
            # Calculate processing time
            processing_time = int((time.time() - start_time) * 1000)
            
            # Update generation record
            generation.output_json = output_json
            generation.status = "completed"
            generation.processing_time_ms = processing_time
            
            # Create blog post draft
            blog_post = await BlogService.create(
                title=output_json.get("title", topic_title),
                slug=output_json.get("slug", ""),
                content=output_json.get("content_html", ""),
                excerpt=output_json.get("meta_description", "")[:200],
                meta_title=output_json.get("meta_title"),
                meta_description=output_json.get("meta_description"),
                tags=output_json.get("tags", []),
                category=output_json.get("category_suggestion"),
                status="draft",
                author_id=user_id,
                ai_generated=True,
                ai_metadata={
                    "generation_id": generation.id,
                    "faq": output_json.get("faq", []),
                    "schema_jsonld": output_json.get("schema_jsonld"),
                    "cta_block": output_json.get("cta_block"),
                    "disclaimer": output_json.get("disclaimer"),
                    "outline": output_json.get("outline", [])
                }
            )
            
            generation.blog_post_id = blog_post.id
            
            # Save generation record
            doc = generation.model_dump()
            doc["_id"] = generation.id
            doc["created_at"] = generation.created_at.isoformat()
            doc["tone"] = generation.tone.value
            doc["content_length"] = generation.content_length.value
            doc["cta_preference"] = generation.cta_preference.value
            
            await db[AIBlogService.COLLECTION].insert_one(doc)
            
            logger.info(f"AI blog generated: {generation.id} -> blog post: {blog_post.id}")
            
            return {
                "generation_id": generation.id,
                "blog_post_id": blog_post.id,
                "output": output_json,
                "processing_time_ms": processing_time,
                "status": "completed"
            }
            
        except Exception as e:
            logger.error(f"AI generation failed: {e}")
            
            # Save failed generation
            generation.status = "failed"
            generation.error_message = str(e)
            generation.processing_time_ms = int((time.time() - start_time) * 1000)
            
            doc = generation.model_dump()
            doc["_id"] = generation.id
            doc["created_at"] = generation.created_at.isoformat()
            doc["tone"] = generation.tone.value
            doc["content_length"] = generation.content_length.value
            doc["cta_preference"] = generation.cta_preference.value
            
            await db[AIBlogService.COLLECTION].insert_one(doc)
            
            raise
    
    @staticmethod
    async def revise_blog_content(
        user_id: str,
        user_email: str,
        blog_post_id: str,
        instruction: str
    ) -> Dict[str, Any]:
        """Revise existing blog content with AI"""
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        db = get_database()
        start_time = time.time()
        
        # Get existing blog post
        blog_post = await BlogService.get_by_id(blog_post_id)
        if not blog_post:
            raise ValueError("Blog yazısı bulunamadı")
        
        # Create generation record for revision
        generation = AIGeneration(
            user_id=user_id,
            user_email=user_email,
            blog_post_id=blog_post_id,
            topic_title=blog_post.title,
            target_keyword="",
            is_revision=True,
            revision_instruction=instruction,
            status="pending"
        )
        
        # Build revision prompt - get SEO fields from nested seo object
        meta_title = blog_post.seo.meta_title if blog_post.seo else None
        meta_description = blog_post.seo.meta_description if blog_post.seo else None
        
        current_content = {
            "title": blog_post.title,
            "content_html": blog_post.content,
            "meta_title": meta_title,
            "meta_description": meta_description,
            "tags": blog_post.tags,
        }
        
        # Add AI metadata if exists
        if hasattr(blog_post, 'ai_metadata') and blog_post.ai_metadata:
            current_content["faq"] = blog_post.ai_metadata.get("faq", [])
            current_content["cta_block"] = blog_post.ai_metadata.get("cta_block")
            current_content["disclaimer"] = blog_post.ai_metadata.get("disclaimer")
        
        user_prompt = f"""Mevcut blog içeriği:
```json
{json.dumps(current_content, ensure_ascii=False, indent=2)}
```

REVİZYON TALİMATI: {instruction}

Lütfen yukarıdaki içeriği talimata göre revize et ve güncellenmiş JSON'u döndür."""

        try:
            api_key = os.environ.get("EMERGENT_LLM_KEY")
            if not api_key:
                raise ValueError("EMERGENT_LLM_KEY not found")
            
            chat = LlmChat(
                api_key=api_key,
                session_id=f"blog-revise-{generation.id}",
                system_message=REVISION_PROMPT
            ).with_model("openai", "gpt-5.1")
            
            message = UserMessage(text=user_prompt)
            response = await chat.send_message(message)
            
            output_json = AIBlogService._parse_json_response(response)
            
            if not output_json:
                raise ValueError("AI yanıtı JSON formatında değil")
            
            processing_time = int((time.time() - start_time) * 1000)
            
            # Update generation record
            generation.output_json = output_json
            generation.status = "completed"
            generation.processing_time_ms = processing_time
            
            # Create version snapshot BEFORE updating (preserve current state)
            await VersionService.create_version(
                entity_type="blog_post",
                entity_id=blog_post_id,
                snapshot={
                    "title": blog_post.title,
                    "content": blog_post.content,
                    "meta_title": meta_title,
                    "meta_description": meta_description,
                    "tags": blog_post.tags,
                    "ai_metadata": blog_post.ai_metadata if hasattr(blog_post, 'ai_metadata') else None,
                    "source": "ai-revise",
                    "revision_instruction": instruction
                },
                created_by=user_id,
                created_by_email=user_email,
                change_reason=f"AI Revize: {instruction[:100]}"
            )
            
            # Update blog post with new content
            update_data = {}
            if output_json.get("title"):
                update_data["title"] = output_json["title"]
            if output_json.get("content_html"):
                update_data["content"] = output_json["content_html"]
            if output_json.get("meta_title"):
                update_data["meta_title"] = output_json["meta_title"]
            if output_json.get("meta_description"):
                update_data["meta_description"] = output_json["meta_description"]
            if output_json.get("tags"):
                update_data["tags"] = output_json["tags"]
            
            # Update AI metadata
            ai_metadata = blog_post.ai_metadata.copy() if hasattr(blog_post, 'ai_metadata') and blog_post.ai_metadata else {}
            if output_json.get("faq"):
                ai_metadata["faq"] = output_json["faq"]
            if output_json.get("cta_block"):
                ai_metadata["cta_block"] = output_json["cta_block"]
            if output_json.get("disclaimer"):
                ai_metadata["disclaimer"] = output_json["disclaimer"]
            # Add change summary if provided
            if output_json.get("change_summary"):
                ai_metadata["last_revision_summary"] = output_json["change_summary"]
            
            update_data["ai_metadata"] = ai_metadata
            
            await BlogService.update(blog_post_id, user_id, **update_data)
            
            # Save generation record
            doc = generation.model_dump()
            doc["_id"] = generation.id
            doc["created_at"] = generation.created_at.isoformat()
            doc["tone"] = generation.tone.value if generation.tone else "professional"
            doc["content_length"] = generation.content_length.value if generation.content_length else "medium"
            doc["cta_preference"] = generation.cta_preference.value if generation.cta_preference else "appointment"
            
            await db[AIBlogService.COLLECTION].insert_one(doc)
            
            logger.info(f"AI revision completed: {generation.id} for blog: {blog_post_id}")
            
            return {
                "generation_id": generation.id,
                "blog_post_id": blog_post_id,
                "output": output_json,
                "processing_time_ms": processing_time,
                "status": "completed",
                "change_summary": output_json.get("change_summary", "")
            }
            
        except Exception as e:
            logger.error(f"AI revision failed: {e}")
            
            generation.status = "failed"
            generation.error_message = str(e)
            generation.processing_time_ms = int((time.time() - start_time) * 1000)
            
            doc = generation.model_dump()
            doc["_id"] = generation.id
            doc["created_at"] = generation.created_at.isoformat()
            doc["tone"] = generation.tone.value if generation.tone else "professional"
            doc["content_length"] = generation.content_length.value if generation.content_length else "medium"
            doc["cta_preference"] = generation.cta_preference.value if generation.cta_preference else "appointment"
            
            await db[AIBlogService.COLLECTION].insert_one(doc)
            
            raise
    
    @staticmethod
    def _parse_json_response(response: str) -> Optional[dict]:
        """Parse JSON from AI response, handling markdown code blocks"""
        try:
            # Try direct parse first
            return json.loads(response)
        except json.JSONDecodeError:
            pass
        
        # Try to extract JSON from markdown code block
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass
        
        # Try to find JSON object in response
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except json.JSONDecodeError:
                pass
        
        return None
    
    @staticmethod
    async def get_generation_history(
        user_id: Optional[str] = None,
        blog_post_id: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get AI generation history"""
        db = get_database()
        
        query: Dict[str, Any] = {}
        if user_id:
            query["user_id"] = user_id
        if blog_post_id:
            query["blog_post_id"] = blog_post_id
        
        cursor = db[AIBlogService.COLLECTION].find(query, {"_id": 0}).sort("created_at", -1).limit(limit)
        return await cursor.to_list(limit)
    
    @staticmethod
    async def get_generation_by_id(generation_id: str) -> Optional[Dict[str, Any]]:
        """Get single generation by ID"""
        db = get_database()
        return await db[AIBlogService.COLLECTION].find_one({"id": generation_id}, {"_id": 0})
