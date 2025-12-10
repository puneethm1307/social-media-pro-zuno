"""
Database models for media metadata.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class MediaMetadata(BaseModel):
    """Media file metadata stored in MongoDB."""
    
    file_key: str  # S3 object key
    original_filename: str
    content_type: str
    file_size: int
    width: Optional[int] = None
    height: Optional[int] = None
    thumbnail_key: Optional[str] = None
    webp_key: Optional[str] = None
    uploaded_by: Optional[str] = None  # User ID
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "file_key": "images/abc123.jpg",
                "original_filename": "photo.jpg",
                "content_type": "image/jpeg",
                "file_size": 1024000,
                "width": 1920,
                "height": 1080,
                "thumbnail_key": "thumbnails/abc123_thumb.jpg",
                "webp_key": "webp/abc123.webp",
                "uploaded_by": "user123",
                "uploaded_at": "2024-01-01T00:00:00Z",
            }
        }

