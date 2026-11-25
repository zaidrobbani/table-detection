"""Handler error: semua respons error berbentuk {"detail": "..."} berbahasa Indonesia."""

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

log = logging.getLogger("meja-bersih")

PESAN_STATUS = {
    400: "Permintaan tidak valid.",
    404: "Alamat tidak ditemukan.",
    405: "Metode tidak diizinkan.",
    413: "Ukuran file melebihi batas.",
    415: "Tipe file tidak didukung.",
    422: "Data permintaan tidak valid.",
    429: "Terlalu banyak permintaan. Coba lagi sebentar lagi.",
    500: "Terjadi kesalahan pada server.",
}


class ApiError(Exception):
    def __init__(self, status_code: int, detail: str, headers: dict | None = None):
        self.status_code = status_code
        self.detail = detail
        self.headers = headers


def _json(status: int, detail: str, headers: dict | None = None) -> JSONResponse:
    return JSONResponse({"detail": detail}, status_code=status, headers=headers)


def pasang_handler(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def _api_error(_: Request, exc: ApiError):
        return _json(exc.status_code, exc.detail, exc.headers)

    @app.exception_handler(StarletteHTTPException)
    async def _http_error(_: Request, exc: StarletteHTTPException):
        return _json(exc.status_code, PESAN_STATUS.get(exc.status_code, "Terjadi kesalahan."))

    @app.exception_handler(RequestValidationError)
    async def _validasi(_: Request, exc: RequestValidationError):
        lokasi = {str(e.get("loc", ("",))[-1]) for e in exc.errors()}
        if "model" in lokasi:
            return _json(422, "Model tidak valid. Pilih 'B' atau 'C'.")
        if "file" in lokasi:
            return _json(422, "Berkas gambar wajib dikirim pada kolom 'file'.")
        return _json(422, PESAN_STATUS[422])

    @app.exception_handler(Exception)
    async def _tak_terduga(_: Request, exc: Exception):
        # Hanya jenis error yang dicatat, bukan isi permintaan/gambar.
        log.error("Kesalahan tak terduga: %s", type(exc).__name__)
        return _json(500, "Model gagal memproses gambar. Coba lagi nanti.")
