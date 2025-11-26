from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models import WorkOrder, WorkOrderCreate, WorkOrderUpdate
from database import get_database, generate_unique_number, add_timestamps

router = APIRouter(prefix="/work-orders", tags=["Work Orders"])

# Helper function to add asset name to work orders using aggregation
async def add_asset_names_to_work_orders(db: AsyncIOMotorDatabase, work_orders: List[dict]):
    """Add asset names to work orders using MongoDB aggregation lookup"""
    # Create a mapping of asset IDs to work orders for quick lookup
    work_order_map = {wo["_id"]: wo for wo in work_orders}
    
    # Get unique asset IDs from work orders
    asset_ids = list(set(str(wo["assetId"]) for wo in work_orders if "assetId" in wo and wo["assetId"]))
    
    if asset_ids:
        # Fetch assets with those IDs
        asset_cursor = db.assets.find({"_id": {"$in": [ObjectId(asset_id) for asset_id in asset_ids]}})
        assets = await asset_cursor.to_list(length=len(asset_ids))
        
        # Create asset ID to name mapping
        asset_name_map = {str(asset["_id"]): asset["name"] for asset in assets}
        
        # Add asset names to work orders
        for wo in work_orders:
            if "assetId" in wo and wo["assetId"] in asset_name_map:
                wo["assetName"] = asset_name_map[wo["assetId"]]
    
    return work_orders

@router.get("", response_model=List[WorkOrder])
async def list_work_orders(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assignedTo: Optional[str] = None,
    assetId: Optional[str] = None,
    limit: Optional[int] = Query(100, le=1000),
    skip: Optional[int] = 0
):
    db = await get_database()
    
    # Build filter
    filter_dict = {}
    if status:
        filter_dict["status"] = status
    if priority:
        filter_dict["priority"] = priority
    if assignedTo:
        filter_dict["assignedTo"] = assignedTo
    if assetId:
        filter_dict["assetId"] = assetId
    
    # Query database
    cursor = db.work_orders.find(filter_dict).skip(skip).limit(limit).sort("createdDate", -1)
    work_orders = await cursor.to_list(length=limit)
    
    # Add asset names to work orders
    work_orders = await add_asset_names_to_work_orders(db, work_orders)
    
    # Convert _id to string
    for wo in work_orders:
        wo["_id"] = str(wo["_id"])
    
    return work_orders

@router.get("/{work_order_id}", response_model=WorkOrder)
async def get_work_order(work_order_id: str):
    db = await get_database()
    
    if not ObjectId.is_valid(work_order_id):
        raise HTTPException(status_code=400, detail="Invalid work order ID")
    
    wo = await db.work_orders.find_one({"_id": ObjectId(work_order_id)})
    
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    # Add asset name to work order
    work_orders = await add_asset_names_to_work_orders(db, [wo])
    wo = work_orders[0]
    
    wo["_id"] = str(wo["_id"])
    return wo

@router.post("", response_model=WorkOrder)
async def create_work_order(work_order: WorkOrderCreate):
    db = await get_database()
    
    # Generate unique work order number
    wo_number = await generate_unique_number("work_orders", "WO")
    
    # Create work order document
    wo_dict = work_order.dict()
    wo_dict["workOrderNumber"] = wo_number
    wo_dict["status"] = "open"
    wo_dict["createdBy"] = "System"  # TODO: Get from auth
    wo_dict["createdDate"] = datetime.utcnow()
    wo_dict = add_timestamps(wo_dict)
    
    # Insert into database
    result = await db.work_orders.insert_one(wo_dict)
    wo_dict["_id"] = str(result.inserted_id)
    
    return wo_dict

@router.put("/{work_order_id}", response_model=WorkOrder)
async def update_work_order(work_order_id: str, work_order: WorkOrderUpdate):
    db = await get_database()
    
    if not ObjectId.is_valid(work_order_id):
        raise HTTPException(status_code=400, detail="Invalid work order ID")
    
    # Build update dict (exclude None values)
    update_dict = {k: v for k, v in work_order.dict().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_dict = add_timestamps(update_dict, is_update=True)
    
    # Update database
    result = await db.work_orders.find_one_and_update(
        {"_id": ObjectId(work_order_id)},
        {"$set": update_dict},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    result["_id"] = str(result["_id"])
    return result

@router.delete("/{work_order_id}")
async def delete_work_order(work_order_id: str):
    db = await get_database()
    
    if not ObjectId.is_valid(work_order_id):
        raise HTTPException(status_code=400, detail="Invalid work order ID")
    
    result = await db.work_orders.delete_one({"_id": ObjectId(work_order_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    return {"message": "Work order deleted successfully"}

@router.get("/stats/summary")
async def get_work_order_stats():
    db = await get_database()
    
    # Aggregate statistics
    total = await db.work_orders.count_documents({})
    open_count = await db.work_orders.count_documents({"status": "open"})
    in_progress = await db.work_orders.count_documents({"status": "in-progress"})
    completed = await db.work_orders.count_documents({"status": "completed"})
    
    # Count overdue
    now = datetime.utcnow()
    overdue = await db.work_orders.count_documents({
        "status": {"$in": ["open", "in-progress"]},
        "dueDate": {"$lt": now}
    })
    
    return {
        "total": total,
        "open": open_count,
        "inProgress": in_progress,
        "completed": completed,
        "overdue": overdue
    }
