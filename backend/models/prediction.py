from pydantic import BaseModel
from typing import Optional


class YieldPoint(BaseModel):
    time: int
    yield_value: float


class PredictionRequest(BaseModel):
    plant: str = "rice_straw"
    chemical: str = "chcl_urea"
    temperature: float = 120.0
    time_range: str = "10 – 180"
    ratio: str = "1:20"
    ph: float = 7.0
    model: str = "node_augmented"
    cellulose_percent: Optional[float] = None
    hemicellulose_percent: Optional[float] = None
    lignin_percent: Optional[float] = None
    size_mm: Optional[float] = None
    hbd_hba_ratio: Optional[float] = None
    liquid_solid_ratio: Optional[float] = None


class PredictionResponse(BaseModel):
    id: str
    plant: str
    chemical: str
    temperature: float
    time_range: str
    ratio: str
    ph: float
    model: str
    lignin_yield: float
    recommended_time: int
    performance: str
    confidence: float
    yield_curve: list[YieldPoint]
    user_id: Optional[str] = None
    created_at: str



class HistoryQuery(BaseModel):
    search: Optional[str] = None
    performance: Optional[str] = None
    page: int = 1
    limit: int = 20


class MultiModelPredictionResponse(BaseModel):
    predictions: list[PredictionResponse]
    ensemble_yield: float
    best_model: str
    models_evaluated: int

