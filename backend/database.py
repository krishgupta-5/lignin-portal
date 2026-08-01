"""
Database layer with MongoDB (motor) + in-memory fallback.
If MongoDB is unavailable, the app still works using in-memory dicts.
"""
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URL, DATABASE_NAME

logger = logging.getLogger(__name__)

# MongoDB client (initialized on startup)
client: AsyncIOMotorClient | None = None
db = None
use_memory = False

# In-memory fallback storage
memory_store = {
    "users": [],
    "predictions": [],
    "reports": [],
}


async def connect_db():
    """Connect to MongoDB. Falls back to in-memory if unavailable."""
    global client, db, use_memory
    try:
        client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=3000)
        # Test connection
        await client.admin.command("ping")
        db = client[DATABASE_NAME]
        # Create indexes
        await db.users.create_index("email", unique=True)
        await db.predictions.create_index("user_id")
        await db.reports.create_index("user_id")
        logger.info(f"Connected to MongoDB: {DATABASE_NAME}")
        use_memory = False
    except Exception as e:
        logger.warning(f"MongoDB unavailable ({e}). Using in-memory storage.")
        use_memory = True
        client = None
        db = None


async def disconnect_db():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        logger.info("Disconnected from MongoDB")


def get_db():
    """Return the database instance (or None if using memory)."""
    return db


def is_memory_mode():
    """Check if running in memory-only mode."""
    return use_memory
