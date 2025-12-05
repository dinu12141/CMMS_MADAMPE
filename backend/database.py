import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

class Database:
    db = None

db_instance = Database()

def connect_to_firestore():
    """
    Initializes the Firestore client.
    """
    if db_instance.db is None:
        try:
            # Get the path to the service account key from .env
            cred_path = os.environ.get('FIREBASE_CREDENTIALS_PATH', 'serviceAccountKey.json')
            
            # Check if app is already initialized to avoid errors during reload
            if not firebase_admin._apps:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
            
            db_instance.db = firestore.client()
            print("Connected to Firebase Firestore!")
            
        except Exception as e:
            print(f"Error connecting to Firebase: {e}")
            raise e

def get_database():
    """
    Returns the Firestore client instance. Connects if not already connected.
    """
    if db_instance.db is None:
        connect_to_firestore()
    return db_instance.db

def close_firestore_connection():
    """
    Placeholder for closing connection. 
    Firebase Admin SDK handles this automatically, but keeping for compatibility.
    """
    pass

# Helper to generate unique IDs (Simple version for Firestore)
def generate_unique_number(collection_name: str, prefix: str):
    import time
    # Using timestamp to ensure uniqueness in this simple implementation
    return f"{prefix}-{int(time.time())}"

def add_timestamps(data: dict, is_update: bool = False):
    """
    Adds createdAt and updatedAt timestamps to the data.
    """
    now = datetime.utcnow()
    if not is_update:
        data['createdAt'] = now
    data['updatedAt'] = now
    return data

def doc_with_id(doc):
    """
    Helper to merge the document ID into the document data.
    Useful for converting Firestore snapshots to dicts with ID.
    """
    if not doc.exists:
        return None
    data = doc.to_dict()
    data['id'] = doc.id
    data['_id'] = doc.id  # Maintain compatibility with frontend expecting _id
    return data