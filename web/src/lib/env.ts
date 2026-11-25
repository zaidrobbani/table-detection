/**
 * Satu-satunya pintu akses env. Komponen/hook tidak boleh membaca
 * process.env langsung.
 */

export const BASE_API_URL = (
  process.env.NEXT_PUBLIC_BASE_API_URL ?? "http://localhost:7860"
).replace(/\/+$/, "");

/**
 * Sumber hasil prediksi:
 * - "backend" : selalu memanggil backend FastAPI (default).
 * - "mock"    : hasil palsu dari FE; UI wajib menampilkan badge "MODE MOCK".
 * Tidak ada fallback otomatis dari backend ke mock.
 */
export type ApiMode = "backend" | "mock";

export const API_MODE: ApiMode =
  process.env.NEXT_PUBLIC_API_MODE === "mock" ? "mock" : "backend";

export const isMockApi = () => API_MODE === "mock";

/** Batas waktu permintaan prediksi (cold start HF Space bisa lama). */
export const API_TIMEOUT_MS = 60_000;

/** URL situs untuk metadataBase / OpenGraph. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
