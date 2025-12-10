"""
Utility functions for image processing and validation.
"""

import magic
from PIL import Image, ImageOps
import io
from typing import Tuple, Optional
from fastapi import UploadFile, HTTPException
from app.config import settings


def validate_file(file: UploadFile) -> None:
    """Validate uploaded file type and size."""
    # Check content type
    if file.content_type not in settings.ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} not allowed. Allowed types: {settings.ALLOWED_CONTENT_TYPES}",
        )
    
    # Note: File size validation should be done by reading content
    # For now, we'll check after reading


async def get_image_dimensions(file_content: bytes) -> Tuple[int, int]:
    """Get image dimensions from file content."""
    try:
        img = Image.open(io.BytesIO(file_content))
        return img.size  # Returns (width, height)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")


def create_thumbnail(file_content: bytes, size: Tuple[int, int] = None) -> bytes:
    """Create thumbnail from image content."""
    if size is None:
        size = settings.THUMBNAIL_SIZE
    
    img = Image.open(io.BytesIO(file_content))
    
    # Auto-orient based on EXIF
    try:
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass  # No EXIF data
    
    # Convert to RGB if necessary (for JPEG)
    if img.mode in ("RGBA", "P"):
        background = Image.new("RGB", img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = background
    
    # Create thumbnail
    img.thumbnail(size, Image.Resampling.LANCZOS)
    
    # Save to bytes
    output = io.BytesIO()
    img.save(output, format="JPEG", quality=85, optimize=True)
    return output.getvalue()


def convert_to_webp(file_content: bytes, quality: int = None) -> bytes:
    """Convert image to WebP format."""
    if quality is None:
        quality = settings.WEBP_QUALITY
    
    img = Image.open(io.BytesIO(file_content))
    
    # Auto-orient
    try:
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass
    
    # Convert to RGB if necessary
    if img.mode in ("RGBA", "P"):
        background = Image.new("RGB", img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = background
    
    # Save as WebP
    output = io.BytesIO()
    img.save(output, format="WEBP", quality=quality, method=6)
    return output.getvalue()

