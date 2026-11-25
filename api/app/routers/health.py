from fastapi import APIRouter, Request
from fastapi.concurrency import run_in_threadpool

from app.schemas.prediksi import HealthResult
from app.services.model_registry import dapatkan_registry

router = APIRouter()


@router.get("/health", response_model=HealthResult)
async def health(request: Request):
    # Di serverless, /health juga menghangatkan instance: model dimuat (sekali)
    # pada panggilan pertama, jadi polling dari web cukup untuk memanaskannya.
    reg = await run_in_threadpool(dapatkan_registry, request.app)
    return HealthResult(
        status="ok",
        models=list(reg.models.keys()),
        tensorflow=reg.tf_version,
        runtime=reg.runtime,
        warm=reg.warm,
    )
