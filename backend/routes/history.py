"""
History routes: list and delete past predictions directly in MongoDB.
"""
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from utils.security import get_current_user
from database import get_db

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get("")
async def get_history(
    search: str = "",
    performance: str = "All",
    page: int = 1,
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
):
    """
    Get paginated prediction history for the current user directly from MongoDB.
    """
    db = get_db()
    query = {"user_id": current_user["id"]}

    if search:
        query["$or"] = [
            {"plant": {"$regex": search, "$options": "i"}},
            {"chemical": {"$regex": search, "$options": "i"}},
        ]
    if performance and performance != "All":
        query["performance"] = performance

    total = await db.predictions.count_documents(query)
    cursor = db.predictions.find(query).sort("created_at", -1).skip((page - 1) * limit).limit(limit)

    predictions = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        predictions.append(doc)

    return {
        "predictions": predictions,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, (total + limit - 1) // limit),
    }


@router.delete("/{prediction_id}")
async def delete_prediction(prediction_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a prediction from MongoDB history."""
    db = get_db()
    query = {
        "_id": ObjectId(prediction_id) if ObjectId.is_valid(prediction_id) else prediction_id,
        "user_id": current_user["id"],
    }
    result = await db.predictions.delete_one(query)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prediction not found")

    return {"message": "Prediction deleted"}

