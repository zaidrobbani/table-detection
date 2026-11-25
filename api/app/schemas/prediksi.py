from typing import Literal

from pydantic import BaseModel, Field


class Images(BaseModel):
    input_model: str
    gradcam: str


class PredictResult(BaseModel):
    model: Literal["B", "C"]
    pipeline: Literal["P0", "P1"]
    label: Literal["Bersih", "Kotor"]
    prob_kotor: float = Field(ge=0, le=1)
    confidence: float
    threshold: float = 0.5
    images: Images
    latency_ms: float


class CompareResult(BaseModel):
    B: PredictResult
    C: PredictResult
    sepakat: bool


class HealthResult(BaseModel):
    status: str
    models: list[str]
    tensorflow: str
    warm: bool
