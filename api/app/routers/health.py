from fastapi import APIRouter, Request

from app.schemas.prediksi import HealthResult

router = APIRouter()


@router.get("/health", response_model=HealthResult)
def health(request: Request):
    reg = request.app.state.registry
    return HealthResult(
        status="ok",
        models=list(reg.models.keys()) if reg else ["B", "C"],
        tensorflow=reg.tf_version if reg else "memuat",
        warm=bool(reg and reg.warm),
    )
