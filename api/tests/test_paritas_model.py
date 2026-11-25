import numpy as np
import pytest

from app.services.gradcam import prediksi_dan_cam
from app.services.model_registry import DAFTAR_MODEL
from app.services.preprocess import load_rgb, preprocess_p0, preprocess_p1

NAMA = ["F_028_B_A_Crop.jpg", "F_041_K_D_Crop.jpg"]
PRE = {"P0": preprocess_p0, "P1": preprocess_p1}


@pytest.fixture(scope="module")
def reg():
    from app.core.config import get_settings
    from app.services.model_registry import muat_registry

    return muat_registry(get_settings())


@pytest.mark.parametrize("model", ["B", "C"])
@pytest.mark.parametrize("nama", NAMA)
def test_paritas_prob(model, nama, reg, cfg, acuan, foto_bytes):
    ref = acuan.get(model, {}).get(nama)
    if ref is None:
        pytest.skip(f"Acuan model {model} untuk {nama} kosong")
    x = PRE[DAFTAR_MODEL[model][1]](load_rgb(foto_bytes[nama]), cfg)
    prob, cam = prediksi_dan_cam(reg.models[model], x)
    print(f"{model} {nama}: prob={prob:.8f} acuan={ref:.8f} selisih={abs(prob-ref):.2e}")
    assert abs(prob - ref) < 1e-4
    assert cam.shape == (224, 224) and 0 <= cam.min() and cam.max() <= 1.0 + 1e-6


def test_prob_sama_dengan_model_predict(reg, cfg, foto_bytes):
    """Jalur Grad-CAM (Rescaling->backbone->Dense manual) setara dengan model.predict."""
    x = preprocess_p0(load_rgb(foto_bytes[NAMA[0]]), cfg)
    prob, _ = prediksi_dan_cam(reg.models["B"], x)
    ref = float(reg.models["B"].predict(x[None].astype("float32"), verbose=0).ravel()[0])
    assert abs(prob - ref) < 1e-5
