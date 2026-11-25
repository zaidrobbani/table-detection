"""Pemuatan model ONNX sekali saat startup + warmup.

Runtime tidak mengimpor TensorFlow/Keras. Tiap model terdiri dari:
  - graf ONNX (Rescaling + backbone MobileNetV2): [N,224,224,3] 0..255 -> [N,7,7,1280]
  - bobot head (Dense terakhir) w [1280] dan b, dari berkas .npz
Dibuat oleh scripts/export_onnx.py.
"""

import json
import logging
import threading
from dataclasses import dataclass, field

import numpy as np
import onnxruntime as ort

from app.core.config import Settings

log = logging.getLogger("meja-bersih")

# model -> (berkas ONNX, pipeline, berkas head)
DAFTAR_MODEL = {
    "B": ("model_B_P0.onnx", "P0"),
    "C": ("model_C_P1.onnx", "P1"),
}
BERKAS_HEAD = {"B": "model_B_head.npz", "C": "model_C_head.npz"}

# Versi TensorFlow saat training; dipertahankan di /health agar kontrak web tidak berubah.
TF_VERSI_TRAINING = "2.21.0"


@dataclass
class ModelOnnx:
    sesi: ort.InferenceSession
    nama_masukan: str
    w: np.ndarray  # [1280] float32, kernel Dense[:, 0]
    b: float  # bias Dense[0]

    def fmap(self, x_uint8: np.ndarray) -> np.ndarray:
        """x_uint8 [224,224,3] -> feature map [7,7,1280] float32."""
        x = x_uint8[None].astype(np.float32)
        return self.sesi.run(None, {self.nama_masukan: x})[0][0]


@dataclass
class Registry:
    cfg: dict = field(default_factory=dict)
    models: dict = field(default_factory=dict)
    warm: bool = False
    kunci: threading.Lock = field(default_factory=threading.Lock)
    tf_version: str = TF_VERSI_TRAINING
    runtime: str = f"onnxruntime {ort.__version__}"


def _opsi_sesi(threads: int) -> ort.SessionOptions:
    opsi = ort.SessionOptions()
    opsi.intra_op_num_threads = threads
    opsi.inter_op_num_threads = 1
    opsi.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
    # Hemat RAM (target Render free 512 MB): tanpa arena & pola memori.
    opsi.enable_cpu_mem_arena = False
    opsi.enable_mem_pattern = False
    opsi.log_severity_level = 3
    return opsi


def muat_registry(settings: Settings) -> Registry:
    reg = Registry()
    with open(settings.models_dir / "preprocessing_config.json", encoding="utf-8") as f:
        reg.cfg = json.load(f)
    reg.tf_version = str(reg.cfg.get("tensorflow_version", TF_VERSI_TRAINING))
    for nama, (berkas, _) in DAFTAR_MODEL.items():
        sesi = ort.InferenceSession(
            str(settings.models_dir / berkas),
            sess_options=_opsi_sesi(settings.ort_threads),
            providers=["CPUExecutionProvider"],
        )
        head = np.load(settings.models_dir / BERKAS_HEAD[nama])
        reg.models[nama] = ModelOnnx(
            sesi=sesi,
            nama_masukan=sesi.get_inputs()[0].name,
            w=np.asarray(head["w"], dtype=np.float32),
            b=float(head["b"]),
        )
        log.info("Model %s dimuat", nama)
    return reg


def warmup(reg: Registry) -> None:
    from app.services.gradcam import prediksi_dan_cam

    dummy = np.full((224, 224, 3), 114, dtype=np.uint8)
    for model in reg.models.values():
        prediksi_dan_cam(model, dummy)
    reg.warm = True
