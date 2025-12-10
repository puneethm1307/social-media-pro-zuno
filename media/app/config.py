"""
Configuration settings for the media service.
Loads from environment variables with sensible defaults.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings."""
    
    # MongoDB
    MONGODB_URI: str = "mongodb://admin:admin123@localhost:27017/socialmedia?authSource=admin"
    MONGODB_DB_NAME: str = "socialmedia"
    
    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    
    # MinIO / S3
    MINIO_ENDPOINT: str = "localhost"
    MINIO_PORT: int = 9000
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin123"
    MINIO_USE_SSL: bool = False
    MINIO_BUCKET_NAME: str = "media"
    
    # Upload settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_CONTENT_TYPES: List[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    ]
    
    # Presigned URL settings
    PRESIGNED_URL_EXPIRY: int = 3600  # 1 hour
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # Thumbnail settings
    THUMBNAIL_SIZE: tuple = (400, 400)
    WEBP_QUALITY: int = 85
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

