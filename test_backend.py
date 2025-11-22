#!/usr/bin/env python3
"""
Test script to verify backend API endpoints
"""

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.database import connect_to_mongo, close_mongo_connection
from backend.routes.work_orders import list_work_orders, create_work_order
from backend.models import WorkOrderCreate

async def test_backend():
    """Test backend functionality"""
    print("Testing CMMS MADAMPE MILLS Backend")
    print("=" * 40)
    
    try:
        # Test MongoDB connection
        print("1. Testing MongoDB connection...")
        await connect_to_mongo()
        print("   ✓ MongoDB connection successful")
        
        # Test work orders endpoint
        print("2. Testing work orders endpoint...")
        work_orders = await list_work_orders()
        print(f"   ✓ Retrieved {len(work_orders)} work orders")
        
        print("\nAll tests passed! Backend is working correctly.")
        return True
        
    except Exception as e:
        print(f"   ✗ Error: {e}")
        print("\nBackend test failed. Please check:")
        print("1. MongoDB is running")
        print("2. Backend server is started")
        print("3. Environment variables are set correctly")
        return False
        
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    result = asyncio.run(test_backend())
    sys.exit(0 if result else 1)