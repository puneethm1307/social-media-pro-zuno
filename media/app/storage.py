"""
MinIO/S3 storage client initialization and bucket setup.
"""

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from app.config import settings

s3_client = None


def init_storage():
    """Initialize MinIO/S3 client and ensure bucket exists."""
    global s3_client
    
    endpoint_url = f"{'https' if settings.MINIO_USE_SSL else 'http'}://{settings.MINIO_ENDPOINT}:{settings.MINIO_PORT}"
    
    s3_client = boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",  # MinIO doesn't care, but boto3 requires it
    )
    
    # Create bucket if it doesn't exist
    try:
        s3_client.head_bucket(Bucket=settings.MINIO_BUCKET_NAME)
        print(f"✓ Bucket '{settings.MINIO_BUCKET_NAME}' exists")
    except ClientError:
        try:
            s3_client.create_bucket(Bucket=settings.MINIO_BUCKET_NAME)
            print(f"✓ Created bucket '{settings.MINIO_BUCKET_NAME}'")
        except ClientError as e:
            print(f"✗ Failed to create bucket: {e}")
            raise
    
    return s3_client


def get_s3_client():
    """Get S3 client instance."""
    return s3_client

