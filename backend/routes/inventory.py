from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, date
from models import InventoryItem, InventoryItemCreate, InventoryItemUpdate
from database import get_database, add_timestamps, doc_with_id

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("", response_model=List[InventoryItem])
def list_inventory(
    category: Optional[str] = None,
    status: Optional[str] = None,
    limit: Optional[int] = Query(100, le=1000),
    skip: Optional[int] = 0
):
    db = get_database()

    query = db.collection("inventory")
    if category:
        query = query.where("category", "==", category)
    if status:
        query = query.where("status", "==", status)

    documents = list(query.stream())
    if skip:
        documents = documents[skip:]
    if limit:
        documents = documents[:limit]

    inventory_items = []
    for doc in documents:
        item = doc_with_id(doc)
        if item:
            inventory_items.append(item)

    return inventory_items

@router.get("/{item_id}", response_model=InventoryItem)
def get_inventory_item(item_id: str):
    db = get_database()

    doc = db.collection("inventory").document(item_id).get()
    item = doc_with_id(doc)

    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item

@router.post("", response_model=InventoryItem)
def create_inventory_item(item: InventoryItemCreate):
    db = get_database()

    collection = db.collection("inventory")
    existing_docs = list(collection.where("partNumber", "==", item.partNumber).limit(1).stream())
    if existing_docs:
        raise HTTPException(status_code=400, detail="Part number already exists")

    item_dict = item.dict()
    item_dict["status"] = "in-stock"
    item_dict = add_timestamps(item_dict)

    doc_ref = collection.document()
    item_dict["_id"] = doc_ref.id
    item_dict["id"] = doc_ref.id
    doc_ref.set(item_dict)

    return item_dict

@router.put("/{item_id}", response_model=InventoryItem)
def update_inventory_item(item_id: str, item: InventoryItemUpdate):
    db = get_database()

    item_ref = db.collection("inventory").document(item_id)
    if not item_ref.get().exists:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    update_dict = {k: v for k, v in item.dict().items() if v is not None}

    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_dict = add_timestamps(update_dict, is_update=True)
    item_ref.update(update_dict)

    updated_item = doc_with_id(item_ref.get())
    return updated_item

@router.delete("/{item_id}")
def delete_inventory_item(item_id: str):
    db = get_database()

    item_ref = db.collection("inventory").document(item_id)
    if not item_ref.get().exists:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    item_ref.delete()
    return {"message": "Inventory item deleted successfully"}