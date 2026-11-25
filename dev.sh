#!/usr/bin/env bash
# Jalankan API (FastAPI, port 7860) dan web (Next.js dev, port 3000) bersamaan.
# Ctrl+C menghentikan keduanya.
#
#   ./dev.sh
#
# Venv API dibuat otomatis bila belum ada (butuh uv + Python 3.11).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API="$ROOT/api"
WEB="$ROOT/web"

log() { printf '\033[1;34m[dev]\033[0m %s\n' "$*"; }
gagal() { printf '\033[1;31m[dev]\033[0m %s\n' "$*" >&2; exit 1; }

command -v bun >/dev/null 2>&1 || gagal "bun belum terpasang. Lihat https://bun.sh"

# --- API: venv Python 3.11 -------------------------------------------------
if [ ! -x "$API/.venv/bin/python" ]; then
  command -v uv >/dev/null 2>&1 || gagal "uv belum terpasang. Lihat https://docs.astral.sh/uv/"
  log "Membuat venv API dengan Python 3.11 (sekali saja, butuh beberapa menit)..."
  uv venv --python 3.11 "$API/.venv"
  uv pip install --python "$API/.venv" -r "$API/requirements.txt" -r "$API/requirements-dev.txt"
fi

# --- Web: dependensi + env ---------------------------------------------------
if [ ! -d "$WEB/node_modules" ]; then
  log "Memasang dependensi web..."
  (cd "$WEB" && bun install)
fi
if [ ! -f "$WEB/.env.local" ]; then
  log "Membuat web/.env.local dari .env.example"
  cp "$WEB/.env.example" "$WEB/.env.local"
fi

port_terpakai() {
  if command -v ss >/dev/null 2>&1; then
    ss -ltn "sport = :$1" | grep -q LISTEN
  elif command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
  else
    return 1
  fi
}
for p in 7860 3000; do
  port_terpakai "$p" && gagal "Port $p sudah dipakai proses lain. Hentikan dulu proses itu."
done

# --- Jalankan keduanya -----------------------------------------------------
# set -m: tiap proses latar mendapat process group sendiri, sehingga seluruh
# turunannya (mis. next-server di bawah bun) bisa dihentikan sekaligus.
set -m
PIDS=()

berhenti() {
  trap - INT TERM EXIT
  log "Menghentikan API dan web..."
  for pid in "${PIDS[@]}"; do
    kill -TERM -- "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
  done
  # Beri waktu berhenti dengan rapi, lalu paksa bila perlu.
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    hidup=0
    for pid in "${PIDS[@]}"; do kill -0 "$pid" 2>/dev/null && hidup=1; done
    [ "$hidup" = 0 ] && break
    sleep 0.5
  done
  for pid in "${PIDS[@]}"; do kill -KILL -- "-$pid" 2>/dev/null || true; done
  log "Selesai."
}
trap 'berhenti; exit 130' INT
trap 'berhenti; exit 143' TERM
trap berhenti EXIT

log "API  -> http://localhost:7860  (memuat model, 10-60 detik)"
(cd "$API" && exec .venv/bin/python -m app) &
PIDS+=("$!")

log "Web  -> http://localhost:3000"
(cd "$WEB" && exec bun run dev) &
PIDS+=("$!")

# Tunggu sampai salah satu berhenti (atau Ctrl+C).
while true; do
  for pid in "${PIDS[@]}"; do
    if ! kill -0 "$pid" 2>/dev/null; then
      log "Proses $pid berhenti; menghentikan yang lain."
      exit 1
    fi
  done
  sleep 1
done
