"""
Reports routes: list, generate, get details, and delete reports directly in MongoDB.
"""
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from models.report import ReportCreate, ReportResponse
from utils.security import get_current_user
from database import get_db

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("", response_model=list[ReportResponse])
async def list_reports(current_user: dict = Depends(get_current_user)):
    """List all reports for the current user from MongoDB."""
    db = get_db()
    cursor = db.reports.find({"user_id": current_user["id"]}).sort("created_at", -1)
    reports = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        reports.append(doc)
    return reports


@router.post("/generate", response_model=ReportResponse, status_code=201)
async def generate_report(request: ReportCreate, current_user: dict = Depends(get_current_user)):
    """Generate a new report from selected predictions in MongoDB."""
    db = get_db()
    pred_count = len(request.prediction_ids)
    
    # Verify predictions exist
    found_docs = []
    for pid in request.prediction_ids:
        try:
            query = {"_id": ObjectId(pid)} if ObjectId.is_valid(pid) else {"_id": pid}
            doc = await db.predictions.find_one(query)
            if doc:
                found_docs.append(doc)
        except Exception:
            pass

    if not found_docs:
        raise HTTPException(status_code=400, detail="None of the specified predictions were found.")

    valid_pids = [str(doc["_id"]) for doc in found_docs]
    now = datetime.now(timezone.utc).isoformat()
    size_kb = len(found_docs) * 450 + 200
    size_str = f"{size_kb / 1000:.1f} MB" if size_kb >= 1000 else f"{size_kb} KB"

    report_doc = {
        "title": request.title,
        "format": "PDF",
        "size": size_str,
        "prediction_ids": valid_pids,
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


@router.get("/{report_id}/details")
async def get_report_details(report_id: str, current_user: dict = Depends(get_current_user)):
    """Get full report details and associated predictions."""
    db = get_db()
    query = {
        "_id": ObjectId(report_id) if ObjectId.is_valid(report_id) else report_id,
        "user_id": current_user["id"],
    }
    report = await db.reports.find_one(query)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report["id"] = str(report.pop("_id"))
    predictions = []
    for pid in report.get("prediction_ids", []):
        try:
            pquery = {"_id": ObjectId(pid)} if ObjectId.is_valid(pid) else {"_id": pid}
            pdoc = await db.predictions.find_one(pquery)
            if pdoc:
                pdoc["id"] = str(pdoc.pop("_id"))
                predictions.append(pdoc)
        except Exception:
            pass

    return {
        "report": report,
        "predictions": predictions,
    }


@router.delete("/{report_id}")
async def delete_report(report_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a report from MongoDB."""
    db = get_db()
    query = {
        "_id": ObjectId(report_id) if ObjectId.is_valid(report_id) else report_id,
        "user_id": current_user["id"],
    }
    result = await db.reports.delete_one(query)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")

    return {"message": "Report deleted"}
