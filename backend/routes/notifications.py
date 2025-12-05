from datetime import datetime, timedelta
from typing import List, Dict, Any

from fastapi import APIRouter

from database import get_database, doc_with_id

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def _normalize_datetime(value) -> datetime:
    if isinstance(value, datetime):
        return value
    if hasattr(value, "to_datetime"):
        return value.to_datetime()
    if value is None:
        return datetime.utcnow()
    if hasattr(value, "year"):
        return datetime.combine(value, datetime.min.time())
    return datetime.utcnow()


@router.get("/alerts")
def get_upcoming_alerts():
    """
    Return alerts for preventive maintenance schedules that are due within the next three days.
    """
    db = get_database()
    pm_collection = db.collection("preventive_maintenance")

    now = datetime.utcnow()
    horizon = now + timedelta(days=3)
    alerts: List[Dict[str, Any]] = []

    for pm in pm_collection.stream():
        pm_data = doc_with_id(pm)
        if not pm_data:
            continue

        next_due = pm_data.get("nextDue")
        if not next_due:
            continue

        due_date = _normalize_datetime(next_due)
        if now <= due_date <= horizon:
            days_until = max((due_date - now).days, 0)
            alerts.append(
                {
                    "id": pm_data.get("id") or pm_data.get("_id"),
                    "pmNumber": pm_data.get("pmNumber"),
                    "name": pm_data.get("name"),
                    "assetId": pm_data.get("assetId"),
                    "priority": pm_data.get("priority", "medium"),
                    "nextDue": due_date.isoformat(),
                    "daysUntil": days_until,
                }
            )

    return alerts


