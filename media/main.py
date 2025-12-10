"""
FastAPI Media Service
Handles image uploads, storage in MinIO, thumbnail generation, and presigned URLs.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db, close_db
from app.storage import init_storage
from app.routes import media_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize and cleanup resources on startup/shutdown."""
    # Startup
    await init_db()
    init_storage()
    yield
    # Shutdown
    await close_db()


app = FastAPI(
    title="Social Media Media Service",
    description="Handles media uploads, processing, and storage",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "media"}


# Include routers
app.include_router(media_router, prefix="/api/media", tags=["media"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

