from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from typing import List, Optional
from datetime import datetime, date
from bson import ObjectId
import os
import uuid
from pathlib import Path
import json
import logging

from models import Asset, AssetCreate, AssetUpdate
from database import get_database, generate_unique_number, add_timestamps

# Set up logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

router = APIRouter(prefix="/assets", tags=["Assets"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploaded_assets")
UPLOAD_DIR.mkdir(exist_ok=True)

# Helper function to update location asset count
async def update_location_asset_count(db, location_id):
    if location_id:
        asset_count = await db.assets.count_documents({"location": location_id})
        await db.locations.update_one(
            {"_id": ObjectId(location_id)},
            {"$set": {"assetCount": asset_count}}
        )

@router.get("", response_model=List[Asset])
async def list_assets(
    category: Optional[str] = None,
    status: Optional[str] = None,
    criticality: Optional[str] = None,
    location: Optional[str] = None,
    limit: Optional[int] = Query(100, le=1000),
    skip: Optional[int] = 0
):
    db = await get_database()
    
    # Build filter
    filter_dict = {}
    if category:
        filter_dict["category"] = category
    if status:
        filter_dict["status"] = status
    if criticality:
        filter_dict["criticality"] = criticality
    if location:
        filter_dict["location"] = location
    
    # Query database
    cursor = db.assets.find(filter_dict).skip(skip).limit(limit).sort("createdAt", -1)
    assets = await cursor.to_list(length=limit)
    
    # Convert _id to string and format dates
    for asset in assets:
        asset["_id"] = str(asset["_id"])
        # Convert date objects to strings if needed
        date_fields = ["purchaseDate", "installDate", "warrantyExpiry", "lastMaintenance", "nextMaintenance"]
        for field in date_fields:
            if field in asset and isinstance(asset[field], date):
                asset[field] = asset[field].isoformat()
    
    return assets

@router.get("/{asset_id}", response_model=Asset)
async def get_asset(asset_id: str):
    db = await get_database()
    
    if not ObjectId.is_valid(asset_id):
        raise HTTPException(status_code=400, detail="Invalid asset ID")
    
    asset = await db.assets.find_one({"_id": ObjectId(asset_id)})
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset["_id"] = str(asset["_id"])
    # Convert date objects to strings if needed
    date_fields = ["purchaseDate", "installDate", "warrantyExpiry", "lastMaintenance", "nextMaintenance"]
    for field in date_fields:
        if field in asset and isinstance(asset[field], date):
            asset[field] = asset[field].isoformat()
    
    return asset

@router.post("", response_model=Asset)
async def create_asset(
    name: str = Form(...),
    location: str = Form(...),
    assetNumber: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    manufacturer: Optional[str] = Form(None),
    model: Optional[str] = Form(None),
    serialNumber: Optional[str] = Form(None),
    purchaseDate: Optional[date] = Form(None),
    installDate: Optional[date] = Form(None),
    warrantyExpiry: Optional[date] = Form(None),
    criticality: Optional[str] = Form(None),
    specifications: Optional[str] = Form(None),  # JSON string
    image: UploadFile = File(None)
):
    try:
        logger.info(f"Creating asset with name: {name}, location: {location}")
        db = await get_database()
        
        # Parse specifications if provided
        specs = {}
        if specifications:
            try:
                specs = json.loads(specifications)
                logger.info(f"Parsed specifications: {specs}")
            except json.JSONDecodeError as e:
                logger.error(f"Invalid specifications format: {e}")
                raise HTTPException(status_code=400, detail="Invalid specifications format")
        
        # Create asset document with default values for required fields
        asset_dict = {
            "name": name,
            "location": location,
            "assetNumber": assetNumber,
            "category": category or "",
            "manufacturer": manufacturer or "",
            "model": model or "",
            "serialNumber": serialNumber or "",
            "purchaseDate": purchaseDate,
            "installDate": installDate,
            "warrantyExpiry": warrantyExpiry,
            "criticality": criticality or "medium",
            "specifications": specs
        }
        
        logger.info(f"Asset dict before image handling: {asset_dict}")
        
        # Handle image upload
        image_url = None
        if image and image.filename:
            try:
                logger.info(f"Processing image: {image.filename}")
                # Generate unique filename
                file_extension = os.path.splitext(image.filename)[1]
                unique_filename = f"{uuid.uuid4()}{file_extension}"
                file_path = UPLOAD_DIR / unique_filename
                logger.info(f"Saving image to: {file_path}")
                
                # Save the file
                content = await image.read()
                with open(file_path, "wb") as buffer:
                    buffer.write(content)
                
                # Store the image URL
                image_url = f"/api/assets/image/{unique_filename}"
                asset_dict["imageUrl"] = image_url
                logger.info(f"Image saved successfully: {image_url}")
            except Exception as e:
                logger.error(f"Error saving image: {e}")
                # Don't fail the entire asset creation if image upload fails
                pass
        
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
        if "assetNumber" in asset_dict and asset_dict["assetNumber"] and str(asset_dict["assetNumber"]).strip():
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
        
        # Update location asset count
        await update_location_asset_count(db, asset_dict.get("location"))
        
        # Convert date objects to strings for response
        date_fields = ["purchaseDate", "installDate", "warrantyExpiry", "lastMaintenance", "nextMaintenance"]
        for field in date_fields:
            if field in asset_dict and isinstance(asset_dict[field], datetime):
                # Convert datetime back to date string for response
                asset_dict[field] = asset_dict[field].date().isoformat()
        
        logger.info(f"Asset created successfully with ID: {asset_dict['_id']}")
        return asset_dict
    except Exception as e:
        logger.error(f"Error creating asset: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{asset_id}", response_model=Asset)
async def update_asset(asset_id: str, asset: AssetUpdate):
    db = await get_database()
    
    if not ObjectId.is_valid(asset_id):
        raise HTTPException(status_code=400, detail="Invalid asset ID")
    
    # Get the existing asset to check location changes
    existing_asset = await db.assets.find_one({"_id": ObjectId(asset_id)})
    if not existing_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Build update dict (exclude None values)
    update_dict = {k: v for k, v in asset.dict().items() if v is not None}
    
    # Handle assetNumber update with uniqueness check
    if "assetNumber" in update_dict and update_dict["assetNumber"]:
        # Check if the provided asset number is already in use by another asset
        existing_asset_check = await db.assets.find_one({
            "assetNumber": update_dict["assetNumber"],
            "_id": {"$ne": ObjectId(asset_id)}
        })
        if existing_asset_check:
            raise HTTPException(status_code=400, detail="Asset number already exists")
        update_dict["assetNumber"] = update_dict["assetNumber"].strip()
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_dict = add_timestamps(update_dict, is_update=True)
    
    # Update database
    result = await db.assets.find_one_and_update(
        {"_id": ObjectId(asset_id)},
        {"$set": update_dict},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Update location asset counts if location changed
    old_location = existing_asset.get("location")
    new_location = result.get("location")
    if old_location != new_location:
        # Update both old and new location counts
        await update_location_asset_count(db, old_location)
        await update_location_asset_count(db, new_location)
    elif "location" in update_dict:
        # Location was updated, update the count
        await update_location_asset_count(db, new_location)
    
    result["_id"] = str(result["_id"])
    # Convert date objects to strings
    date_fields = ["purchaseDate", "installDate", "warrantyExpiry", "lastMaintenance", "nextMaintenance"]
    for field in date_fields:
        if field in result and isinstance(result[field], date):
            result[field] = result[field].isoformat()
    
    return result

@router.delete("/{asset_id}")
async def delete_asset(asset_id: str):
    db = await get_database()
    
    if not ObjectId.is_valid(asset_id):
        raise HTTPException(status_code=400, detail="Invalid asset ID")
    
    # Get the asset to check location
    asset = await db.assets.find_one({"_id": ObjectId(asset_id)})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    result = await db.assets.delete_one({"_id": ObjectId(asset_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Update location asset count
    await update_location_asset_count(db, asset.get("location"))
    
    return {"message": "Asset deleted successfully"}

@router.get("/image/{image_filename}")
async def get_asset_image(image_filename: str):
    image_path = os.path.join("uploaded_assets", image_filename)
    if os.path.exists(image_path):
        return FileResponse(image_path)
    else:
        raise HTTPException(status_code=404, detail="Image not found")

@router.get("/{asset_id}/history")
async def get_asset_history(asset_id: str):
    db = await get_database()
    
    if not ObjectId.is_valid(asset_id):
        raise HTTPException(status_code=400, detail="Invalid asset ID")
    
    # Get work orders related to this asset
    work_orders = await db.work_orders.find({"assetId": asset_id}).to_list(length=100)
    
    # Get preventive maintenance records
    pm_records = await db.preventive_maintenance.find({"assetId": asset_id}).to_list(length=100)
    
    # Get service requests related to this asset
    service_requests = await db.service_requests.find({"relatedAsset": asset_id}).to_list(length=100)
    
    # Format the history data
    history = {
        "workOrders": [],
        "preventiveMaintenance": [],
        "serviceRequests": []
    }
    
    # Process work orders
    for wo in work_orders:
        wo["_id"] = str(wo["_id"])
        history["workOrders"].append(wo)
    
    # Process preventive maintenance
    for pm in pm_records:
        pm["_id"] = str(pm["_id"])
        history["preventiveMaintenance"].append(pm)
    
    # Process service requests
    for sr in service_requests:
        sr["_id"] = str(sr["_id"])
        history["serviceRequests"].append(sr)
    
    return history