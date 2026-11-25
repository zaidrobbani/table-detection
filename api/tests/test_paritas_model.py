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
    """Prediksi lewat jalur ONNX sama dengan probabilitas acuan (toleransi 1e-4)."""
    ref = acuan.get(model, {}).get(nama)
    if ref is None:
        pytest.skip(f"Acuan model {model} untuk {nama} kosong")
    x = PRE[DAFTAR_MODEL[model][1]](load_rgb(foto_bytes[nama]), cfg)
    prob, cam = prediksi_dan_cam(reg.models[model], x)
    print(f"{model} {nama}: prob={prob:.8f} acuan={ref:.8f} selisih={abs(prob-ref):.2e}")
    assert abs(prob - ref) < 1e-4
    assert cam.shape == (224, 224) and 0 <= cam.min() and cam.max() <= 1.0 + 1e-6


def test_runtime_tanpa_tensorflow():
    """Mengimpor aplikasi tidak boleh menarik tensorflow/keras."""
    import subprocess
    import sys
    from pathlib import Path

    kode = (
        "import sys, app.main; "
        "bad=[m for m in ('tensorflow','keras') if m in sys.modules]; "
        "sys.exit(1 if bad else 0)"
    )
    raiz = Path(__file__).resolve().parents[1]
    r = subprocess.run([sys.executable, "-c", kode], cwd=raiz)
    assert r.returncode == 0


@pytest.mark.parametrize("model", ["B", "C"])
@pytest.mark.parametrize("nama", NAMA)
def test_paritas_onnx_vs_keras(model, nama, reg, cfg, foto_bytes):
    """ONNX (numpy) setara dengan jalur Keras/TF asli: prob dan CAM. Dilewati tanpa TensorFlow."""
    tf = pytest.importorskip("tensorflow")
    keras = pytest.importorskip("keras")
    from app.core.config import get_settings

    berkas = {"B": "model_B_P0.keras", "C": "model_C_P1.keras"}[model]
    km = keras.models.load_model(get_settings().models_dir / berkas, compile=False)
    rescale = next(l for l in km.layers if isinstance(l, keras.layers.Rescaling))
    backbone = next(l for l in km.layers if isinstance(l, keras.Model))
    dense = km.layers[-1]

    x = PRE[DAFTAR_MODEL[model][1]](load_rgb(foto_bytes[nama]), cfg)
    # jalur TF asli (spec)
    w = tf.cast(dense.kernel[:, 0], tf.float32)
    fmap = backbone(rescale(x[None].astype("float32")), training=False)[0]
    logit = tf.tensordot(tf.reduce_mean(fmap, axis=(0, 1)), w, 1) + dense.bias[0]
    prob_tf = float(tf.sigmoid(logit))
    tanda = 1.0 if prob_tf >= 0.5 else -1.0
    cam_tf = tf.nn.relu(tanda * tf.tensordot(fmap, w, 1)).numpy()
    cam_tf = cam_tf / (cam_tf.max() + 1e-8)
    import cv2

    cam_tf = cv2.resize(cam_tf, (224, 224), interpolation=cv2.INTER_LINEAR)
    # model.predict sebagai pembanding independen
    prob_pred = float(km.predict(x[None].astype("float32"), verbose=0).ravel()[0])

    prob, cam = prediksi_dan_cam(reg.models[model], x)
    print(
        f"{model} {nama}: |prob onnx-tf|={abs(prob-prob_tf):.2e} "
        f"|prob onnx-predict|={abs(prob-prob_pred):.2e} |cam|={np.abs(cam-cam_tf).max():.2e}"
    )
    assert abs(prob - prob_tf) < 1e-4
    assert abs(prob - prob_pred) < 1e-4
    assert np.abs(cam - cam_tf).max() < 1e-3
