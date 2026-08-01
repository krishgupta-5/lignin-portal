"""
Prediction routes: run a prediction, get a single prediction.
"""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from models.prediction import PredictionRequest, PredictionResponse
from services.prediction_service import predict_lignin
from utils.security import get_current_user
from database import get_db, is_memory_mode, memory_store

router = APIRouter(prefix="/api", tags=["Predictions"])


@router.post("/predict", response_model=PredictionResponse, status_code=201)
async def run_prediction(request: PredictionRequest, current_user: dict = Depends(get_current_user)):
    """Run a lignin yield prediction and save to history."""
    # Run ML model prediction
    result = predict_lignin(
        plant=request.plant,
        chemical=request.chemical,
        temperature=request.temperature,
        time_range=request.time_range,
        ratio=request.ratio,
        ph=request.ph,
        model=request.model,
    )

    now = datetime.now(timezone.utc).isoformat()

    if is_memory_mode():
        pred_id = str(uuid.uuid4())
        prediction_doc = {
            "id": pred_id,
            **result,
            "user_id": current_user["id"],
            "created_at": now,
        }
        memory_store["predictions"].append(prediction_doc)
    else:
        db = get_db()
        prediction_doc = {
            **result,
            "user_id": current_user["id"],
            "created_at": now,
        }
        insert_result = await db.predictions.insert_one(prediction_doc)
        pred_id = str(insert_result.inserted_id)

    return PredictionResponse(
        id=pred_id,
        **result,
        user_id=current_user["id"],
        created_at=now,
    )


@router.get("/predictions/{prediction_id}", response_model=PredictionResponse)
async def get_prediction(prediction_id: str, current_user: dict = Depends(get_current_user)):
    """Get a single prediction by ID."""
    if is_memory_mode():
        pred = next((p for p in memory_store["predictions"] if p["id"] == prediction_id), None)
    else:
        from bson import ObjectId
        db = get_db()
        doc = await db.predictions.find_one({"_id": ObjectId(prediction_id)})
        if doc:
            pred = {**doc, "id": str(doc["_id"])}
        else:
            pred = None

    if not pred:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Prediction not found")

    return PredictionResponse(**pred)
