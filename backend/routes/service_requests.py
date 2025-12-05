from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from typing import List, Optional
from datetime import datetime
import os
import uuid
from pathlib import Path
from models import ServiceRequest, ServiceRequestCreate, ServiceRequestUpdate
from database import get_database, generate_unique_number, add_timestamps, doc_with_id

router = APIRouter(prefix="/service-requests", tags=["Service Requests"])

# Create uploads directory for service requests
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
SERVICE_REQUESTS_UPLOADS_DIR = UPLOADS_DIR / "service_requests"
SERVICE_REQUESTS_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

@router.get("", response_model=List[ServiceRequest])
def list_service_requests(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    limit: Optional[int] = Query(100, le=1000),
    skip: Optional[int] = 0
):
    db = get_database()

    query = db.collection("service_requests")
    if status:
        query = query.where("status", "==", status)
    if priority:
        query = query.where("priority", "==", priority)
    if category:
        query = query.where("category", "==", category)

    documents = list(query.stream())
    if skip:
        documents = documents[skip:]
    if limit:
        documents = documents[:limit]

    results = []
    for doc in documents:
        sr = doc_with_id(doc)
        if sr:
            results.append(sr)

    return results

@router.get("/{service_request_id}", response_model=ServiceRequest)
def get_service_request(service_request_id: str):
    db = get_database()

    doc = db.collection("service_requests").document(service_request_id).get()
    sr = doc_with_id(doc)

    if not sr:
        raise HTTPException(status_code=404, detail="Service request not found")
    return sr

@router.post("", response_model=ServiceRequest)
def create_service_request(service_request: ServiceRequestCreate):
    db = get_database()

    sr_number = generate_unique_number("service_requests", "SR")

    sr_dict = service_request.dict()
    sr_dict["serviceRequestNumber"] = sr_number
    sr_dict["status"] = "open"
    sr_dict["createdBy"] = "System"
    sr_dict["createdDate"] = datetime.utcnow()
    sr_dict = add_timestamps(sr_dict)

    doc_ref = db.collection("service_requests").document()
    sr_dict["_id"] = doc_ref.id
    sr_dict["id"] = doc_ref.id
    doc_ref.set(sr_dict)

    return sr_dict

@router.put("/{service_request_id}", response_model=ServiceRequest)
def update_service_request(service_request_id: str, service_request: ServiceRequestUpdate):
    db = get_database()

    sr_ref = db.collection("service_requests").document(service_request_id)
    if not sr_ref.get().exists:
        raise HTTPException(status_code=404, detail="Service request not found")

    update_dict = {k: v for k, v in service_request.dict().items() if v is not None}

    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_dict = add_timestamps(update_dict, is_update=True)
    sr_ref.update(update_dict)

    updated = doc_with_id(sr_ref.get())
    return updated

@router.delete("/{service_request_id}")
def delete_service_request(service_request_id: str):
    db = get_database()

    sr_ref = db.collection("service_requests").document(service_request_id)
    if not sr_ref.get().exists:
        raise HTTPException(status_code=404, detail="Service request not found")

    sr_ref.delete()
    return {"message": "Service request deleted successfully"}

# Add file upload endpoint for service requests
@router.post("/{service_request_id}/upload-file")
async def upload_service_request_file(service_request_id: str, file: UploadFile = File(...)):
    """
    Upload a file attachment to a service request and store it in Firebase Storage.
    For now, we'll store it locally and save the path in Firestore.
    """
    db = get_database()
    
    # Check if service request exists
    sr_ref = db.collection("service_requests").document(service_request_id)
    sr_doc = sr_ref.get()
    if not sr_doc.exists:
        raise HTTPException(status_code=404, detail="Service request not found")
    
    # Save file to local storage with unique name
    file_extension = os.path.splitext(file.filename)[1] or ".bin"
    unique_filename = f"{service_request_id}_{uuid.uuid4()}{file_extension}"
    file_path = SERVICE_REQUESTS_UPLOADS_DIR / unique_filename
    
    # Write file to disk
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Store file info in Firestore
    file_url = f"/uploads/service_requests/{unique_filename}"
    
    # Get existing attachments or create new list
    sr_data = sr_doc.to_dict()
    attachments = sr_data.get("attachments", [])
    
    # Add new attachment
    attachment_info = {
        "fileName": file.filename,
        "fileUrl": file_url,
        "uploadedAt": datetime.utcnow(),
        "fileSize": len(content)
    }
    attachments.append(attachment_info)
    
    # Update service request with new attachment
    sr_ref.update({
        "attachments": attachments,
        "updatedAt": datetime.utcnow()
    })
    
    # Return file info
    return {
        "fileName": file.filename,
        "fileUrl": file_url,
        "message": "File uploaded successfully"
    }