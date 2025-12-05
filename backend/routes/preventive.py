from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, HTTPException

from database import get_database, generate_unique_number, add_timestamps, doc_with_id

router = APIRouter(prefix="/pm", tags=["Preventive Maintenance"])


def _ensure_datetime(value) -> datetime:
    if isinstance(value, datetime):
        return value
    if hasattr(value, "to_datetime"):
        return value.to_datetime()
    if value is None:
        return datetime.utcnow()
    return datetime.combine(value, datetime.min.time()) if hasattr(value, "year") else datetime.utcnow()


@router.post("/{pm_id}/generate-wo")
def generate_work_order_from_pm(pm_id: str):
    """
    Create a new Work Order using data from a Preventive Maintenance schedule.
    """
    db = get_database()

    pm_ref = db.collection("preventive_maintenance").document(pm_id)
    pm_doc = pm_ref.get()
    pm_data = doc_with_id(pm_doc)

    if not pm_data:
        raise HTTPException(status_code=404, detail="Preventive maintenance schedule not found")

    work_orders = db.collection("work_orders")
    wo_number = generate_unique_number("work_orders", "WO")

    due_date = _ensure_datetime(pm_data.get("nextDue"))
    estimated_time = pm_data.get("estimatedDuration", 0)
    parts_required = pm_data.get("partsRequired") or []
    tasks = pm_data.get("tasks") or []

    wo_dict: Dict[str, Any] = {
        "workOrderNumber": wo_number,
        "title": f"PM: {pm_data.get('name', 'Preventive Maintenance Task')}",
        "description": "Automatically generated from preventive maintenance schedule",
        "assetId": pm_data.get("assetId"),
        "priority": pm_data.get("priority", "medium"),
        "status": "open",
        "type": "preventive",
        "assignedTo": pm_data.get("assignedTo"),
        "createdBy": "PM Scheduler",
        "createdDate": datetime.utcnow(),
        "dueDate": due_date,
        "estimatedTime": estimated_time,
        "actualTime": None,
        "location": pm_data.get("location") or pm_data.get("assetId") or "Unknown",
        "cost": 0,
        "partsUsed": parts_required,
        "notes": "\n".join(tasks) if tasks else "Generated from preventive maintenance plan",
    }

    wo_dict = add_timestamps(wo_dict)

    wo_ref = work_orders.document()
    wo_dict["_id"] = wo_ref.id
    wo_dict["id"] = wo_ref.id
    wo_ref.set(wo_dict)

    return wo_dict


