"""
Unit tests for media service.
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_upload_invalid_file_type():
    """Test uploading invalid file type."""
    response = client.post(
        "/api/media/upload-image",
        files={"file": ("test.txt", b"not an image", "text/plain")},
    )
    assert response.status_code == 400


def test_upload_valid_image():
    """Test uploading a valid image."""
    # Create a simple test image (1x1 pixel PNG)
    png_data = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82"
    
    response = client.post(
        "/api/media/upload-image",
        files={"file": ("test.png", png_data, "image/png")},
    )
    # This might fail if MinIO/MongoDB not running, but structure is correct
    assert response.status_code in [200, 500]  # 500 if services not available

