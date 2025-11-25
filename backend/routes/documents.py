from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
import os
from typing import List, Optional
from datetime import datetime
import uuid
from models import Document, DocumentCreate, DocumentUpdate
from database import get_database, generate_unique_number, add_timestamps
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter(prefix="/documents", tags=["documents"])

# Ensure documents directory exists
DOCUMENTS_DIR = "uploaded_documents"
if not os.path.exists(DOCUMENTS_DIR):
    os.makedirs(DOCUMENTS_DIR)

async def get_document_collection(db: AsyncIOMotorDatabase):
    return db.documents

@router.get("/", response_model=List[Document])
async def get_documents(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all documents with optional filtering"""
    collection = await get_document_collection(db)
    
    query = {}
    if category and category != "all":
        query["category"] = category
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    documents = await collection.find(query).to_list(1000)
    return documents

@router.post("/", response_model=Document)
async def upload_document(
    name: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    relatedTo: Optional[str] = Form(None),
    relatedType: Optional[str] = Form(None),
    expiryDate: Optional[datetime] = Form(None),
    tags: Optional[str] = Form(None),  # Comma-separated tags
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Upload a new document"""
    collection = await get_document_collection(db)
    
    # Generate document number
    document_number = await generate_unique_number("documents", "DOC")
    
    # Save file to disk
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"{document_number}{file_extension}"
    file_path = os.path.join(DOCUMENTS_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Parse tags
    parsed_tags = []
    if tags:
        parsed_tags = [tag.strip() for tag in tags.split(",") if tag.strip()]
    
    # Create document object
    document_data = DocumentCreate(
        name=name,
        description=description,
        category=category,
        relatedTo=relatedTo,
        relatedType=relatedType,
        expiryDate=expiryDate,
        tags=parsed_tags
    )
    
    document_dict = document_data.model_dump()
    document_dict["documentNumber"] = document_number
    document_dict["fileType"] = file.content_type
    document_dict["fileName"] = file.filename
    document_dict["filePath"] = file_path
    document_dict["fileSize"] = len(content)
    document_dict["uploadedBy"] = "Current User"  # This should come from auth
    document_dict["uploadedDate"] = datetime.utcnow()
    
    # Add timestamps
    document_dict = add_timestamps(document_dict)
    
    # Insert into database
    result = await collection.insert_one(document_dict)
    document_dict["_id"] = result.inserted_id
    
    return document_dict

@router.get("/{document_id}", response_model=Document)
async def get_document(
    document_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific document by ID"""
    collection = await get_document_collection(db)
    
    if not ObjectId.is_valid(document_id):
        raise HTTPException(status_code=400, detail="Invalid document ID")
    
    document = await collection.find_one({"_id": ObjectId(document_id)})
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return document

@router.put("/{document_id}", response_model=Document)
async def update_document(
    document_id: str,
    document_update: DocumentUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update a document"""
    collection = await get_document_collection(db)
    
    if not ObjectId.is_valid(document_id):
        raise HTTPException(status_code=400, detail="Invalid document ID")
    
    document = await collection.find_one({"_id": ObjectId(document_id)})
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Update document data
    update_data = document_update.model_dump(exclude_unset=True)
    update_data = add_timestamps(update_data, is_update=True)
    
    await collection.update_one(
        {"_id": ObjectId(document_id)},
        {"$set": update_data}
    )
    
    # Return updated document
    updated_document = await collection.find_one({"_id": ObjectId(document_id)})
    return updated_document

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a document"""
    collection = await get_document_collection(db)
    
    if not ObjectId.is_valid(document_id):
        raise HTTPException(status_code=400, detail="Invalid document ID")
    
    document = await collection.find_one({"_id": ObjectId(document_id)})
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete file from disk
    if os.path.exists(document["filePath"]):
        os.remove(document["filePath"])
    
    # Delete from database
    await collection.delete_one({"_id": ObjectId(document_id)})
    
    return {"message": "Document deleted successfully"}

@router.get("/{document_id}/download")
async def download_document(
    document_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Download a document file"""
    collection = await get_document_collection(db)
    
    if not ObjectId.is_valid(document_id):
        raise HTTPException(status_code=400, detail="Invalid document ID")
    
    document = await collection.find_one({"_id": ObjectId(document_id)})
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not os.path.exists(document["filePath"]):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=document["filePath"],
        filename=document["fileName"],
        media_type=document["fileType"]
    )

@router.get("/{document_id}/view")
async def view_document(
    document_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """View a document file (for supported formats)"""
    collection = await get_document_collection(db)
    
    if not ObjectId.is_valid(document_id):
        raise HTTPException(status_code=400, detail="Invalid document ID")
    
    document = await collection.find_one({"_id": ObjectId(document_id)})
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not os.path.exists(document["filePath"]):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=document["filePath"],
        media_type=document["fileType"]
    )