from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os
from datetime import datetime

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_instance = Database()

async def get_database() -> AsyncIOMotorDatabase:
    return db_instance.db

async def connect_to_mongo():
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'cmms')
    db_instance.client = AsyncIOMotorClient(mongo_url)
    db_instance.db = db_instance.client[db_name]
    print(f"Connected to MongoDB: {db_name}")

async def close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()
        print("Closed MongoDB connection")

# Helper function to generate unique numbers
async def generate_unique_number(collection_name: str, prefix: str) -> str:
    """
    Generate unique sequential numbers like WO-001, ASSET-001, etc.
    """
    db = db_instance.db
    
    # Get the counter collection
    counter = await db.counters.find_one_and_update(
        {"_id": collection_name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    
    seq_number = counter.get("seq", 1)
    return f"{prefix}-{seq_number:03d}"

# Helper to update timestamps
def add_timestamps(doc: dict, is_update: bool = False) -> dict:
    now = datetime.utcnow()
    if not is_update:
        doc['createdAt'] = now
    doc['updatedAt'] = now
    return doc
