import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.database import connect_to_mongo, get_database

async def test_database():
    try:
        print("Connecting to MongoDB...")
        await connect_to_mongo()
        print("Connected successfully!")
        
        db = await get_database()
        print(f"Database name: {db.name}")
        
        # Try to access the locations collection
        locations_collection = db.locations
        print("Accessing locations collection...")
        
        # Try to count documents
        count = await locations_collection.count_documents({})
        print(f"Number of locations: {count}")
        
        # Try to insert a test document
        test_doc = {
            "name": "Test Location",
            "type": "building",
            "address": "123 Test St",
            "city": "Test City",
            "state": "TS",
            "zipCode": "12345",
            "coordinates": {"lat": 0.0, "lng": 0.0},
            "size": 10000,
            "floors": 2
        }
        
        result = await locations_collection.insert_one(test_doc)
        print(f"Inserted test document with ID: {result.inserted_id}")
        
        # Try to find the document
        found_doc = await locations_collection.find_one({"_id": result.inserted_id})
        print(f"Found document: {found_doc}")
        
        # Clean up - delete the test document
        await locations_collection.delete_one({"_id": result.inserted_id})
        print("Cleaned up test document")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_database())