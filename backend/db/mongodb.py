from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import settings
import logging

logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

mongodb = MongoDB()

async def connect_to_mongo():
    """Connect to MongoDB"""
    logger.info("Connecting to MongoDB...")
    mongodb.client = AsyncIOMotorClient(settings.MONGO_URL)
    mongodb.db = mongodb.client[settings.DB_NAME]
    logger.info(f"Connected to MongoDB database: {settings.DB_NAME}")

async def close_mongo_connection():
    """Close MongoDB connection"""
    logger.info("Closing MongoDB connection...")
    if mongodb.client:
        mongodb.client.close()
    logger.info("MongoDB connection closed")

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return mongodb.db
