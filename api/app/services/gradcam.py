"""Grad-CAM dari bobot Dense terakhir (setara matematis dengan gradien pada GAP + Dense)."""

import base64
import io

import cv2
import keras
import numpy as np
import tensorflow as tf
from PIL import Image


def cari_bagian(model):
    rescale = next(l for l in model.layers if isinstance(l, keras.layers.Rescaling))
    backbone = next(l for l in model.layers if isinstance(l, keras.Model))
    dense = model.layers[-1]
    return rescale, backbone, dense


def prediksi_dan_cam(model, x_uint8):
    rescale, backbone, dense = cari_bagian(model)
    w = tf.cast(dense.kernel[:, 0], tf.float32)
    fmap = backbone(rescale(x_uint8[None].astype("float32")), training=False)[0]  # 7x7x1280
    logit = tf.tensordot(tf.reduce_mean(fmap, axis=(0, 1)), w, 1) + dense.bias[0]
    prob = float(tf.sigmoid(logit))  # P(Kotor)
    tanda = 1.0 if prob >= 0.5 else -1.0
    cam = tf.nn.relu(tanda * tf.tensordot(fmap, w, 1)).numpy()
    cam = cam / (cam.max() + 1e-8)
    cam = cv2.resize(cam, (224, 224), interpolation=cv2.INTER_LINEAR)
    return prob, cam


def _png_data_url(rgb: np.ndarray) -> str:
    buf = io.BytesIO()
    Image.fromarray(rgb).save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def png_data_url(rgb: np.ndarray) -> str:
    return _png_data_url(rgb)


def overlay_gradcam(citra_rgb: np.ndarray, cam: np.ndarray) -> np.ndarray:
    heat = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
    heat = cv2.cvtColor(heat, cv2.COLOR_BGR2RGB)
    campur = 0.6 * citra_rgb.astype("float32") + 0.4 * heat.astype("float32")
    return np.clip(campur, 0, 255).astype(np.uint8)
