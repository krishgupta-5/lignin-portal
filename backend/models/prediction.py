from pydantic import BaseModel
from typing import Optional


class YieldPoint(BaseModel):
    time: int
    yield_value: float


class PredictionRequest(BaseModel):
    plant: str
    chemical: str
    temperature: float
    time_range: str
    ratio: str
    ph: float
    model: str = "node_augmented"


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
    user_id: str
    created_at: str


class HistoryQuery(BaseModel):
    search: Optional[str] = None
    performance: Optional[str] = None
    page: int = 1
    limit: int = 20
