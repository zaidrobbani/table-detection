"""Rate limit per IP di memori (jendela geser 60 detik)."""

import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import Request

from app.core.config import get_settings
from app.core.errors import ApiError


def ip_klien(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "tak-dikenal"


class RateLimiter:
    def __init__(self) -> None:
        self._waktu: dict[str, deque[float]] = defaultdict(deque)
        self._kunci = Lock()

    def reset(self) -> None:
        with self._kunci:
            self._waktu.clear()

    def periksa(self, ip: str, batas: int, jendela: float = 60.0) -> int | None:
        """Kembalikan None bila lolos, atau detik tunggu bila kena batas."""
        sekarang = time.monotonic()
        with self._kunci:
            q = self._waktu[ip]
            while q and sekarang - q[0] >= jendela:
                q.popleft()
            if len(q) >= batas:
                return max(1, int(jendela - (sekarang - q[0])) + 1)
            q.append(sekarang)
            if len(self._waktu) > 10000:
                for k in [k for k, v in self._waktu.items() if not v]:
                    del self._waktu[k]
            return None


limiter = RateLimiter()


def batasi_laju(request: Request) -> None:
    tunggu = limiter.periksa(ip_klien(request), get_settings().rate_limit)
    if tunggu is not None:
        raise ApiError(
            429,
            "Terlalu banyak permintaan. Coba lagi sebentar lagi.",
            headers={"Retry-After": str(tunggu)},
        )
