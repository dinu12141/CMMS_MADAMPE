from fastapi import APIRouter, HTTPException, Request, UploadFile, File
from typing import List, Optional
from datetime import date, datetime
import json
import logging
import os
import uuid
from pathlib import Path

from models import Asset, AssetCreate, AssetUpdate
from database import get_database, generate_unique_number, add_timestamps

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assets", tags=["Assets"])

# Ensure assets images directory exists inside uploads
ASSETS_IMAGES_DIR = os.path.join("uploads", "assets")
if not os.path.exists(ASSETS_IMAGES_DIR):
    os.makedirs(ASSETS_IMAGES_DIR)

@router.get("", response_model=List[Asset])
async def list_assets(
    location: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: Optional[int] = 100,
):
    db = await get_database()
    
    # Build filter
    filter_dict = {}
    if location:
        filter_dict["location"] = location
    if status:
        filter_dict["status"] = status
    if category:
        filter_dict["category"] = category
    
    # Query database
    cursor = db.assets.find(filter_dict).limit(limit)
    assets = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string for JSON serialization
    for asset in assets:
        asset["_id"] = str(asset["_id"])
    
    return assets

@router.get("/{asset_id}", response_model=Asset)
async def get_asset(asset_id: str):
    db = await get_database()
    
    # Validate ObjectId format
    from bson import ObjectId
    if not ObjectId.is_valid(asset_id):
        raise HTTPException(status_code=400, detail="Invalid asset ID")
    
    asset = await db.assets.find_one({"_id": ObjectId(asset_id)})
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset["_id"] = str(asset["_id"])
    return asset

