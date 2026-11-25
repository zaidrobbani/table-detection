"""Ekspor model Keras (B, C) ke ONNX untuk runtime inferensi.

Jalankan dengan venv dev (berisi TensorFlow + tf2onnx + onnxruntime):

    cd api && .venv/bin/python scripts/export_onnx.py

Untuk tiap model dihasilkan:
  - models/model_{B_P0,C_P1}.onnx : sub-graf Rescaling + backbone MobileNetV2.
      input  "input"  float32 [N,224,224,3], nilai piksel 0..255 (Rescaling ada di dalam graf)
      output "fmap"   float32 [N,7,7,1280]  (feature map sebelum GAP)
  - models/model_{B,C}_head.npz : bobot Dense terakhir (w [1280], b skalar).

GAP + Dropout + Dense(1, sigmoid) dihitung dengan numpy saat runtime
(lihat app/services/gradcam.py).
"""

import argparse
import json
import os
import sys
from pathlib import Path

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")

import keras  # noqa: E402
import numpy as np  # noqa: E402
import onnxruntime as ort  # noqa: E402
import tensorflow as tf  # noqa: E402
import tf2onnx  # noqa: E402

RAIZ = Path(__file__).resolve().parents[1]
MODELS = RAIZ / "models"
DAFTAR = {"B": "model_B_P0", "C": "model_C_P1"}
OPSET = 15
TOLERANSI = 1e-4


def cari_bagian(model):
    rescale = next(l for l in model.layers if isinstance(l, keras.layers.Rescaling))
    backbone = next(l for l in model.layers if isinstance(l, keras.Model))
    dense = model.layers[-1]
    return rescale, backbone, dense


def masukan_validasi() -> np.ndarray:
    """Foto fixture lewat P0 dan P1. Citra konstan/noise acak sengaja tidak dipakai: di luar
    distribusi dan selisih float32 antar-runtime membesar (sekitar 1e-3) tanpa memengaruhi prob."""
    sys.path.insert(0, str(RAIZ))
    from app.services.preprocess import load_rgb, preprocess_p0, preprocess_p1

    cfg = json.loads((MODELS / "preprocessing_config.json").read_text(encoding="utf-8"))
    xs = []
    for foto in sorted((RAIZ / "tests" / "fixtures").glob("*.jpg")):
        rgb = load_rgb(foto.read_bytes())
        xs += [preprocess_p0(rgb, cfg), preprocess_p1(rgb, cfg)]
    return np.stack(xs).astype("float32")


def ekspor(nama: str, stem: str) -> None:
    model = keras.models.load_model(MODELS / f"{stem}.keras", compile=False)
    rescale, backbone, dense = cari_bagian(model)

    def fmap_fn(x):
        return backbone(rescale(x), training=False)

    @tf.function(input_signature=[tf.TensorSpec([None, 224, 224, 3], tf.float32, name="input")])
    def fungsi(x):
        return {"fmap": fmap_fn(x)}

    path_onnx = MODELS / f"{stem}.onnx"
    tf2onnx.convert.from_function(
        fungsi,
        input_signature=[tf.TensorSpec([None, 224, 224, 3], tf.float32, name="input")],
        opset=OPSET,
        output_path=str(path_onnx),
    )

    w = np.asarray(dense.kernel.numpy()[:, 0], dtype=np.float32)
    b = np.float32(dense.bias.numpy()[0])
    np.savez(MODELS / f"model_{nama}_head.npz", w=w, b=b)

    # Validasi: fmap dan prob ONNX vs Keras pada beberapa masukan.
    sess = ort.InferenceSession(str(path_onnx), providers=["CPUExecutionProvider"])
    nama_masuk = sess.get_inputs()[0].name
    batch = masukan_validasi()
    ref = fmap_fn(tf.constant(batch)).numpy()
    out = sess.run(None, {nama_masuk: batch})[0]
    d_fmap = float(np.abs(ref - out).max())
    prob_k = model.predict(batch, verbose=0).ravel()
    logit = out.mean(axis=(1, 2)) @ w + b
    prob_o = 1.0 / (1.0 + np.exp(-logit))
    d_prob = float(np.abs(prob_k - prob_o).max())
    ukuran = path_onnx.stat().st_size / 1e6
    print(
        f"[{nama}] {path_onnx.name} {ukuran:.1f} MB | shape {out.shape} | "
        f"maks|fmap onnx-keras|={d_fmap:.2e} | maks|prob onnx-keras|={d_prob:.2e}"
    )
    if d_fmap >= TOLERANSI or d_prob >= TOLERANSI:
        sys.exit(f"Validasi gagal untuk model {nama}: selisih melebihi {TOLERANSI}")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--model", choices=list(DAFTAR), nargs="*", default=list(DAFTAR))
    args = ap.parse_args()
    for nama in args.model:
        ekspor(nama, DAFTAR[nama])


if __name__ == "__main__":
    main()
