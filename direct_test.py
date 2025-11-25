import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.models import AssetCreate
from backend.routes.assets import create_asset

async def test_asset_creation():
    # Create a simple asset
    asset_data = AssetCreate(
        name="Test Asset",
        location="Test Location"
    )
    
    try:
        result = await create_asset(asset_data)
        print("Asset created successfully:", result)
    except Exception as e:
        print("Error creating asset:", str(e))
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_asset_creation())