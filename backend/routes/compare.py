"""
Compare routes: compare multiple predictions side by side.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from utils.security import get_current_user
from database import get_db, is_memory_mode, memory_store

router = APIRouter(prefix="/api/compare", tags=["Compare"])


class CompareRequest(BaseModel):
    prediction_ids: list[str]


@router.post("")
async def compare_predictions(request: CompareRequest, current_user: dict = Depends(get_current_user)):
    """Compare multiple predictions by their IDs."""
    if len(request.prediction_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 prediction IDs are required")
    if len(request.prediction_ids) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 predictions can be compared")

    predictions = []

    if is_memory_mode():
        for pid in request.prediction_ids:
            pred = next(
                (p for p in memory_store["predictions"]
                 if p["id"] == pid and p["user_id"] == current_user["id"]),
                None
            )
            if pred:
                predictions.append(pred)
    else:
        from bson import ObjectId
        db = get_db()
        for pid in request.prediction_ids:
            try:
                doc = await db.predictions.find_one({
                    "_id": ObjectId(pid),
                    "user_id": current_user["id"],
                })
                if doc:
                    doc["id"] = str(doc.pop("_id"))
                    predictions.append(doc)
            except Exception:
                continue

    if len(predictions) < 2:
        raise HTTPException(status_code=404, detail="Could not find enough predictions to compare")

    return {"predictions": predictions, "count": len(predictions)}
