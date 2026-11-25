"""Preprocessing: salinan persis dari notebook (P0 = resize+padding, P1 = CLAHE di kanal L + padding)."""

import io

import cv2
import numpy as np
from PIL import Image, ImageOps


def load_rgb(data: bytes) -> np.ndarray:
    with Image.open(io.BytesIO(data)) as img:
        return np.array(ImageOps.exif_transpose(img).convert("RGB"))


def _resize_proporsional(rgb, size):
    h, w = rgb.shape[:2]
    skala = min(size / w, size / h)
    lebar, tinggi = max(1, round(w * skala)), max(1, round(h * skala))
    metode = cv2.INTER_AREA if skala < 1 else cv2.INTER_LINEAR
    return cv2.resize(rgb, (lebar, tinggi), interpolation=metode)


def _padding(rgb, size, warna):
    h, w = rgb.shape[:2]
    hasil = np.full((size, size, 3), warna, dtype=np.uint8)
    x, y = (size - w) // 2, (size - h) // 2
    hasil[y : y + h, x : x + w] = rgb
    return hasil


def preprocess_p0(rgb, cfg):
    return _padding(_resize_proporsional(rgb, cfg["output_size"]), cfg["output_size"], cfg["padding_rgb"])


def preprocess_p1(rgb, cfg):
    dasar = _resize_proporsional(rgb, cfg["output_size"])
    l, a, b = cv2.split(cv2.cvtColor(dasar, cv2.COLOR_RGB2LAB))
    clahe = cv2.createCLAHE(clipLimit=cfg["clahe_clip_limit"], tileGridSize=tuple(cfg["clahe_tile_grid"]))
    p1 = cv2.cvtColor(cv2.merge([clahe.apply(l), a, b]), cv2.COLOR_LAB2RGB)
    return _padding(p1, cfg["output_size"], cfg["padding_rgb"])
