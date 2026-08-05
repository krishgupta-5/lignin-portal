"""
Centralized MongoDB database connection layer using Motor (async MongoDB driver).
All data is stored directly in MongoDB Atlas.
"""
import logging
import certifi
# pyrefly: ignore [missing-import]
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URL, DATABASE_NAME

logger = logging.getLogger(__name__)

# MongoDB client and database instance
client: AsyncIOMotorClient | None = None
db = None


async def connect_db():
    """Connect directly to MongoDB and initialize collections/indexes."""
    global client, db
    try:
        client = AsyncIOMotorClient(
            MONGODB_URL,
            serverSelectionTimeoutMS=10000,
            tlsCAFile=certifi.where(),
        )
        # Verify connection with admin ping
        await client.admin.command("ping")
        db = client[DATABASE_NAME]
        
        # Ensure collections & indexes
        await db.users.create_index("email", unique=True)
        await db.predictions.create_index("user_id")
        await db.predictions.create_index("created_at")
        await db.reports.create_index("user_id")
        await db.reports.create_index("created_at")
        
        logger.info(f"Connected to centralized MongoDB database: {DATABASE_NAME}")
        return db
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB at {MONGODB_URL}: {e}")
        raise e


async def ensure_db():
    """Ensure database is connected, reconnecting if needed."""
    global db
    if db is None:
        await connect_db()
    return db


async def disconnect_db():
    """Close MongoDB connection gracefully."""
    global client, db
    if client:
        client.close()
        client = None
        db = None
        logger.info("Closed connection to MongoDB.")


def get_db():
    """Return the active MongoDB database instance."""
    if db is None:
        raise RuntimeError("Database not initialized. Please ensure MongoDB is connected.")
    return db
