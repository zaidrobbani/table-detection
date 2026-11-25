import numpy as np
import pytest

from app.services.preprocess import load_rgb, preprocess_p0, preprocess_p1
from tests.conftest import FIXTURES

NAMA = ["F_028_B_A_Crop.jpg", "F_041_K_D_Crop.jpg"]


@pytest.mark.parametrize("nama", NAMA)
@pytest.mark.parametrize("fn", [preprocess_p0, preprocess_p1])
def test_bentuk_dtype_dan_determinisme(nama, fn, cfg, foto_bytes):
    rgb = load_rgb(foto_bytes[nama])
    a, b = fn(rgb, cfg), fn(rgb, cfg)
    assert a.shape == (224, 224, 3) and a.dtype == np.uint8
    assert np.array_equal(a, b)


@pytest.mark.parametrize("fn", [preprocess_p0, preprocess_p1])
def test_padding_abu(fn, cfg):
    rgb = np.full((100, 400, 3), 255, dtype=np.uint8)  # lebar: skala 0.56 -> 224x56
    out = fn(rgb, cfg)
    pad = np.array(cfg["padding_rgb"], dtype=np.uint8)
    assert np.all(out[:50] == pad)  # (224-56)//2 = 84 baris atas padding
    assert np.all(out[-50:] == pad)
    assert not np.all(out[112] == pad)  # tengah berisi gambar


def test_p0_tengah_sama_dengan_resize(cfg):
    rgb = np.random.default_rng(0).integers(0, 255, (300, 300, 3), dtype=np.uint8)
    out = preprocess_p0(rgb, cfg)  # persegi -> tanpa padding
    assert out.shape == (224, 224, 3)


def test_p1_berbeda_dari_p0(cfg, foto_bytes):
    rgb = load_rgb(foto_bytes[NAMA[0]])
    assert not np.array_equal(preprocess_p0(rgb, cfg), preprocess_p1(rgb, cfg))


@pytest.mark.parametrize("nama", NAMA)
def test_paritas_png_p1_notebook(nama, cfg, foto_bytes):
    png = FIXTURES / "p1_acuan" / (nama.rsplit(".", 1)[0] + ".png")
    if not png.exists():
        pytest.skip("PNG P1 acuan notebook belum tersedia di fixtures")
    from PIL import Image

    acuan = np.array(Image.open(png).convert("RGB"))
    assert np.array_equal(preprocess_p1(load_rgb(foto_bytes[nama]), cfg), acuan)
