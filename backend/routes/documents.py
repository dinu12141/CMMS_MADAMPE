from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
import os
from typing import List, Optional
from datetime import datetime
from models import Document, DocumentCreate, DocumentUpdate
from database import get_database, generate_unique_number, add_timestamps, doc_with_id

router = APIRouter(prefix="/documents", tags=["documents"])

# Ensure documents directory exists
DOCUMENTS_DIR = "uploaded_documents"
if not os.path.exists(DOCUMENTS_DIR):
    os.makedirs(DOCUMENTS_DIR)

def get_document_collection(db):
    return db.collection("documents")

@router.get("", response_model=List[Document])
def get_documents(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db=Depends(get_database)
):
    """Get all documents with optional filtering"""
    collection = get_document_collection(db)

    query = collection
    if category and category != "all":
        query = query.where("category", "==", category)

    documents = []
    for doc in query.stream():
        document = doc_with_id(doc)
        if document:
            documents.append(document)

    if search:
        search_lower = search.lower()
        documents = [
            doc for doc in documents
            if search_lower in (doc.get("name", "").lower())
            or search_lower in (doc.get("description", "").lower())
        ]

    return documents

@router.post("", response_model=Document)
def upload_document(
    name: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    relatedTo: Optional[str] = Form(None),
    relatedType: Optional[str] = Form(None),
    expiryDate: Optional[datetime] = Form(None),
    tags: Optional[str] = Form(None),  # Comma-separated tags
    file: UploadFile = File(...),
    db=Depends(get_database)
):
    """Upload a new document"""
    collection = get_document_collection(db)

    # Generate document number
    document_number = generate_unique_number("documents", "DOC")

    # Save file to disk
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"{document_number}{file_extension}"
    file_path = os.path.join(DOCUMENTS_DIR, file_name)

    with open(file_path, "wb") as buffer:
        content = file.file.read()
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

    doc_ref = collection.document()
    document_dict["_id"] = doc_ref.id
    document_dict["id"] = doc_ref.id
    doc_ref.set(document_dict)

    return document_dict

@router.get("/{document_id}", response_model=Document)
def get_document(
    document_id: str,
    db=Depends(get_database)
):
    """Get a specific document by ID"""
    collection = get_document_collection(db)

    doc = collection.document(document_id).get()
    document = doc_with_id(doc)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return document

@router.put("/{document_id}", response_model=Document)
def update_document(
    document_id: str,
    document_update: DocumentUpdate,
    db=Depends(get_database)
):
    """Update a document"""
    collection = get_document_collection(db)

    doc_ref = collection.document(document_id)
    document = doc_with_id(doc_ref.get())
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    update_data = document_update.model_dump(exclude_unset=True)
    update_data = add_timestamps(update_data, is_update=True)

    doc_ref.update(update_data)
    updated_document = doc_with_id(doc_ref.get())
    return updated_document

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    db=Depends(get_database)
):
    """Delete a document"""
    collection = get_document_collection(db)

    doc_ref = collection.document(document_id)
    document = doc_with_id(doc_ref.get())
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete file from disk
    if os.path.exists(document["filePath"]):
        os.remove(document["filePath"])

    doc_ref.delete()
    return {"message": "Document deleted successfully"}

@router.get("/{document_id}/download")
def download_document(
    document_id: str,
    db=Depends(get_database)
):
    """Download a document file"""
    collection = get_document_collection(db)

    doc = collection.document(document_id).get()
    document = doc_with_id(doc)
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
def view_document(
    document_id: str,
    db=Depends(get_database)
):
    """View a document file (for supported formats)"""
    collection = get_document_collection(db)

    doc = collection.document(document_id).get()
    document = doc_with_id(doc)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if not os.path.exists(document["filePath"]):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=document["filePath"],
        media_type=document["fileType"]
    )