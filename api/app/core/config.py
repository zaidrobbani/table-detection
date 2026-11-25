"""Pengaturan aplikasi dari environment variable."""

import os
from dataclasses import dataclass, field
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]


def _daftar(nilai: str) -> list[str]:
    return [x.strip() for x in nilai.split(",") if x.strip()]


@dataclass(frozen=True)
class Settings:
    allowed_origins: list[str] = field(default_factory=list)
    allowed_origin_regex: str | None = None
    max_upload_mb: int = 10
    rate_limit: int = 30  # permintaan per menit per IP
    models_dir: Path = RAIZ / "models"

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024


def get_settings() -> Settings:
    return Settings(
        allowed_origins=_daftar(os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")),
        allowed_origin_regex=os.getenv("ALLOWED_ORIGIN_REGEX") or None,
        max_upload_mb=int(os.getenv("MAX_UPLOAD_MB", "10")),
        rate_limit=int(os.getenv("RATE_LIMIT", "30")),
        models_dir=Path(os.getenv("MODELS_DIR", str(RAIZ / "models"))),
    )
