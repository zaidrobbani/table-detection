import time

import numpy as np

from app.schemas.prediksi import Images, PredictResult
from app.services.gradcam import overlay_gradcam, png_data_url, prediksi_dan_cam
from app.services.model_registry import DAFTAR_MODEL, Registry
from app.services.preprocess import preprocess_p0, preprocess_p1

PREPROSES = {"P0": preprocess_p0, "P1": preprocess_p1}


def jalankan(reg: Registry, nama: str, rgb: np.ndarray) -> PredictResult:
    """Sinkron/CPU-bound: panggil lewat run_in_threadpool."""
    mulai = time.perf_counter()
    _, pipeline = DAFTAR_MODEL[nama]
    masukan = PREPROSES[pipeline](rgb, reg.cfg)
    prob, cam = prediksi_dan_cam(reg.models[nama], masukan)
    kotor = prob >= 0.5
    return PredictResult(
        model=nama,
        pipeline=pipeline,
        label="Kotor" if kotor else "Bersih",
        prob_kotor=prob,
        confidence=prob if kotor else 1.0 - prob,
        threshold=0.5,
        images=Images(
            input_model=png_data_url(masukan),
            gradcam=png_data_url(overlay_gradcam(masukan, cam)),
        ),
        latency_ms=round((time.perf_counter() - mulai) * 1000, 1),
    )
