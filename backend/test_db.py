print("Starting test_db.py...")
from database import connect_to_firestore, get_database

try:
    print("Attempting to connect...")
    connect_to_firestore()
    db = get_database()
    print("Connection successful!")
    
    # Try a simple read
    print("Attempting to read collections...")
    collections = list(db.collections())
    print(f"Found {len(collections)} collections.")
    for col in collections:
        print(f" - {col.id}")

except Exception as e:
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()
