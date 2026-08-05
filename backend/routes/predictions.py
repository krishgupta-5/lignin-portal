"""
Prediction routes: run a prediction, get a single prediction.
All data stored directly in MongoDB Atlas.
"""
from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from models.prediction import PredictionRequest, PredictionResponse, MultiModelPredictionResponse
from services.prediction_service import predict_lignin
from utils.security import get_current_user, get_optional_current_user
from database import get_db

router = APIRouter(prefix="/api", tags=["Predictions"])


@router.post("/predict", response_model=PredictionResponse, status_code=201)
async def run_prediction(
    request: PredictionRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user),
):
    """Run a real ML model prediction and save directly to MongoDB."""
    result = predict_lignin(
        plant=request.plant,
        chemical=request.chemical,
        temperature=request.temperature,
        time_range=request.time_range,
        ratio=request.ratio,
        ph=request.ph,
        model=request.model,
        cellulose_percent=request.cellulose_percent,
        hemicellulose_percent=request.hemicellulose_percent,
        lignin_percent=request.lignin_percent,
        size_mm=request.size_mm,
        hbd_hba_ratio=request.hbd_hba_ratio,
        liquid_solid_ratio=request.liquid_solid_ratio,
    )

    now = datetime.now(timezone.utc).isoformat()
    uid = current_user["id"] if current_user else None

    # Always persist prediction document in MongoDB
    db = get_db()
    prediction_doc = {
        **result,
        "user_id": uid,
        "created_at": now,
        "input_parameters": {
            "plant": request.plant,
            "chemical": request.chemical,
            "temperature": request.temperature,
            "time_range": request.time_range,
            "ratio": request.ratio,
            "ph": request.ph,
            "model": request.model,
            "cellulose_percent": request.cellulose_percent,
            "hemicellulose_percent": request.hemicellulose_percent,
            "lignin_percent": request.lignin_percent,
            "size_mm": request.size_mm,
            "hbd_hba_ratio": request.hbd_hba_ratio,
            "liquid_solid_ratio": request.liquid_solid_ratio,
        },
    }
    insert_result = await db.predictions.insert_one(prediction_doc)
    pred_id = str(insert_result.inserted_id)

    return PredictionResponse(
        id=pred_id,
        **result,
        user_id=uid,
        created_at=now,
    )


@router.post("/predict-all", response_model=MultiModelPredictionResponse, status_code=201)
async def run_all_predictions(
    request: PredictionRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user),
):
    """
    Run all 4 deep learning models (NODE, NODE Augmented, DNN, TabNet) simultaneously
    for the exact same experimental condition and persist records.
    """
    model_keys = ["node_augmented", "node", "dnn", "tabnet"]
    now = datetime.now(timezone.utc).isoformat()
    uid = current_user["id"] if current_user else None
    db = get_db()

    docs_to_insert = []
    responses = []

    for m in model_keys:
        res = predict_lignin(
            plant=request.plant,
            chemical=request.chemical,
            temperature=request.temperature,
            time_range=request.time_range,
            ratio=request.ratio,
            ph=request.ph,
            model=m,
            cellulose_percent=request.cellulose_percent,
            hemicellulose_percent=request.hemicellulose_percent,
            lignin_percent=request.lignin_percent,
            size_mm=request.size_mm,
            hbd_hba_ratio=request.hbd_hba_ratio,
            liquid_solid_ratio=request.liquid_solid_ratio,
        )
        prediction_doc = {
            **res,
            "user_id": uid,
            "created_at": now,
            "input_parameters": {
                "plant": request.plant,
                "chemical": request.chemical,
                "temperature": request.temperature,
                "time_range": request.time_range,
                "ratio": request.ratio,
                "ph": request.ph,
                "model": m,
                "cellulose_percent": request.cellulose_percent,
                "hemicellulose_percent": request.hemicellulose_percent,
                "lignin_percent": request.lignin_percent,
                "size_mm": request.size_mm,
                "hbd_hba_ratio": request.hbd_hba_ratio,
                "liquid_solid_ratio": request.liquid_solid_ratio,
            },
        }
        docs_to_insert.append(prediction_doc)

    insert_result = await db.predictions.insert_many(docs_to_insert)
    for doc, inserted_id in zip(docs_to_insert, insert_result.inserted_ids):
        pred_id = str(inserted_id)
        filtered_doc = {k: v for k, v in doc.items() if k != "_id" and k != "input_parameters"}
        filtered_doc["id"] = pred_id
        responses.append(PredictionResponse(**filtered_doc))

    yields = [r.lignin_yield for r in responses]
    ensemble_yield = round(sum(yields) / len(yields), 1) if yields else 0.0
    best_pred = max(responses, key=lambda x: x.lignin_yield) if responses else None

    return MultiModelPredictionResponse(
        predictions=responses,
        ensemble_yield=ensemble_yield,
        best_model=best_pred.model if best_pred else "node_augmented",
        models_evaluated=len(responses),
    )


@router.get("/predictions/{prediction_id}", response_model=PredictionResponse)
async def get_prediction(prediction_id: str, current_user: dict = Depends(get_current_user)):
    """Get a single prediction by ID from MongoDB."""
    db = get_db()
    query = {"_id": ObjectId(prediction_id)} if ObjectId.is_valid(prediction_id) else {"_id": prediction_id}
    doc = await db.predictions.find_one(query)
    
    if not doc:
        raise HTTPException(status_code=404, detail="Prediction not found")

    pred = {**doc, "id": str(doc["_id"])}
    return PredictionResponse(**pred)

