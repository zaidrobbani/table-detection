"""Pemuatan model sekali saat startup + warmup."""

import json
import logging
import threading
from dataclasses import dataclass, field

import keras
import numpy as np
import tensorflow as tf

from app.core.config import Settings

log = logging.getLogger("meja-bersih")

# model -> (berkas, pipeline)
DAFTAR_MODEL = {
    "B": ("model_B_P0.keras", "P0"),
    "C": ("model_C_P1.keras", "P1"),
}


@dataclass
class Registry:
    cfg: dict = field(default_factory=dict)
    models: dict = field(default_factory=dict)
    warm: bool = False
    kunci: threading.Lock = field(default_factory=threading.Lock)
    tf_version: str = tf.__version__


def muat_registry(settings: Settings) -> Registry:
    reg = Registry()
    with open(settings.models_dir / "preprocessing_config.json", encoding="utf-8") as f:
        reg.cfg = json.load(f)
    for nama, (berkas, _) in DAFTAR_MODEL.items():
        reg.models[nama] = keras.models.load_model(settings.models_dir / berkas, compile=False)
        log.info("Model %s dimuat", nama)
    return reg


def warmup(reg: Registry) -> None:
    from app.services.gradcam import prediksi_dan_cam

    dummy = np.full((224, 224, 3), 114, dtype=np.uint8)
    for model in reg.models.values():
        prediksi_dan_cam(model, dummy)
    reg.warm = True
