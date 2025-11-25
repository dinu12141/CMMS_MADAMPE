from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from models import ServiceRequest, ServiceRequestCreate, ServiceRequestUpdate
from database import get_database, generate_unique_number, add_timestamps

router = APIRouter(prefix="/service-requests", tags=["Service Requests"])

@router.get("", response_model=List[ServiceRequest])
async def list_service_requests(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
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
    if category:
        filter_dict["category"] = category
    
    # Query database
    cursor = db.service_requests.find(filter_dict).skip(skip).limit(limit).sort("createdDate", -1)
    service_requests = await cursor.to_list(length=limit)
    
    # Convert _id to string
    for sr in service_requests:
        sr["_id"] = str(sr["_id"])
    
    return service_requests

@router.get("/{service_request_id}", response_model=ServiceRequest)
async def get_service_request(service_request_id: str):
    db = await get_database()
    
    if not ObjectId.is_valid(service_request_id):
        raise HTTPException(status_code=400, detail="Invalid service request ID")
    
    sr = await db.service_requests.find_one({"_id": ObjectId(service_request_id)})
    
    if not sr:
        raise HTTPException(status_code=404, detail="Service request not found")
    
    sr["_id"] = str(sr["_id"])
    return sr

@router.post("", response_model=ServiceRequest)
async def create_service_request(service_request: ServiceRequestCreate):
    db = await get_database()
    
    # Generate unique service request number
    sr_number = await generate_unique_number("service_requests", "SR")
    
    # Create service request document
    sr_dict = service_request.dict()
    sr_dict["serviceRequestNumber"] = sr_number
    sr_dict["status"] = "open"
    sr_dict["createdBy"] = "System"  # TODO: Get from auth
    sr_dict["createdDate"] = datetime.utcnow()
    sr_dict = add_timestamps(sr_dict)
    
    # Insert into database
    result = await db.service_requests.insert_one(sr_dict)
    sr_dict["_id"] = str(result.inserted_id)
    
    return sr_dict

@router.put("/{service_request_id}", response_model=ServiceRequest)
async def update_service_request(service_request_id: str, service_request: ServiceRequestUpdate):
    db = await get_database()
    
    if not ObjectId.is_valid(service_request_id):
        raise HTTPException(status_code=400, detail="Invalid service request ID")
    
    # Build update dict (exclude None values)
    update_dict = {k: v for k, v in service_request.dict().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_dict = add_timestamps(update_dict, is_update=True)
    
    # Update database
    result = await db.service_requests.find_one_and_update(
        {"_id": ObjectId(service_request_id)},
        {"$set": update_dict},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Service request not found")
    
    result["_id"] = str(result["_id"])
    return result

@router.delete("/{service_request_id}")
async def delete_service_request(service_request_id: str):
    db = await get_database()
    
    if not ObjectId.is_valid(service_request_id):
        raise HTTPException(status_code=400, detail="Invalid service request ID")
    
    result = await db.service_requests.delete_one({"_id": ObjectId(service_request_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service request not found")
    
    return {"message": "Service request deleted successfully"}