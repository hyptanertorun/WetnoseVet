from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional
from datetime import datetime, timezone
from middleware.auth import get_current_active_user
from middleware.rbac import require_admin_manager_editor, require_admin_or_manager
from services.audit_service import AuditService
from PIL import Image
import io
import uuid
import os
import re

router = APIRouter(prefix="/admin/uploads", tags=["Uploads"])

# Configuration
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]
MAX_DIMENSION = 2048
UPLOAD_DIR = "/app/frontend/public/uploads"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal and special characters."""
    # Remove path components
    filename = os.path.basename(filename)
    # Remove special characters except alphanumeric, dash, underscore, dot
    name, ext = os.path.splitext(filename)
    name = re.sub(r'[^a-zA-Z0-9_-]', '', name)
    return f"{name}{ext.lower()}"

def strip_exif(image: Image.Image) -> Image.Image:
    """Strip EXIF data from image."""
    data = list(image.getdata())
    image_no_exif = Image.new(image.mode, image.size)
    image_no_exif.putdata(data)
    return image_no_exif

def resize_image(image: Image.Image, max_size: int = MAX_DIMENSION) -> Image.Image:
    """Resize image if larger than max_size while maintaining aspect ratio."""
    width, height = image.size
    
    if width <= max_size and height <= max_size:
        return image
    
    if width > height:
        new_width = max_size
        new_height = int(height * (max_size / width))
    else:
        new_height = max_size
        new_width = int(width * (max_size / height))
    
    return image.resize((new_width, new_height), Image.Resampling.LANCZOS)

@router.post("/images")
async def upload_image(
    file: UploadFile = File(...),
    context: str = Form("general"),
    current_user = Depends(require_admin_manager_editor)
):
    """
    Upload and process an image.
    
    - Validates file type and size
    - Strips EXIF data
    - Resizes if larger than 2048px
    - Converts to optimized format
    - Returns URL and dimensions
    """
    # Validate file type
    content_type = file.content_type
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Desteklenmeyen dosya türü: {content_type}. Kabul edilen türler: jpg, png, webp"
        )
    
    # Validate extension
    filename = file.filename or "image.jpg"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Desteklenmeyen dosya uzantısı: {ext}"
        )
    
    # Read file content
    content = await file.read()
    
    # Validate file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Dosya boyutu çok büyük. Maksimum: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    try:
        # Open image
        image = Image.open(io.BytesIO(content))
        
        # Convert RGBA to RGB if necessary (for JPEG)
        if image.mode == 'RGBA' and ext in ['.jpg', '.jpeg']:
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[3])
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Strip EXIF
        image = strip_exif(image)
        
        # Resize if needed
        original_size = image.size
        image = resize_image(image, MAX_DIMENSION)
        final_size = image.size
        
        # Generate unique filename
        unique_id = str(uuid.uuid4())[:8]
        timestamp = datetime.now().strftime("%Y%m%d")
        safe_name = sanitize_filename(filename)
        new_filename = f"{timestamp}_{unique_id}_{safe_name}"
        
        # Determine output format
        if ext == '.webp':
            output_format = 'WEBP'
            output_ext = '.webp'
        elif ext in ['.jpg', '.jpeg']:
            output_format = 'JPEG'
            output_ext = '.jpg'
        else:
            output_format = 'PNG'
            output_ext = '.png'
        
        # Update filename with correct extension
        new_filename = os.path.splitext(new_filename)[0] + output_ext
        
        # Create context subdirectory
        context_dir = os.path.join(UPLOAD_DIR, context)
        os.makedirs(context_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(context_dir, new_filename)
        
        # Save with optimization
        save_kwargs = {}
        if output_format == 'JPEG':
            save_kwargs = {'quality': 85, 'optimize': True}
        elif output_format == 'WEBP':
            save_kwargs = {'quality': 85, 'optimize': True}
        elif output_format == 'PNG':
            save_kwargs = {'optimize': True}
        
        image.save(file_path, output_format, **save_kwargs)
        
        # Get final file size
        final_bytes = os.path.getsize(file_path)
        
        # Generate URL
        url = f"/uploads/{context}/{new_filename}"
        
        # Audit log
        await AuditService.log(
            entity_type="image",
            action="upload",
            entity_id=new_filename,
            actor_user_id=current_user.id,
            actor_email=current_user.email,
            metadata={
                "context": context,
                "original_size": original_size,
                "final_size": final_size,
                "original_bytes": len(content),
                "final_bytes": final_bytes
            }
        )
        
        return {
            "url": url,
            "width": final_size[0],
            "height": final_size[1],
            "bytes": final_bytes,
            "mime": f"image/{output_format.lower()}",
            "filename": new_filename
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Görsel işlenirken hata oluştu: {str(e)}"
        )

@router.delete("/images/{filename}")
async def delete_image(
    filename: str,
    context: str = "general",
    current_user = Depends(require_admin_or_manager)
):
    """Delete an uploaded image."""
    # Sanitize to prevent path traversal
    safe_filename = sanitize_filename(filename)
    file_path = os.path.join(UPLOAD_DIR, context, safe_filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Dosya bulunamadı")
    
    try:
        os.remove(file_path)
        
        # Audit log
        await AuditService.log(
            entity_type="image",
            action="delete",
            entity_id=safe_filename,
            actor_user_id=current_user.id,
            actor_email=current_user.email,
            metadata={"context": context}
        )
        
        return {"message": "Dosya silindi"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Dosya silinirken hata oluştu: {str(e)}"
        )