@router.post("", response_model=Asset)
async def create_asset(request: Request):
    try:
        # Check content type to determine how to parse the request
        content_type = request.headers.get('content-type', '').lower()
        logger.info(f"Content-Type: {content_type}")
        
        # Initialize variables
        name = None
        location = None
        asset_number = None
        category = None
        manufacturer = None
        model = None
        serial_number = None
        purchase_date = None
        install_date = None
        warranty_expiry = None
        criticality = None
        specs = {}
        image_file = None
        
        # Parse request data based on content type
        if 'multipart/form-data' in content_type:
            # Handle form data (with possible file upload)
            logger.info("Processing form data request")
            form_data = await request.form()
            
            # Extract all fields from form data
            name = form_data.get("name")
            location = form_data.get("location")
            asset_number = form_data.get("assetNumber")
            category = form_data.get("category")
            manufacturer = form_data.get("manufacturer")
            model = form_data.get("model")
            serial_number = form_data.get("serialNumber")
            purchase_date = form_data.get("purchaseDate")
            install_date = form_data.get("installDate")
            warranty_expiry = form_data.get("warrantyExpiry")
            criticality = form_data.get("criticality")
            specifications_str = form_data.get("specifications")
            image_file = form_data.get("image")
            
            # Parse dates
            if purchase_date and isinstance(purchase_date, str):
                try:
                    purchase_date = date.fromisoformat(purchase_date)
                except ValueError:
                    purchase_date = None
                    
            if install_date and isinstance(install_date, str):
                try:
                    install_date = date.fromisoformat(install_date)
                except ValueError:
                    install_date = None
                    
            if warranty_expiry and isinstance(warranty_expiry, str):
                try:
                    warranty_expiry = date.fromisoformat(warranty_expiry)
                except ValueError:
                    warranty_expiry = None
            
            # Parse specifications if provided
            if specifications_str:
                try:
                    specs = json.loads(specifications_str)
                except (json.JSONDecodeError, TypeError):
                    logger.warning("Invalid specifications format in form data")
        else:
            # Handle JSON data
            logger.info("Processing JSON request")
            body = await request.json()
            
            # Extract fields from JSON
            name = body.get("name")
            location = body.get("location")
            asset_number = body.get("assetNumber")
            category = body.get("category")
            manufacturer = body.get("manufacturer")
            model = body.get("model")
            serial_number = body.get("serialNumber")
            purchase_date = body.get("purchaseDate")
            install_date = body.get("installDate")
            warranty_expiry = body.get("warrantyExpiry")
            criticality = body.get("criticality")
            specs = body.get("specifications", {})
        
        # Validate required fields
        if not name or not location:
            raise HTTPException(status_code=400, detail="Name and location are required")
        
        logger.info(f"Creating asset with name: {name}, location: {location}")
        db = await get_database()
        
        # Create asset document with default values for required fields
        asset_dict = {
            "name": name,
            "location": location,
            "assetNumber": asset_number,
            "category": category or "",
            "manufacturer": manufacturer or "",
            "model": model or "",
            "serialNumber": serial_number or "",
            "purchaseDate": purchase_date,
            "installDate": install_date,
            "warrantyExpiry": warranty_expiry,
            "criticality": criticality or "medium",
            "specifications": specs or {}
        }
        
        logger.info(f"Asset dict before image handling: {asset_dict}")
        
        # Handle image upload (only for form data requests)
        image_url = None
        if image_file and hasattr(image_file, 'filename') and image_file.filename:
            try:
                logger.info(f"Processing image: {image_file.filename}")
                # Generate unique filename
                file_extension = os.path.splitext(image_file.filename)[1]
                unique_filename = f"{uuid.uuid4()}{file_extension}"
                file_path = os.path.join(ASSETS_IMAGES_DIR, unique_filename)
                logger.info(f"Saving image to: {file_path}")
                
                # Save the file
                content = await image_file.read()
                logger.info(f"Image content length: {len(content)}")
                with open(file_path, "wb") as buffer:
                    buffer.write(content)
                
                # Store the image URL (relative path for static file serving)
                image_url = f"/uploads/assets/{unique_filename}"
                asset_dict["imageUrl"] = image_url
                logger.info(f"Image saved successfully: {image_url}")
            except Exception as e:
                logger.error(f"Error saving image: {e}", exc_info=True)
                # Don't fail the entire asset creation if image upload fails
                pass
        else:
            logger.info("No image to process")
        
        # Set default dates if not provided (convert to datetime for MongoDB)
        today = datetime.utcnow().date()
        asset_dict["purchaseDate"] = asset_dict.get("purchaseDate") or today
        asset_dict["installDate"] = asset_dict.get("installDate") or today
        asset_dict["warrantyExpiry"] = asset_dict.get("warrantyExpiry") or today
        
        # Convert date objects to datetime for MongoDB storage
        if isinstance(asset_dict["purchaseDate"], date) and not isinstance(asset_dict["purchaseDate"], datetime):
            asset_dict["purchaseDate"] = datetime.combine(asset_dict["purchaseDate"], datetime.min.time())
        if isinstance(asset_dict["installDate"], date) and not isinstance(asset_dict["installDate"], datetime):
            asset_dict["installDate"] = datetime.combine(asset_dict["installDate"], datetime.min.time())
        if isinstance(asset_dict["warrantyExpiry"], date) and not isinstance(asset_dict["warrantyExpiry"], datetime):
            asset_dict["warrantyExpiry"] = datetime.combine(asset_dict["warrantyExpiry"], datetime.min.time())
        
        # Set default criticality if not provided
        asset_dict["criticality"] = asset_dict.get("criticality") or "medium"
        
        # Set default specifications if not provided
        asset_dict["specifications"] = asset_dict.get("specifications") or {}
        
        # Use provided asset number or generate a unique one
        if asset_dict.get("assetNumber") and str(asset_dict["assetNumber"]).strip():
            # Check if the provided asset number is already in use
            existing_asset = await db.assets.find_one({"assetNumber": str(asset_dict["assetNumber"]).strip()})
            if existing_asset:
                raise HTTPException(status_code=400, detail="Asset number already exists")
            asset_dict["assetNumber"] = str(asset_dict["assetNumber"]).strip()
        else:
            # Generate unique asset number
            asset_dict["assetNumber"] = await generate_unique_number("assets", "ASSET")
        
        asset_dict["status"] = "operational"
        asset_dict["condition"] = "good"
        asset_dict["maintenanceCost"] = 0
        asset_dict["downtime"] = 0
        asset_dict = add_timestamps(asset_dict)
        
        logger.info(f"Final asset dict: {asset_dict}")
        
        # Insert into database
        result = await db.assets.insert_one(asset_dict)
        asset_dict["_id"] = str(result.inserted_id)
        
        # Convert date objects to strings for response
        date_fields = ["purchaseDate", "installDate", "warrantyExpiry", "lastMaintenance", "nextMaintenance"]
        for field in date_fields:
            if field in asset_dict and isinstance(asset_dict[field], datetime):
                # Convert datetime back to date string for response
                asset_dict[field] = asset_dict[field].date().isoformat()
        
        logger.info(f"Asset created successfully with ID: {asset_dict['_id']}")
        return asset_dict
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error creating asset: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{asset_id}", response_model=Asset)
async def update_asset(asset_id: str, asset: AssetUpdate):
    db = await get_database()
    
    # Validate ObjectId format
    from bson import ObjectId
    if not ObjectId.is_valid(asset_id):
        raise HTTPException(status_code=400, detail="Invalid asset ID")
    
    # Build update dict (exclude None values)
    update_dict = {k: v for k, v in asset.dict().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Handle date conversion for update
    date_fields = ["purchaseDate", "installDate", "warrantyExpiry", "lastMaintenance", "nextMaintenance"]
    for field in date_fields:
        if field in update_dict and isinstance(update_dict[field], date) and not isinstance(update_dict[field], datetime):
            update_dict[field] = datetime.combine(update_dict[field], datetime.min.time())
    
    update_dict = add_timestamps(update_dict, is_update=True)
    
    # Update database
    result = await db.assets.find_one_and_update(
        {"_id": ObjectId(asset_id)},
        {"$set": update_dict},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    result["_id"] = str(result["_id"])
    return result

@router.delete("/{asset_id}")
async def delete_asset(asset_id: str):
    db = await get_database()
    
    # Validate ObjectId format
    from bson import ObjectId
    if not ObjectId.is_valid(asset_id):
        raise HTTPException(status_code=400, detail="Invalid asset ID")
    
    result = await db.assets.delete_one({"_id": ObjectId(asset_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return {"message": "Asset deleted successfully"}

# Image upload endpoint for existing assets
@router.post("/{asset_id}/image")
async def upload_asset_image(asset_id: str, file: UploadFile = File(...)):
    db = await get_database()
    
    # Validate ObjectId format
    from bson import ObjectId
    if not ObjectId.is_valid(asset_id):
        raise HTTPException(status_code=400, detail="Invalid asset ID")
    
    # Check if asset exists
    asset = await db.assets.find_one({"_id": ObjectId(asset_id)})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Save file to disk with correct extension
    file_extension = os.path.splitext(file.filename)[1].lower()
    # Ensure we have a valid extension
    if not file_extension:
        file_extension = ".jpg"  # default to jpg
    
    file_name = f"{asset_id}_{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(ASSETS_IMAGES_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Update asset with image URL (relative path for static file serving)
    image_url = f"/uploads/assets/{file_name}"
    result = await db.assets.find_one_and_update(
        {"_id": ObjectId(asset_id)},
        {"$set": {"imageUrl": image_url, "updatedAt": datetime.utcnow()}},
        return_document=True
    )
    
    result["_id"] = str(result["_id"])
    return {"imageUrl": image_url, "asset": result}