from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse
from typing import List, Optional
from datetime import datetime
import os
import uuid
from pathlib import Path

from models import Location, LocationCreate, LocationUpdate
from database import get_database, generate_unique_number, add_timestamps

router = APIRouter(prefix="/locations", tags=["Locations"])

# Ensure locations images directory exists
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
LOCATIONS_IMAGES_DIR = UPLOADS_DIR / "locations"
LOCATIONS_IMAGES_DIR.mkdir(exist_ok=True)


def _count_assets_for_location(db, location_id: str) -> int:
    try:
        return sum(1 for _ in db.collection("assets").where("location", "==", location_id).stream())
    except Exception:
        return 0


def _count_active_work_orders(db, location_id: str) -> int:
    try:
        active_statuses = {"open", "in-progress"}
        work_orders = db.collection("work_orders").where("location", "==", location_id).stream()
        return sum(1 for doc in work_orders if doc.to_dict().get("status") in active_statuses)
    except Exception:
        return 0


def _attach_location_counts(db, location_data: dict) -> dict:
    location_id = location_data.get("id") or location_data.get("_id")
    if not location_id:
        return location_data
    location_data["assetCount"] = _count_assets_for_location(db, location_id)
    location_data["activeWOs"] = _count_active_work_orders(db, location_id)
    return location_data


@router.get("", response_model=List[Location])
def list_locations(
    type: Optional[str] = None,
    limit: Optional[int] = Query(100, le=1000),
    skip: Optional[int] = 0
):
    try:
        db = get_database()
        
        docs = db.collection('locations').stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            data['_id'] = doc.id
            results.append(data)
        
        # Apply filters
        if type:
            results = [loc for loc in results if loc.get("type") == type]
            
        if skip:
            results = results[skip:]
            
        if limit:
            results = results[:limit]
            
        # Attach counts
        for location in results:
            try:
                _attach_location_counts(db, location)
            except Exception as e:
                # If there's an error attaching counts, just continue with default values
                location["assetCount"] = location.get("assetCount", 0)
                location["activeWOs"] = location.get("activeWOs", 0)
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list locations: {str(e)}")


@router.get("/{location_id}", response_model=Location)
def get_location(location_id: str):
    try:
        db = get_database()
        
        doc = db.collection("locations").document(location_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Location not found")
        
        data = doc.to_dict()
        data['id'] = doc.id
        data['_id'] = doc.id
        
        try:
            _attach_location_counts(db, data)
        except Exception as e:
            # If there's an error attaching counts, just continue with default values
            data["assetCount"] = data.get("assetCount", 0)
            data["activeWOs"] = data.get("activeWOs", 0)
        
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get location: {str(e)}")


@router.post("", response_model=Location)
def create_location(location: LocationCreate):
    try:
        db = get_database()
        
        loc_dict = location.dict()
        loc_dict["locationId"] = generate_unique_number("locations", "LOC")
        loc_dict = add_timestamps(loc_dict)
        update_time, doc_ref = db.collection('locations').add(loc_dict)
        loc_dict['id'] = doc_ref.id
        loc_dict['_id'] = doc_ref.id
        
        # Initialize assetCount and activeWOs to 0 for new locations
        loc_dict["assetCount"] = 0
        loc_dict["activeWOs"] = 0
        
        return loc_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create location: {str(e)}")


@router.put("/{location_id}", response_model=Location)
def update_location(location_id: str, location: LocationUpdate):
    try:
        db = get_database()
        
        location_ref = db.collection("locations").document(location_id)
        doc = location_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Location not found")
        
        update_dict = {k: v for k, v in location.dict().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_dict = add_timestamps(update_dict, is_update=True)
        
        location_ref.update(update_dict)
        
        # Get updated data
        updated_doc = location_ref.get()
        updated_data = updated_doc.to_dict()
        updated_data['id'] = updated_doc.id
        updated_data['_id'] = updated_doc.id
        
        try:
            _attach_location_counts(db, updated_data)
        except Exception as e:
            # If there's an error attaching counts, just continue with default values
            updated_data["assetCount"] = updated_data.get("assetCount", 0)
            updated_data["activeWOs"] = updated_data.get("activeWOs", 0)
        
        return updated_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update location: {str(e)}")


@router.delete("/{location_id}")
def delete_location(location_id: str):
    try:
        db = get_database()
        
        location_ref = db.collection("locations").document(location_id)
        if not location_ref.get().exists:
            raise HTTPException(status_code=404, detail="Location not found")
        
        location_ref.delete()
        return {"message": "Location deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete location: {str(e)}")


@router.post("/{location_id}/upload-image")
def upload_location_image(location_id: str, file: UploadFile = File(...)):
    try:
        db = get_database()
        
        location_ref = db.collection("locations").document(location_id)
        doc = location_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Location not found")
        
        # Save file to disk with unique filename
        file_extension = os.path.splitext(file.filename)[1] or ".jpg"
        unique_filename = f"{location_id}_{uuid.uuid4()}{file_extension}"
        file_path = LOCATIONS_IMAGES_DIR / unique_filename
        
        with open(file_path, "wb") as buffer:
            content = file.file.read()
            buffer.write(content)
        
        # Update location with image URL
        image_url = f"/uploads/locations/{unique_filename}"
        location_ref.update({"imageUrl": image_url, "updatedAt": datetime.utcnow()})
        
        # Get updated location data
        updated_doc = location_ref.get()
        updated_data = updated_doc.to_dict()
        updated_data['id'] = updated_doc.id
        updated_data['_id'] = updated_doc.id
        
        try:
            _attach_location_counts(db, updated_data)
        except Exception as e:
            # If there's an error attaching counts, just continue with default values
            updated_data["assetCount"] = updated_data.get("assetCount", 0)
            updated_data["activeWOs"] = updated_data.get("activeWOs", 0)
        
        return {"imageUrl": image_url, "location": updated_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload location image: {str(e)}")


# Generic endpoint for image upload (newly added)
@router.post("/upload")
def upload_image(file: UploadFile = File(...)):
    try:
        # Save file to disk with unique filename
        file_extension = os.path.splitext(file.filename)[1] or ".jpg"
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = LOCATIONS_IMAGES_DIR / unique_filename
        
        with open(file_path, "wb") as buffer:
            content = file.file.read()
            buffer.write(content)
        
        # Return the image URL
        image_url = f"/uploads/locations/{unique_filename}"
        return {"imageUrl": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")