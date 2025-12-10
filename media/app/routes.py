"""
API routes for media upload and retrieval.
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import get_db
from app.storage import get_s3_client
from app.models import MediaMetadata
from app.utils import validate_file, get_image_dimensions, create_thumbnail, convert_to_webp

media_router = APIRouter()


async def process_image_background(file_key: str, file_content: bytes):
    """Background task to generate thumbnail and WebP conversion."""
    try:
        s3_client = get_s3_client()
        
        # Generate thumbnail
        thumbnail_content = create_thumbnail(file_content)
        thumbnail_key = f"thumbnails/{file_key.split('/')[-1].split('.')[0]}_thumb.jpg"
        s3_client.put_object(
            Bucket=settings.MINIO_BUCKET_NAME,
            Key=thumbnail_key,
            Body=thumbnail_content,
            ContentType="image/jpeg",
        )
        
        # Generate WebP
        webp_content = convert_to_webp(file_content)
        webp_key = f"webp/{file_key.split('/')[-1].split('.')[0]}.webp"
        s3_client.put_object(
            Bucket=settings.MINIO_BUCKET_NAME,
            Key=webp_key,
            Body=webp_content,
            ContentType="image/webp",
        )
        
        # Update metadata in MongoDB
        db = get_db()
        await db.media.update_one(
            {"file_key": file_key},
            {"$set": {"thumbnail_key": thumbnail_key, "webp_key": webp_key}},
        )
        
    except Exception as e:
        print(f"Error processing image in background: {e}")


@media_router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    uploaded_by: str = None,
):
    """
    Upload an image file.
    Validates file type and size, stores in MinIO, and queues background processing.
    """
    # Validate file
    validate_file(file)
    
    # Read file content
    file_content = await file.read()
    
    # Check file size
    if len(file_content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE} bytes",
        )
    
    # Generate unique file key
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    file_key = f"images/{uuid.uuid4()}.{file_extension}"
    
    # Upload to MinIO
    s3_client = get_s3_client()
    try:
        s3_client.put_object(
            Bucket=settings.MINIO_BUCKET_NAME,
            Key=file_key,
            Body=file_content,
            ContentType=file.content_type,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")
    
    # Get image dimensions
    try:
        width, height = await get_image_dimensions(file_content)
    except Exception:
        width, height = None, None
    
    # Store metadata in MongoDB
    db = get_db()
    metadata = MediaMetadata(
        file_key=file_key,
        original_filename=file.filename,
        content_type=file.content_type,
        file_size=len(file_content),
        width=width,
        height=height,
        uploaded_by=uploaded_by,
    )
    
    await db.media.insert_one(metadata.model_dump())
    
    # Queue background processing
    background_tasks.add_task(process_image_background, file_key, file_content)
    
    # Generate presigned URL for the uploaded file
    presigned_url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.MINIO_BUCKET_NAME, "Key": file_key},
        ExpiresIn=settings.PRESIGNED_URL_EXPIRY,
    )
    
    return JSONResponse(
        content={
            "file_key": file_key,
            "presigned_url": presigned_url,
            "public_url": f"/api/media/file/{file_key}",
            "metadata": {
                "original_filename": file.filename,
                "content_type": file.content_type,
                "file_size": len(file_content),
                "width": width,
                "height": height,
            },
        }
    )


@media_router.get("/file/{file_key:path}")
async def get_file(file_key: str):
    """Get presigned URL for a file."""
    s3_client = get_s3_client()
    
    try:
        presigned_url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.MINIO_BUCKET_NAME, "Key": file_key},
            ExpiresIn=settings.PRESIGNED_URL_EXPIRY,
        )
        return JSONResponse(content={"presigned_url": presigned_url, "file_key": file_key})
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"File not found: {str(e)}")


@media_router.get("/metadata/{file_key:path}")
async def get_metadata(file_key: str):
    """Get metadata for a file."""
    db = get_db()
    metadata = await db.media.find_one({"file_key": file_key})
    
    if not metadata:
        raise HTTPException(status_code=404, detail="File metadata not found")
    
    # Remove MongoDB _id
    metadata.pop("_id", None)
    
    return JSONResponse(content=metadata)

