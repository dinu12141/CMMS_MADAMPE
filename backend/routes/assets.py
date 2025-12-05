from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Optional, Dict, Any
from datetime import date, datetime
import logging
import os
import uuid
from pathlib import Path
from models import Asset, AssetCreate, AssetUpdate
from database import get_database, generate_unique_number, add_timestamps, doc_with_id

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assets", tags=["Assets"])

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
ASSETS_IMAGES_DIR = UPLOADS_DIR / "assets"
ASSETS_IMAGES_DIR.mkdir(parents=True, exist_ok=True)


def _datetime_from_date(value: Optional[date]) -> Optional[datetime]:
    if value and isinstance(value, date) and not isinstance(value, datetime):
        return datetime.combine(value, datetime.min.time())
    return value


def _serialize_asset_for_response(asset_dict: Dict[str, Any]) -> Dict[str, Any]:
    date_fields = [
        "purchaseDate",
        "installDate",
        "warrantyExpiry",
        "lastMaintenance",
        "nextMaintenance",
        "createdAt",
        "updatedAt",
    ]
    for field in date_fields:
        value = asset_dict.get(field)
        if isinstance(value, datetime):
            asset_dict[field] = value.date().isoformat()
    return asset_dict

@router.get("", response_model=List[Asset])
def list_assets(
    location: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: Optional[int] = 100,
):
    db = get_database()

    query = db.collection("assets")
    if location:
        query = query.where("location", "==", location)
    if status:
        query = query.where("status", "==", status)
    if category:
        query = query.where("category", "==", category)
    if limit:
        query = query.limit(limit)

    documents = query.stream()
    assets = []
    for doc in documents:
        asset = doc_with_id(doc)
        if asset:
            assets.append(asset)

    return assets

@router.get("/{asset_id}", response_model=Asset)
def get_asset(asset_id: str):
    db = get_database()

    doc = db.collection("assets").document(asset_id).get()
    asset = doc_with_id(doc)

    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.post("", response_model=Asset)
def create_asset(asset: AssetCreate):
    try:
        db = get_database()
        assets_collection = db.collection("assets")

        asset_dict = asset.model_dump()
        asset_dict["category"] = asset_dict.get("category") or ""
        asset_dict["manufacturer"] = asset_dict.get("manufacturer") or ""
        asset_dict["model"] = asset_dict.get("model") or ""
        asset_dict["serialNumber"] = asset_dict.get("serialNumber") or ""
        asset_dict["criticality"] = asset_dict.get("criticality") or "medium"
        asset_dict["specifications"] = asset_dict.get("specifications") or {}

        today = datetime.utcnow().date()
        asset_dict["purchaseDate"] = _datetime_from_date(asset_dict.get("purchaseDate") or today)
        asset_dict["installDate"] = _datetime_from_date(asset_dict.get("installDate") or today)
        asset_dict["warrantyExpiry"] = _datetime_from_date(asset_dict.get("warrantyExpiry") or today)

        if asset_dict.get("assetNumber") and str(asset_dict["assetNumber"]).strip():
            provided_number = str(asset_dict["assetNumber"]).strip()
            existing_docs = list(
                assets_collection.where("assetNumber", "==", provided_number).limit(1).stream()
            )
            if existing_docs:
                raise HTTPException(status_code=400, detail="Asset number already exists")
            asset_dict["assetNumber"] = provided_number
        else:
            asset_dict["assetNumber"] = generate_unique_number("assets", "ASSET")

        asset_dict["status"] = "operational"
        asset_dict["condition"] = "good"
        asset_dict["maintenanceCost"] = 0
        asset_dict["downtime"] = 0
        asset_dict = add_timestamps(asset_dict)

        asset_ref = assets_collection.document()
        asset_dict["_id"] = asset_ref.id
        asset_dict["id"] = asset_ref.id
        asset_ref.set(asset_dict)

        return _serialize_asset_for_response(asset_dict)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating asset: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{asset_id}", response_model=Asset)
def update_asset(asset_id: str, asset: AssetUpdate):
    db = get_database()

    asset_ref = db.collection("assets").document(asset_id)
    existing = asset_ref.get()
    if not existing.exists:
        raise HTTPException(status_code=404, detail="Asset not found")

    update_dict = {k: v for k, v in asset.dict(exclude_unset=True).items() if v is not None}

    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")

    date_fields = ["purchaseDate", "installDate", "warrantyExpiry", "lastMaintenance", "nextMaintenance"]
    for field in date_fields:
        if field in update_dict:
            update_dict[field] = _datetime_from_date(update_dict[field])

    update_dict = add_timestamps(update_dict, is_update=True)

    asset_ref.update(update_dict)
    updated_asset = doc_with_id(asset_ref.get())
    return _serialize_asset_for_response(updated_asset)

@router.delete("/{asset_id}")
def delete_asset(asset_id: str):
    db = get_database()

    asset_ref = db.collection("assets").document(asset_id)
    if not asset_ref.get().exists:
        raise HTTPException(status_code=404, detail="Asset not found")

    asset_ref.delete()
    return {"message": "Asset deleted successfully"}

# Image upload endpoint for existing assets
@router.post("/{asset_id}/image")
def upload_asset_image(asset_id: str, file: UploadFile = File(...)):
    db = get_database()

    asset_ref = db.collection("assets").document(asset_id)
    asset = doc_with_id(asset_ref.get())
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Save file to disk with correct extension
    file_extension = os.path.splitext(file.filename)[1].lower()
    # Ensure we have a valid extension
    if not file_extension:
        file_extension = ".jpg"  # default to jpg
    
    file_name = f"{asset_id}_{uuid.uuid4()}{file_extension}"
    file_path = ASSETS_IMAGES_DIR / file_name
    
    with open(file_path, "wb") as buffer:
        content = file.file.read()
        buffer.write(content)
    
    # Update asset with image URL (relative path for static file serving)
    image_url = f"/uploads/assets/{file_name}"
    asset_ref.update({"imageUrl": image_url, "updatedAt": datetime.utcnow()})
    updated_asset = doc_with_id(asset_ref.get())

    return {"imageUrl": image_url, "asset": _serialize_asset_for_response(updated_asset)}


@router.post("/upload")
def upload_asset_file(file: UploadFile = File(...)):
    """
    Accepts an image upload and stores it under /uploads/assets.
    Returns the public URL that can be persisted on the Asset document.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="File is required")

    file_extension = os.path.splitext(file.filename)[1] or ".jpg"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = ASSETS_IMAGES_DIR / unique_filename

    with open(file_path, "wb") as buffer:
        content = file.file.read()
        buffer.write(content)

    return {"url": f"/uploads/assets/{unique_filename}"}