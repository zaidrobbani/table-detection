"""Grad-CAM dari bobot Dense terakhir (setara matematis dengan gradien pada GAP + Dense).

Versi numpy untuk runtime ONNX (tanpa TensorFlow). Setara dengan kode TF di spec:

    fmap  = backbone(rescale(x))[0]                      # 7x7x1280
    logit = tf.tensordot(reduce_mean(fmap, (0, 1)), w, 1) + b
    prob  = sigmoid(logit)                               # P(Kotor)
    tanda = 1 jika prob >= 0.5 selain itu -1
    cam   = relu(tanda * tensordot(fmap, w, 1)); cam /= (cam.max() + 1e-8)

dengan fmap dari graf ONNX (Rescaling + backbone) dan w, b dari head Dense.
"""

import base64
import io

import cv2
import numpy as np
from PIL import Image


def prediksi_dan_cam(model, x_uint8):
    """model: ModelOnnx (app.services.model_registry). x_uint8: [224,224,3] uint8."""
    w = model.w
    fmap = model.fmap(x_uint8)  # 7x7x1280
    logit = float(fmap.mean(axis=(0, 1)) @ w) + model.b
    prob = float(1.0 / (1.0 + np.exp(-logit)))  # P(Kotor)
    tanda = 1.0 if prob >= 0.5 else -1.0
    cam = np.maximum(tanda * (fmap @ w), 0.0)
    cam = cam / (cam.max() + 1e-8)
    cam = cv2.resize(cam.astype(np.float32), (224, 224), interpolation=cv2.INTER_LINEAR)
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
