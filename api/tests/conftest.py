import io
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from PIL import Image

FIXTURES = Path(__file__).parent / "fixtures"
MODELS = Path(__file__).resolve().parents[1] / "models"


@pytest.fixture(scope="session")
def cfg():
    return json.loads((MODELS / "preprocessing_config.json").read_text(encoding="utf-8"))


@pytest.fixture(scope="session")
def acuan():
    return json.loads((FIXTURES / "prob_acuan.json").read_text(encoding="utf-8"))


@pytest.fixture(scope="session")
def foto_bytes():
    return {p.name: p.read_bytes() for p in FIXTURES.glob("*.jpg")}


@pytest.fixture(scope="session")
def client():
    from app.main import app

    with TestClient(app) as c:  # menjalankan lifespan (muat model + warmup)
        yield c


@pytest.fixture(autouse=True)
def reset_limiter():
    from app.core.ratelimit import limiter

    limiter.reset()


def png_bytes(ukuran=(64, 48), warna=(200, 30, 30)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", ukuran, warna).save(buf, format="PNG")
    return buf.getvalue()
