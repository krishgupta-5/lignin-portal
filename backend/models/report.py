from pydantic import BaseModel
from typing import Optional


class ReportCreate(BaseModel):
    title: str
    prediction_ids: list[str]


class ReportResponse(BaseModel):
    id: str
    title: str
    format: str
    size: str
    prediction_ids: list[str]
    user_id: str
    created_at: str
