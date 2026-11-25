# Meja Bersih: deteksi kebersihan meja

Web demo klasifikasi foto meja menjadi **Bersih** atau **Kotor**, lengkap dengan
Grad-CAM dan halaman hasil eksperimen. Proyek kelompok mata kuliah Pengolahan
Citra Digital + Visi Komputer, FILKOM Universitas Brawijaya 2026
(Faruqi, Fahry, Zaid).

Dua model MobileNetV2 (backbone beku) dibandingkan dengan protokol yang sama:

| Model | Pipeline | Praproses |
| --- | --- | --- |
| B | P0 | resize proporsional + padding abu (114, 114, 114) ke 224 x 224 |
| C | P1 | P0 ditambah CLAHE pada kanal L ruang warna LAB |

## Isi monorepo

```
api/   FastAPI + ONNX Runtime (Render free tier; lokal port 7860)
web/   Next.js 16 App Router + Tailwind v4 + bun (Vercel, Root Directory = web)
render.yaml Blueprint Render untuk api/
dev.sh menjalankan api + web sekaligus untuk pengembangan lokal
```

Halaman web:

- `/` Demo: unggah atau pilih foto contoh, potong ke area meja, lalu lihat label,
  keyakinan, penggaris P(Kotor), input model, dan Grad-CAM. Bisa beralih model C/B.
- `/bandingkan`: satu foto dikirim ke `/compare`, hasil B dan C berdampingan
  (tab di HP) plus slider sebelum/sesudah P0 vs P1.
- `/hasil`: ringkasan metrik, tabel, grafik, confusion matrix, uji McNemar,
  kurva training, efek CLAHE, galeri figur, dan metode.

## Prasyarat

