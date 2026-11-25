---
title: Meja Bersih API
emoji: 🧹
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# Meja Bersih API

Backend FastAPI untuk klasifikasi kebersihan meja (Bersih / Kotor) dengan MobileNetV2 beku.
Proyek kelompok Pengolahan Citra Digital + Visi Komputer, FILKOM UB 2026.

- Model B: tanpa PCD (pipeline P0: resize proporsional + padding abu 114).
- Model C: dengan CLAHE (pipeline P1: CLAHE di kanal L ruang LAB + padding).
- Grad-CAM dihitung dari bobot Dense terakhir. Foto tidak ditulis ke disk dan isi gambar tidak dicatat di log.

## Endpoint

| Metode | Path | Keterangan |
| --- | --- | --- |
| GET | `/health` | `{status, models, tensorflow, warm}`. `warm=true` setelah warmup selesai. |
| POST | `/predict` | multipart `file` + `model` (`C` default atau `B`). |
| POST | `/compare` | multipart `file`. Mengembalikan `{B, C, sepakat}`. |

Format error selalu `{"detail": "..."}`: 400 bukan gambar/rusak, 413 lebih dari 10 MB,
415 tipe tidak didukung (JPEG, PNG, WEBP, HEIC), 422 parameter tidak valid, 429 rate limit (30/menit per IP), 500 kegagalan model.

## Variabel lingkungan

| Nama | Default | Keterangan |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Daftar origin CORS, dipisah koma. |
| `ALLOWED_ORIGIN_REGEX` | kosong | Regex origin tambahan, misalnya `https://.*\.vercel\.app`. |
| `MAX_UPLOAD_MB` | `10` | Batas ukuran upload. |
| `RATE_LIMIT` | `30` | Permintaan per menit per IP. |

## Jalan lokal

Python sistem terbaru mungkin belum didukung TensorFlow. Pakai Python 3.11:

```bash
cd api
uv venv --python 3.11 .venv
uv pip install --python .venv/bin/python -r requirements-dev.txt
.venv/bin/python -m app            # http://localhost:7860
.venv/bin/python -m pytest -q      # menjalankan test
```

Contoh:

```bash
curl http://localhost:7860/health
curl -F file=@tests/fixtures/F_028_B_A_Crop.jpg http://localhost:7860/compare
```

## Deploy ke Hugging Face Space

1. Buat Space baru dengan SDK **Docker** (Blank).
2. Salin isi folder `api/` ke root repo Space (berkas `README.md` ini berisi header HF).
   Berkas `models/*.keras` perlu disimpan lewat Git LFS (`git lfs track "*.keras"`).
3. Di Settings > Variables, isi `ALLOWED_ORIGINS` dengan domain Vercel, misalnya `https://nama-proyek.vercel.app`.
4. Push. Space akan membangun image dari `Dockerfile` dan menjalankan `python -m app` di port 7860.
5. Isi `NEXT_PUBLIC_BASE_API_URL` di web dengan `https://<user>-<space>.hf.space`.

Space gratis tidur saat tidak dipakai. Start dingin biasanya 30 sampai 60 detik; cek `warm` di `/health`.
