from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, date
from models import WorkOrder, WorkOrderCreate, WorkOrderUpdate, WorkOrderProgressUpdate
from database import get_database, generate_unique_number, add_timestamps, doc_with_id

router = APIRouter(prefix="/work-orders", tags=["Work Orders"])

# Helper function to add asset name to work orders using Firestore lookups
def add_asset_names_to_work_orders(db, work_orders: List[dict]):
    asset_ids = {wo.get("assetId") for wo in work_orders if wo.get("assetId")}
    asset_name_map = {}
    for asset_id in asset_ids:
        doc = db.collection("assets").document(asset_id).get()
        if doc.exists:
            asset_name_map[asset_id] = doc.to_dict().get("name")

    for wo in work_orders:
        asset_id = wo.get("assetId")
        if asset_id and asset_id in asset_name_map:
            wo["assetName"] = asset_name_map[asset_id]
    return work_orders

@router.get("", response_model=List[WorkOrder])
def list_work_orders(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assignedTo: Optional[str] = None,
    assetId: Optional[str] = None,
    limit: Optional[int] = Query(100, le=1000),
    skip: Optional[int] = 0
):
    db = get_database()

    query = db.collection("work_orders")
    if status:
        query = query.where("status", "==", status)
    if priority:
        query = query.where("priority", "==", priority)
    if assignedTo:
        query = query.where("assignedTo", "==", assignedTo)
    if assetId:
        query = query.where("assetId", "==", assetId)

    documents = list(query.stream())
    documents.sort(
        key=lambda doc: (doc.to_dict() or {}).get("createdDate") or datetime.min,
        reverse=True,
    )
    if skip:
        documents = documents[skip:]
    if limit:
        documents = documents[:limit]

    work_orders = []
    for doc in documents:
        wo = doc_with_id(doc)
        if wo:
            work_orders.append(wo)

    work_orders = add_asset_names_to_work_orders(db, work_orders)
    return work_orders

@router.get("/{work_order_id}", response_model=WorkOrder)
def get_work_order(work_order_id: str):
    db = get_database()

    doc = db.collection("work_orders").document(work_order_id).get()
    wo = doc_with_id(doc)

    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")

    wo_with_asset = add_asset_names_to_work_orders(db, [wo])[0]
    return wo_with_asset

@router.post("", response_model=WorkOrder)
def create_work_order(work_order: WorkOrderCreate):
    db = get_database()

    wo_number = generate_unique_number("work_orders", "WO")

    wo_dict = work_order.dict()
    wo_dict["workOrderNumber"] = wo_number
    wo_dict["status"] = "open"
    wo_dict["createdBy"] = "System"
    wo_dict["createdDate"] = datetime.utcnow()
    wo_dict = add_timestamps(wo_dict)

    doc_ref = db.collection("work_orders").document()
    wo_dict["_id"] = doc_ref.id
    wo_dict["id"] = doc_ref.id
    doc_ref.set(wo_dict)

    return wo_dict

@router.put("/{work_order_id}", response_model=WorkOrder)
def update_work_order(work_order_id: str, work_order: WorkOrderUpdate):
    db = get_database()

    wo_ref = db.collection("work_orders").document(work_order_id)
    if not wo_ref.get().exists:
        raise HTTPException(status_code=404, detail="Work order not found")

    update_dict = {k: v for k, v in work_order.dict(exclude_unset=True).items() if v is not None}

    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_dict = add_timestamps(update_dict, is_update=True)
    wo_ref.update(update_dict)

    updated = doc_with_id(wo_ref.get())
    return updated

@router.delete("/{work_order_id}")
def delete_work_order(work_order_id: str):
    db = get_database()

    wo_ref = db.collection("work_orders").document(work_order_id)
    if not wo_ref.get().exists:
        raise HTTPException(status_code=404, detail="Work order not found")

    wo_ref.delete()
    return {"message": "Work order deleted successfully"}

@router.post("/{work_order_id}/progress", response_model=WorkOrder)
def update_work_order_progress(work_order_id: str, progress: WorkOrderProgressUpdate):
    db = get_database()

    wo_ref = db.collection("work_orders").document(work_order_id)
    if not wo_ref.get().exists:
        raise HTTPException(status_code=404, detail="Work order not found")

    update_dict = progress.dict(exclude_unset=True)
    if not update_dict:
        raise HTTPException(status_code=400, detail="No progress fields provided")

    if update_dict.get("status") == "completed":
        update_dict.setdefault("completedDate", datetime.utcnow())

    if "actualTime" in update_dict and update_dict["actualTime"] is not None:
        update_dict["actualTime"] = float(update_dict["actualTime"])

    update_dict = add_timestamps(update_dict, is_update=True)
    wo_ref.update(update_dict)

    updated = doc_with_id(wo_ref.get())
    return updated


@router.get("/stats/summary")
def get_work_order_stats():
    db = get_database()

    snapshots = list(db.collection("work_orders").stream())
    now = datetime.utcnow()
    total = len(snapshots)
    open_count = 0
    in_progress = 0
    completed = 0
    overdue = 0

    for snap in snapshots:
        data = snap.to_dict() or {}
        status = data.get("status")
        due_date = data.get("dueDate")

        if status == "open":
            open_count += 1
        if status == "in-progress":
            in_progress += 1
        if status == "completed":
            completed += 1

        # Handle both datetime and date objects for due_date comparison
        if status in {"open", "in-progress"} and due_date is not None:
            # Convert date to datetime for comparison if needed
            if isinstance(due_date, date) and not isinstance(due_date, datetime):
                due_date = datetime.combine(due_date, datetime.min.time())
            if isinstance(due_date, datetime) and due_date < now:
                overdue += 1

    return {
        "total": total,
        "open": open_count,
        "inProgress": in_progress,
        "completed": completed,
        "overdue": overdue
    }
