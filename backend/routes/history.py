"""
History routes: list and delete past predictions.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from models.prediction import PredictionResponse
from utils.security import get_current_user
from database import get_db, is_memory_mode, memory_store

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get("", response_model=dict)
async def get_history(
    search: Optional[str] = Query(None),
    performance: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """Get prediction history for the current user with search and filter."""
    if is_memory_mode():
        user_preds = [p for p in memory_store["predictions"] if p["user_id"] == current_user["id"]]

        # Filter by search
        if search:
            search_lower = search.lower()
            user_preds = [
                p for p in user_preds
                if search_lower in p["plant"].lower() or search_lower in p["chemical"].lower()
            ]

        # Filter by performance
        if performance and performance != "All":
            user_preds = [p for p in user_preds if p["performance"] == performance]

        # Sort by newest first
        user_preds.sort(key=lambda x: x["created_at"], reverse=True)

        total = len(user_preds)
        start = (page - 1) * limit
        paginated = user_preds[start:start + limit]
    else:
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

        paginated = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            paginated.append(doc)

    return {
        "predictions": paginated,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, (total + limit - 1) // limit),
    }


@router.delete("/{prediction_id}")
async def delete_prediction(prediction_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a prediction from history."""
    if is_memory_mode():
        before = len(memory_store["predictions"])
        memory_store["predictions"] = [
            p for p in memory_store["predictions"]
            if not (p["id"] == prediction_id and p["user_id"] == current_user["id"])
        ]
        if len(memory_store["predictions"]) == before:
            raise HTTPException(status_code=404, detail="Prediction not found")
    else:
        from bson import ObjectId
        db = get_db()
        result = await db.predictions.delete_one({
            "_id": ObjectId(prediction_id),
            "user_id": current_user["id"],
        })
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Prediction not found")

    return {"message": "Prediction deleted"}
