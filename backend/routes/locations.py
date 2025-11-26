from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import base64
import os

from models import Location, LocationCreate, LocationUpdate
from database import get_database, generate_unique_number, add_timestamps

router = APIRouter(prefix="/locations", tags=["Locations"])

# Ensure locations images directory exists
LOCATIONS_IMAGES_DIR = "uploaded_assets"
if not os.path.exists(LOCATIONS_IMAGES_DIR):
    os.makedirs(LOCATIONS_IMAGES_DIR)


@router.get("", response_model=List[Location])
async def list_locations(
    type: Optional[str] = None,
    limit: Optional[int] = Query(100, le=1000),
    skip: Optional[int] = 0
):
    db = await get_database()
    
    # Build filter
    filter_dict = {}
    if type:
        filter_dict["type"] = type
    
    # Query database
    cursor = db.locations.find(filter_dict).skip(skip).limit(limit).sort("createdAt", -1)
    locations = await cursor.to_list(length=limit)
    
    # Add asset and work order counts to each location using real-time aggregation
    for loc in locations:
        location_id = str(loc["_id"])
        loc["assetCount"] = await db.assets.count_documents({"location": location_id})
        loc["activeWOs"] = await db.work_orders.count_documents({
            "location": location_id,
            "status": {"$in": ["open", "in-progress"]}
        })
        loc["_id"] = str(loc["_id"])
    
    return locations

@router.get("/{location_id}", response_model=Location)
async def get_location(location_id: str):
    db = await get_database()
    
    if not ObjectId.is_valid(location_id):
        raise HTTPException(status_code=400, detail="Invalid location ID")
    
    loc = await db.locations.find_one({"_id": ObjectId(location_id)})
    
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # Add asset and work order counts using real-time aggregation
    loc["assetCount"] = await db.assets.count_documents({"location": location_id})
    loc["activeWOs"] = await db.work_orders.count_documents({
        "location": location_id,
        "status": {"$in": ["open", "in-progress"]}
    })
    
    loc["_id"] = str(loc["_id"])
    return loc

@router.post("", response_model=Location)
async def create_location(location: LocationCreate):
    db = await get_database()
    
    # Generate unique location number
    loc_number = await generate_unique_number("locations", "LOC")
    
    # Create location document
    loc_dict = location.dict()
    loc_dict["locationId"] = loc_number
    loc_dict = add_timestamps(loc_dict)
    
    # Insert into database
    result = await db.locations.insert_one(loc_dict)
    loc_dict["_id"] = str(result.inserted_id)
    
    return loc_dict

@router.put("/{location_id}", response_model=Location)
async def update_location(location_id: str, location: LocationUpdate):
    db = await get_database()
    
    if not ObjectId.is_valid(location_id):
        raise HTTPException(status_code=400, detail="Invalid location ID")
    
    # Build update dict (exclude None values)
    update_dict = {k: v for k, v in location.dict().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_dict = add_timestamps(update_dict, is_update=True)
    
    # Update database
    result = await db.locations.find_one_and_update(
        {"_id": ObjectId(location_id)},
        {"$set": update_dict},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # Add asset and work order counts using real-time aggregation
    result["assetCount"] = await db.assets.count_documents({"location": location_id})
    result["activeWOs"] = await db.work_orders.count_documents({
        "location": location_id,
        "status": {"$in": ["open", "in-progress"]}
    })
    
    result["_id"] = str(result["_id"])
    return result

@router.delete("/{location_id}")
async def delete_location(location_id: str):
    db = await get_database()
    
    if not ObjectId.is_valid(location_id):
        raise HTTPException(status_code=400, detail="Invalid location ID")
    
    result = await db.locations.delete_one({"_id": ObjectId(location_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    
    return {"message": "Location deleted successfully"}

# New endpoint for image upload
@router.post("/{location_id}/image")
async def upload_location_image(location_id: str, file: UploadFile = File(...)):
    db = await get_database()
    
    if not ObjectId.is_valid(location_id):
        raise HTTPException(status_code=400, detail="Invalid location ID")
    
    # Check if location exists
    location = await db.locations.find_one({"_id": ObjectId(location_id)})
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # Save file to disk
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"location_{location_id}{file_extension}"
    file_path = os.path.join(LOCATIONS_IMAGES_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Update location with image URL
    image_url = f"/api/locations/{location_id}/image"
    result = await db.locations.find_one_and_update(
        {"_id": ObjectId(location_id)},
        {"$set": {"image": image_url, "updatedAt": datetime.utcnow()}},
        return_document=True
    )
    
    result["_id"] = str(result["_id"])
    return {"imageUrl": image_url, "location": result}

# New endpoint to serve location images
@router.get("/{location_id}/image")
async def get_location_image(location_id: str):
    if not ObjectId.is_valid(location_id):
        raise HTTPException(status_code=400, detail="Invalid location ID")
    
    # Try to find the file with any extension
    for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
        file_path = os.path.join(LOCATIONS_IMAGES_DIR, f"location_{location_id}{ext}")
        if os.path.exists(file_path):
            return FileResponse(file_path)
    
    # If still not found, return 404
    raise HTTPException(status_code=404, detail="Image not found")
