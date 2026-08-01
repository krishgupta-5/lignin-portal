"""
Reports routes: list, generate, and delete reports.
"""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from models.report import ReportCreate, ReportResponse
from utils.security import get_current_user
from database import get_db, is_memory_mode, memory_store

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("", response_model=list[ReportResponse])
async def list_reports(current_user: dict = Depends(get_current_user)):
    """List all reports for the current user."""
    if is_memory_mode():
        reports = [r for r in memory_store["reports"] if r["user_id"] == current_user["id"]]
        reports.sort(key=lambda x: x["created_at"], reverse=True)
        return reports
    else:
        db = get_db()
        cursor = db.reports.find({"user_id": current_user["id"]}).sort("created_at", -1)
        reports = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            reports.append(doc)
        return reports


@router.post("/generate", response_model=ReportResponse, status_code=201)
async def generate_report(request: ReportCreate, current_user: dict = Depends(get_current_user)):
    """Generate a new report from selected predictions."""
    # Validate that predictions exist
    pred_count = 0
    if is_memory_mode():
        pred_count = sum(
            1 for pid in request.prediction_ids
            if any(p["id"] == pid and p["user_id"] == current_user["id"] for p in memory_store["predictions"])
        )
    else:
        from bson import ObjectId
        db = get_db()
        for pid in request.prediction_ids:
            try:
                doc = await db.predictions.find_one({"_id": ObjectId(pid), "user_id": current_user["id"]})
                if doc:
                    pred_count += 1
            except Exception:
                pass

    if pred_count == 0:
        raise HTTPException(status_code=400, detail="No valid predictions found for this report")

    now = datetime.now(timezone.utc).isoformat()
    # Simulate file size
    size_kb = pred_count * 450 + 200
    size_str = f"{size_kb / 1000:.1f} MB" if size_kb >= 1000 else f"{size_kb} KB"

    if is_memory_mode():
        report_id = str(uuid.uuid4())
        report_doc = {
            "id": report_id,
            "title": request.title,
            "format": "PDF",
            "size": size_str,
            "prediction_ids": request.prediction_ids,
            "user_id": current_user["id"],
            "created_at": now,
        }
        memory_store["reports"].append(report_doc)
    else:
        db = get_db()
        report_doc = {
            "title": request.title,
            "format": "PDF",
            "size": size_str,
            "prediction_ids": request.prediction_ids,
            "user_id": current_user["id"],
            "created_at": now,
        }
        result = await db.reports.insert_one(report_doc)
        report_id = str(result.inserted_id)

    return ReportResponse(
        id=report_id,
        title=request.title,
        format="PDF",
        size=size_str,
        prediction_ids=request.prediction_ids,
        user_id=current_user["id"],
        created_at=now,
    )


@router.delete("/{report_id}")
async def delete_report(report_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a report."""
    if is_memory_mode():
        before = len(memory_store["reports"])
        memory_store["reports"] = [
            r for r in memory_store["reports"]
            if not (r["id"] == report_id and r["user_id"] == current_user["id"])
        ]
        if len(memory_store["reports"]) == before:
            raise HTTPException(status_code=404, detail="Report not found")
    else:
        from bson import ObjectId
        db = get_db()
        result = await db.reports.delete_one({"_id": ObjectId(report_id), "user_id": current_user["id"]})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Report not found")

    return {"message": "Report deleted"}
