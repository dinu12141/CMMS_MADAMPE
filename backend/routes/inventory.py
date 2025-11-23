from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, date
from bson import ObjectId

from models import InventoryItem, InventoryItemCreate, InventoryItemUpdate
from database import get_database, generate_unique_number, add_timestamps

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("", response_model=List[InventoryItem])
async def list_inventory(
    category: Optional[str] = None,
    status: Optional[str] = None,
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
    
    # Query database
    cursor = db.inventory.find(filter_dict).skip(skip).limit(limit).sort("createdAt", -1)
    inventory_items = await cursor.to_list(length=limit)
    
    # Convert _id to string
    for item in inventory_items:
        item["_id"] = str(item["_id"])
    
    return inventory_items

@router.get("/{item_id}", response_model=InventoryItem)
async def get_inventory_item(item_id: str):
    db = await get_database()
    
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid inventory item ID")
    
    item = await db.inventory.find_one({"_id": ObjectId(item_id)})
    
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    item["_id"] = str(item["_id"])
    return item

@router.post("", response_model=InventoryItem)
async def create_inventory_item(item: InventoryItemCreate):
    db = await get_database()
    
    # Check if part number already exists
    existing_item = await db.inventory.find_one({"partNumber": item.partNumber})
    if existing_item:
        raise HTTPException(status_code=400, detail="Part number already exists")
    
    # Create inventory item document
    item_dict = item.dict()
    item_dict["status"] = "in-stock"  # Default status
    item_dict = add_timestamps(item_dict)
    
    # Insert into database
    result = await db.inventory.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    
    return item_dict

@router.put("/{item_id}", response_model=InventoryItem)
async def update_inventory_item(item_id: str, item: InventoryItemUpdate):
    db = await get_database()
    
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid inventory item ID")
    
    # Build update dict (exclude None values)
    update_dict = {k: v for k, v in item.dict().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_dict = add_timestamps(update_dict, is_update=True)
    
    # Update database
    result = await db.inventory.find_one_and_update(
        {"_id": ObjectId(item_id)},
        {"$set": update_dict},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    result["_id"] = str(result["_id"])
    return result

@router.delete("/{item_id}")
async def delete_inventory_item(item_id: str):
    db = await get_database()
    
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid inventory item ID")
    
    result = await db.inventory.delete_one({"_id": ObjectId(item_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    return {"message": "Inventory item deleted successfully"}