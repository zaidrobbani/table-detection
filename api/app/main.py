import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from starlette.formparsers import MultiPartParser

from app.core.config import get_settings
from app.core.errors import pasang_handler
from app.routers import health, prediksi
from app.services.model_registry import muat_registry, warmup

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("meja-bersih")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    app.state.registry = None
    reg = await run_in_threadpool(muat_registry, settings)
    app.state.registry = reg
    await run_in_threadpool(warmup, reg)
    log.info("Model siap (warm).")
    yield
    app.state.registry = None


def create_app() -> FastAPI:
    settings = get_settings()
    # Privasi: Starlette menumpahkan unggahan > 1 MB ke berkas sementara di disk.
    # Naikkan ambang spool di atas batas upload agar foto tetap di memori.
    MultiPartParser.spool_max_size = settings.max_upload_bytes + 1024 * 1024
    app = FastAPI(title="Meja Bersih API", version="1.0.0", lifespan=lifespan)
    app.state.registry = None
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_origin_regex=settings.allowed_origin_regex,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )
    pasang_handler(app)
    app.include_router(health.router)
    app.include_router(prediksi.router)
    return app


app = create_app()
