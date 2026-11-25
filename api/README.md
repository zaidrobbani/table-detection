<!-- Catatan: header YAML di bawah hanya untuk Hugging Face Space. Space bertipe Docker butuh akun PRO,
     jadi hosting dipindah ke Render (lihat bagian Deploy ke Render). Header dibiarkan bila nanti dipakai lagi. -->
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
Inferensi memakai ONNX Runtime (tanpa TensorFlow di runtime) agar muat di RAM 512 MB.
Proyek kelompok Pengolahan Citra Digital + Visi Komputer, FILKOM UB 2026.

- Model B: tanpa PCD (pipeline P0: resize proporsional + padding abu 114).
- Model C: dengan CLAHE (pipeline P1: CLAHE di kanal L ruang LAB + padding).
- Grad-CAM dihitung dari bobot Dense terakhir. Foto tidak ditulis ke disk dan isi gambar tidak dicatat di log.

## Endpoint

| Metode | Path | Keterangan |
| --- | --- | --- |
| GET | `/health` | `{status, models, tensorflow, runtime, warm}`. `tensorflow` = versi TF saat training ("2.21.0", kontrak web), `runtime` = mis. `onnxruntime 1.32.0`. `warm=true` setelah warmup selesai. |
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
| `PORT` | `7860` | Port server (`python -m app`). Render mengisinya otomatis. |
| `ORT_THREADS` | `1` | Jumlah thread intra-op ONNX Runtime. |

## Jalan lokal

Python sistem terbaru mungkin belum didukung TensorFlow (dipakai hanya untuk ekspor/tes paritas). Pakai Python 3.11:

```bash
cd api
uv venv --python 3.11 .venv
uv pip install --python .venv/bin/python -r requirements-dev.txt
.venv/bin/python -m app            # http://localhost:7860 (ubah dengan PORT=...)
.venv/bin/python -m pytest -q      # menjalankan test
```

Untuk menjalankan tanpa TensorFlow (seperti di Render), cukup `pip install -r requirements.txt`
(+ `pytest httpx` bila ingin menjalankan test; tes paritas ONNX vs Keras otomatis dilewati).

Contoh:

```bash
curl http://localhost:7860/health
curl -F file=@tests/fixtures/F_028_B_A_Crop.jpg http://localhost:7860/compare
```

## Ekspor ulang ONNX

Hanya perlu bila model `.keras` berubah. Jalankan dengan venv dev (berisi TensorFlow + tf2onnx):

```bash
cd api
.venv/bin/python scripts/export_onnx.py
```

Skrip mengekspor sub-graf Rescaling + backbone MobileNetV2 (input `float32 [N,224,224,3]` 0..255,
output feature map `[N,7,7,1280]`, opset 15) ke `models/model_{B_P0,C_P1}.onnx`, menyimpan bobot Dense
ke `models/model_{B,C}_head.npz` (`w`, `b`), lalu memvalidasi selisih feature map dan probabilitas
terhadap Keras (harus < 1e-4). GAP, Dense, sigmoid, dan Grad-CAM dihitung dengan numpy di
`app/services/gradcam.py`.

## Deploy ke Render

Dari root repo, `render.yaml` adalah Blueprint (service `meja-bersih-api`, plan free, rootDir `api`,
build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`,
health check `/health`).

1. Render > New > Blueprint > pilih repo ini.
2. Isi `ALLOWED_ORIGINS` (domain Vercel, mis. `https://nama-proyek.vercel.app`) dan, bila perlu,
   `ALLOWED_ORIGIN_REGEX` (mis. `https://nama-proyek-.*\.vercel\.app`). `RATE_LIMIT=30` dan
   `PYTHON_VERSION=3.11.11` sudah di Blueprint.
3. Setelah live, isi `NEXT_PUBLIC_BASE_API_URL` di web dengan `https://meja-bersih-api.onrender.com`.

`models/*.onnx` dan `*_head.npz` di-commit sebagai berkas git biasa (bukan LFS) agar build Render pasti
mendapat berkas aslinya; `*.keras` tetap LFS dan tidak dibutuhkan runtime. Service free tidur setelah
15 menit tanpa trafik; start dingin 30 sampai 60 detik, cek `warm` di `/health`.

## Hugging Face Space (tidak dipakai)

Space bertipe Docker butuh akun PRO. Bila tetap ingin memakainya, `Dockerfile` di folder ini sudah
sesuai (`PORT=7860`, hanya `requirements.txt`), dan header YAML di atas tetap berlaku.
