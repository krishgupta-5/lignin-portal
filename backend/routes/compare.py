"""
Compare routes: compare multiple predictions side by side directly from MongoDB.
"""
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from utils.security import get_current_user
from database import get_db

router = APIRouter(prefix="/api/compare", tags=["Compare"])


class CompareRequest(BaseModel):
    prediction_ids: list[str]


@router.post("")
async def compare_predictions(request: CompareRequest, current_user: dict = Depends(get_current_user)):
    """Compare multiple predictions directly from MongoDB by their IDs."""
    if len(request.prediction_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 prediction IDs are required")
    if len(request.prediction_ids) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 predictions can be compared")

    predictions = []
    db = get_db()
    for pid in request.prediction_ids:
        try:
            query = {
                "_id": ObjectId(pid) if ObjectId.is_valid(pid) else pid,
                "user_id": current_user["id"],
            }
            doc = await db.predictions.find_one(query)
            if doc:
                doc["id"] = str(doc.pop("_id"))
                predictions.append(doc)
        except Exception:
            continue

    if len(predictions) < 2:
        raise HTTPException(status_code=404, detail="Could not find enough predictions to compare")

    return {"predictions": predictions, "count": len(predictions)}

