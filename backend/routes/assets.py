from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, date
from bson import ObjectId

from models import Asset, AssetCreate, AssetUpdate
from database import get_database, generate_unique_number, add_timestamps

router = APIRouter(prefix="/assets", tags=["Assets"])

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
async def create_asset(asset: AssetCreate):
    db = await get_database()
    
    # Create asset document
    asset_dict = asset.dict()
    
    # Use provided asset number or generate a unique one
    if "assetNumber" in asset_dict and asset_dict["assetNumber"].strip():
        # Check if the provided asset number is already in use
        existing_asset = await db.assets.find_one({"assetNumber": asset_dict["assetNumber"].strip()})
        if existing_asset:
            raise HTTPException(status_code=400, detail="Asset number already exists")
        asset_dict["assetNumber"] = asset_dict["assetNumber"].strip()
    else:
        # Generate unique asset number
        asset_dict["assetNumber"] = await generate_unique_number("assets", "ASSET")
    
    asset_dict["status"] = "operational"
    asset_dict["condition"] = "good"
    asset_dict["maintenanceCost"] = 0
    asset_dict["downtime"] = 0
    asset_dict = add_timestamps(asset_dict)
    
    # Insert into database
    result = await db.assets.insert_one(asset_dict)
    asset_dict["_id"] = str(result.inserted_id)
    
    # Convert date objects to strings
    date_fields = ["purchaseDate", "installDate", "warrantyExpiry", "lastMaintenance", "nextMaintenance"]
    for field in date_fields:
        if field in asset_dict and isinstance(asset_dict[field], date):
            asset_dict[field] = asset_dict[field].isoformat()
    
    return asset_dict

@router.put("/{asset_id}", response_model=Asset)
async def update_asset(asset_id: str, asset: AssetUpdate):
    db = await get_database()
    
    if not ObjectId.is_valid(asset_id):
        raise HTTPException(status_code=400, detail="Invalid asset ID")
    
    # Build update dict (exclude None values)
    update_dict = {k: v for k, v in asset.dict().items() if v is not None}
    
    # Handle assetNumber update with uniqueness check
    if "assetNumber" in update_dict and update_dict["assetNumber"]:
        # Check if the provided asset number is already in use by another asset
        existing_asset = await db.assets.find_one({
            "assetNumber": update_dict["assetNumber"],
            "_id": {"$ne": ObjectId(asset_id)}
        })
        if existing_asset:
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
    
    result = await db.assets.delete_one({"_id": ObjectId(asset_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return {"message": "Asset deleted successfully"}

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