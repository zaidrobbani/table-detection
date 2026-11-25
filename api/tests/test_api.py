import io

import pytest
from PIL import Image

from tests.conftest import png_bytes

NAMA = ["F_028_B_A_Crop.jpg", "F_041_K_D_Crop.jpg"]
KUNCI_HASIL = {"model", "pipeline", "label", "prob_kotor", "confidence", "threshold", "images", "latency_ms"}


def _kirim(client, path, data: bytes, nama="x.png", tipe="image/png", **form):
    return client.post(path, files={"file": (nama, data, tipe)}, data=form)


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    j = r.json()
    assert j["status"] == "ok" and j["models"] == ["B", "C"] and j["warm"] is True
    assert j["tensorflow"] == "2.21.0"


def test_predict_teks_ditolak_400(client):
    r = _kirim(client, "/predict", b"ini bukan gambar", "a.txt", "text/plain")
    assert r.status_code == 400 and "detail" in r.json()


def test_predict_terlalu_besar_413(client):
    r = _kirim(client, "/predict", b"\0" * (10 * 1024 * 1024 + 1), "besar.png")
    assert r.status_code == 413 and "detail" in r.json()


def test_predict_tipe_tidak_didukung_415(client):
    buf = io.BytesIO()
    Image.new("RGB", (32, 32)).save(buf, format="GIF")
    r = _kirim(client, "/predict", buf.getvalue(), "a.gif", "image/gif")
    assert r.status_code == 415 and "detail" in r.json()


def test_predict_model_tidak_valid_422(client):
    r = _kirim(client, "/predict", png_bytes(), model="Z")
    assert r.status_code == 422
    assert set(r.json()) == {"detail"} and isinstance(r.json()["detail"], str)


def test_predict_tanpa_file_422(client):
    r = client.post("/predict")
    assert r.status_code == 422 and isinstance(r.json()["detail"], str)


def test_predict_default_model_c(client):
    r = _kirim(client, "/predict", png_bytes((120, 80)))
    assert r.status_code == 200
    j = r.json()
    assert set(j) == KUNCI_HASIL
    assert j["model"] == "C" and j["pipeline"] == "P1"
    assert j["images"]["input_model"].startswith("data:image/png;base64,")
    assert j["images"]["gradcam"].startswith("data:image/png;base64,")


def test_compare_kontrak(client, foto_bytes):
    r = _kirim(client, "/compare", foto_bytes[NAMA[0]], NAMA[0], "image/jpeg")
    assert r.status_code == 200
    j = r.json()
    assert set(j) == {"B", "C", "sepakat"}
    assert j["B"]["pipeline"] == "P0" and j["B"]["model"] == "B"
    assert j["C"]["pipeline"] == "P1" and j["C"]["model"] == "C"
    for k in ("B", "C"):
        assert set(j[k]) == KUNCI_HASIL
        assert 0 <= j[k]["prob_kotor"] <= 1
        assert j[k]["label"] in ("Bersih", "Kotor")
        assert j[k]["threshold"] == 0.5
    assert j["sepakat"] == (j["B"]["label"] == j["C"]["label"])


def test_cors_localhost(client):
    r = client.get("/health", headers={"Origin": "http://localhost:3000"})
    assert r.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_rate_limit_429(client):
    from app.core.config import get_settings

    for _ in range(get_settings().rate_limit):
        assert _kirim(client, "/predict", b"x", "a.txt", "text/plain").status_code == 400
    r = _kirim(client, "/predict", b"x", "a.txt", "text/plain")
    assert r.status_code == 429 and "detail" in r.json()


def test_rate_limit_x_forwarded_for(client):
    from app.core.config import get_settings

    for _ in range(get_settings().rate_limit):
        _kirim(client, "/predict", b"x", "a.txt", "text/plain")
    r = client.post(
        "/predict",
        files={"file": ("a.txt", b"x", "text/plain")},
        headers={"X-Forwarded-For": "203.0.113.9, 10.0.0.1"},
    )
    assert r.status_code == 400  # IP lain tidak terkena batas


def test_upload_tidak_ditulis_ke_disk():
    """Unggahan sampai batas 10 MB harus tetap di memori (spool tidak ke disk)."""
    from starlette.formparsers import MultiPartParser

    from app.core.config import get_settings

    assert MultiPartParser.spool_max_size > get_settings().max_upload_bytes
