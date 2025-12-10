# Media Service

FastAPI service for handling image uploads, storage, and processing.

## Features

- Image upload with validation (type, size)
- Storage in MinIO (S3-compatible)
- Thumbnail generation
- WebP conversion
- Presigned URLs for secure access
- Background processing for heavy tasks

## Setup

### Using Virtual Environment (Recommended)

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Using Docker

```bash
docker build -t social-media-media .
docker run -p 8000:8000 --env-file .env social-media-media
```

## Running

### Local Development

```bash
# Activate virtual environment first
source venv/bin/activate

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Environment Variables

See `.env.example` for required environment variables.

## API Endpoints

- `GET /health` - Health check
- `POST /api/media/upload-image` - Upload an image
- `GET /api/media/file/{file_key}` - Get presigned URL for a file
- `GET /api/media/metadata/{file_key}` - Get file metadata

## Testing

```bash
pytest
```