- [bun](https://bun.sh) 1.4 atau lebih baru (untuk `web/`).
- [uv](https://docs.astral.sh/uv/) dan **Python 3.11** (untuk `api/`).
  TensorFlow 2.21 (hanya untuk dev/ekspor ONNX) belum mendukung Python terbaru,
  jadi pakai 3.11; uv bisa mengunduhnya sendiri.
- Sekitar 2 GB ruang disk untuk venv TensorFlow.

## Menjalankan lokal

Cara cepat (membuat venv bila belum ada, memasang dependensi web, menyalin
`.env.example` bila `.env.local` belum ada, lalu menjalankan keduanya):

```bash
./dev.sh
# API  -> http://localhost:7860   (siap setelah model dimuat, 10-60 detik)
# Web  -> http://localhost:3000
# Ctrl+C menghentikan keduanya
```

Cara manual:

```bash
# 1. API
uv venv --python 3.11 api/.venv
uv pip install --python api/.venv -r api/requirements.txt -r api/requirements-dev.txt
cd api && .venv/bin/python -m app          # port 7860

# 2. Web (terminal lain)
cd web
cp .env.example .env.local                 # NEXT_PUBLIC_BASE_API_URL=http://localhost:7860
bun install
bun run dev                                # port 3000
```

Variabel env web (`web/.env.local`):

| Nama | Nilai | Keterangan |
| --- | --- | --- |
| `NEXT_PUBLIC_BASE_API_URL` | `http://localhost:7860` | URL API tanpa garis miring di akhir. |
| `NEXT_PUBLIC_API_MODE` | `backend` atau `mock` | `mock` memakai hasil palsu dan selalu menampilkan badge MODE MOCK. Tidak ada fallback otomatis ke mock. |
| `NEXT_PUBLIC_SITE_URL` | opsional | URL publik untuk metadata OpenGraph. |

Variabel env API dijelaskan di [`api/README.md`](api/README.md)
(`ALLOWED_ORIGINS`, `ALLOWED_ORIGIN_REGEX`, `MAX_UPLOAD_MB`, `RATE_LIMIT`).

## Tes dan pemeriksaan

```bash
# API: paritas praproses, paritas prediksi B, validasi upload, /compare
cd api && .venv/bin/python -m pytest -q

# Web
cd web
bun run check       # Biome (format + lint)
bun run typecheck   # next typegen + tsc --noEmit
bun run build       # build produksi
```

Hook git (lefthook, dipasang otomatis oleh `bun install` di `web/`): pre-commit
menjalankan Biome + typecheck, commit-msg menjalankan commitlint (conventional
commits), pre-push menjalankan lint + typecheck + build.

## Data eksperimen

Angka di `/hasil` dibangun dari berkas hasil notebook, bukan diketik manual:

```bash
cd web
bun run build:data   # scripts/source/** + public/figures -> src/repository/eksperimen/data/*.json
```

Skrip ini hanya memakai angka dari berkas sumber. Data yang belum ada ditulis
sebagai `null` dan halaman menampilkan state kosong "Belum tersedia di
web_assets". Jalankan ulang perintah di atas setiap kali berkas sumber berubah,
lalu commit JSON hasilnya.

### Data yang belum ada di web_assets

`web_assets.zip` belum lengkap. Berkas berikut belum ada; setelah
`Rapikan_Folder_DL.ipynb` dijalankan ulang, salin ke lokasi di bawah lalu jalankan
`bun run build:data`:

| Data | Taruh di | Dipakai untuk |
| --- | --- | --- |
| Metrik Validation C | `web/scripts/source/C/metrics_validation.csv` | Tabel 3 kolom C |
| Prediksi per citra C (Testing) | `web/scripts/source/C/predictions_testing.csv` | Confusion matrix C eksak (sekarang diturunkan dari recall per kelas) dan `prob_kotor_C` foto contoh |
| Prediksi per citra C (Validation) | `web/scripts/source/C/predictions_validation.csv` | Confusion matrix Validation C |
| Riwayat training C | `web/scripts/source/C/training_history_25epoch.csv` (atau `training_history.csv`) | Kurva training tab Model C |
| Perbandingan B vs C | `web/scripts/source/perbandingan_B_vs_C.csv` | Tabel 6 efek CLAHE |
| Statistik P0 vs P1 | `web/scripts/source/C/statistik_p0_vs_p1.csv` | Tambahan di uji statistik |
| Figur Grad-CAM B vs C | `web/public/figures/C/gradcam_B_vs_C.png` | Galeri |
| Figur Grad-CAM kesalahan C | `web/public/figures/C/gradcam_kesalahan_C.png` | Galeri |
| Figur visual P0 vs P1 | `web/public/figures/C/visual_p0_vs_p1.png` | Gambar 6 efek CLAHE |
| Hasil Eksperimen A (ML klasik, dari Fahry) | belum ada format; isi `eksperimenA` di `web/scripts/build-eksperimen-data.ts` sesuai tipe `EksperimenAData` di `web/src/repository/eksperimen/dto.ts` | Bagian Eksperimen A |
| PNG P1 acuan notebook | `api/tests/fixtures/p1_acuan/<nama>.png` | Tes paritas P1 (sekarang di-skip) |
| `prob_kotor` model C per citra | isi kunci `"C"` di `api/tests/fixtures/prob_acuan.json` | Tes paritas prediksi C (sekarang di-skip) |

Format CSV mengikuti berkas B yang sudah ada (`metrics_*.csv`,
`predictions_*.csv` dengan kolom `key,kelas,y_true,y_pred,prob_kotor,benar`,
`training_history*.csv`). Figur di `public/figures/` dicari otomatis berdasarkan
nama berkas.

## Deploy

### API ke Render (free tier)

API berjalan di ONNX Runtime (tanpa TensorFlow) supaya muat di RAM 512 MB.
Hugging Face Space dengan Docker ternyata butuh akun PRO, jadi hosting memakai Render.

1. Di Render: New > **Blueprint**, pilih repo GitHub ini. `render.yaml` di root
   membuat service `meja-bersih-api` (Python 3.11, plan free, region Singapore,
   `rootDir: api`).
2. Saat diminta, isi `ALLOWED_ORIGINS` dengan domain Vercel
   (mis. `https://meja-bersih.vercel.app`). Untuk preview deployment Vercel isi
   `ALLOWED_ORIGIN_REGEX`, mis. `https://meja-bersih-.*\.vercel\.app`.
3. Tunggu build selesai, lalu cek `https://meja-bersih-api.onrender.com/health`
   sampai `warm` bernilai `true`.

Berkas `models/*.onnx` (sekitar 9 MB masing-masing) dan `*_head.npz` disimpan
sebagai berkas git biasa, bukan Git LFS, agar build Render pasti mendapat berkas
aslinya. Berkas `*.keras` tetap lewat LFS dan tidak dipakai saat runtime.

Service free tidur setelah 15 menit tanpa trafik; start dingin sekitar 30 sampai 60
detik. Web menampilkan banner selama itu dan memakai timeout 60 detik per permintaan.
Cek `warm` di `/health`. Detail ekspor ulang ONNX ada di `api/README.md`.

### Web ke Vercel

1. Import repo ini di Vercel, set **Root Directory** ke `web`.
   Framework terdeteksi Next.js; `web/vercel.json` memakai
   `bun install --ignore-scripts` sebagai install command.
2. Environment Variables (Production dan Preview):
   - `NEXT_PUBLIC_BASE_API_URL` = `https://meja-bersih-api.onrender.com`
   - `NEXT_PUBLIC_API_MODE` = `backend`
   - opsional `NEXT_PUBLIC_SITE_URL` = domain produksi
3. Deploy. Pastikan domain Vercel sudah masuk `ALLOWED_ORIGINS` di Render,
   lalu uji `/` dengan foto contoh.

## Privasi

API memproses foto di memori: tidak menulis foto ke disk (ambang spool
multipart dinaikkan di atas batas 10 MB) dan tidak mencatat isi gambar di log.
Di browser, foto untuk halaman Bandingkan disimpan sementara di
`sessionStorage` (hilang saat tab ditutup).
