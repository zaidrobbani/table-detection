import io
from typing import Annotated, Literal

import pillow_heif
from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from fastapi.concurrency import run_in_threadpool
from PIL import Image, UnidentifiedImageError

from app.core.config import get_settings
from app.core.errors import ApiError
from app.core.ratelimit import batasi_laju
from app.schemas.prediksi import CompareResult, PredictResult
from app.services.inference import jalankan
from app.services.preprocess import load_rgb

pillow_heif.register_heif_opener()

router = APIRouter(dependencies=[Depends(batasi_laju)])

FORMAT_DIDUKUNG = {"JPEG", "PNG", "WEBP", "HEIF", "HEIC", "MPO"}


async def _baca_gambar(file: UploadFile):
    batas = get_settings().max_upload_bytes
    data = await file.read(batas + 1)  # baca maksimal batas+1 byte
    if len(data) > batas:
        raise ApiError(413, f"Ukuran file melebihi {get_settings().max_upload_mb} MB.")
    if not data:
        raise ApiError(400, "File kosong atau bukan gambar yang valid.")
    try:
        with Image.open(io.BytesIO(data)) as img:
            fmt = (img.format or "").upper()
    except (UnidentifiedImageError, OSError, ValueError):
        raise ApiError(400, "File bukan gambar atau rusak.") from None
    if fmt not in FORMAT_DIDUKUNG:
        raise ApiError(415, "Tipe gambar tidak didukung. Gunakan JPEG, PNG, WEBP, atau HEIC.")
    try:
        return load_rgb(data)
    except Exception:
        raise ApiError(400, "Gambar rusak dan tidak bisa dibaca.") from None


@router.post("/predict", response_model=PredictResult)
async def predict(
    request: Request,
    file: Annotated[UploadFile, File()],
    model: Annotated[Literal["B", "C"], Form()] = "C",
):
    rgb = await _baca_gambar(file)
    reg = request.app.state.registry
    if reg is None:
        raise ApiError(503, "Model sedang dimuat. Coba lagi sebentar lagi.")
    return await run_in_threadpool(jalankan, reg, model, rgb)


@router.post("/compare", response_model=CompareResult)
async def compare(request: Request, file: Annotated[UploadFile, File()]):
    rgb = await _baca_gambar(file)
    reg = request.app.state.registry
    if reg is None:
        raise ApiError(503, "Model sedang dimuat. Coba lagi sebentar lagi.")
    b = await run_in_threadpool(jalankan, reg, "B", rgb)
    c = await run_in_threadpool(jalankan, reg, "C", rgb)
    return CompareResult(B=b, C=c, sepakat=b.label == c.label)
