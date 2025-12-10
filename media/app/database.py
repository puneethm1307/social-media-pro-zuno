"""
MongoDB database connection and initialization using Motor (async).
"""

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# Global database client
client: AsyncIOMotorClient = None
db = None


async def init_db():
    """Initialize MongoDB connection."""
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DB_NAME]
    # Test connection
    await client.admin.command("ping")
    print("✓ Connected to MongoDB")


async def close_db():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("✓ Closed MongoDB connection")


def get_db():
    """Get database instance."""
    return db

