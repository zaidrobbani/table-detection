/**
 * Mock FE. Hanya dipanggil dari action.ts bila API_MODE === "mock".
 * Tidak ada fallback otomatis dari backend ke sini.
 *
 * Hasil palsu: gambar input dipakai apa adanya sebagai `input_model` dan
 * `gradcam`, probabilitas diturunkan dari hash ukuran berkas supaya stabil.
 * Semua hasil ditandai `mock: true` agar UI menampilkan badge "MODE MOCK".
 */
import { fileToDataUrl } from "@/shared/util/image";
import type {
  CompareResult,
  HealthResponse,
  LabelKebersihan,
  ModelId,
  PredictResult,
} from "./dto";

const tunggu = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const mockHealth = async (): Promise<HealthResponse> => {
  await tunggu(150);
  return { status: "ok", models: ["B", "C"], tensorflow: "mock", warm: true };
};

const probPalsu = (file: Blob, model: ModelId) => {
  const dasar = ((file.size * 2654435761) % 1000) / 1000; // 0..1 stabil
  const geser = model === "C" ? 0.05 : 0;
  return Math.min(0.97, Math.max(0.03, dasar * 0.9 + 0.05 + geser));
};

const buat = async (file: Blob, model: ModelId): Promise<PredictResult> => {
  const dataUrl = await fileToDataUrl(file);
  const prob = probPalsu(file, model);
  const label: LabelKebersihan = prob >= 0.5 ? "Kotor" : "Bersih";
  return {
    model,
    pipeline: model === "C" ? "P1" : "P0",
    label,
    prob_kotor: prob,
    confidence: label === "Kotor" ? prob : 1 - prob,
    threshold: 0.5,
    images: { input_model: dataUrl, gradcam: dataUrl },
    latency_ms: 0,
    mock: true,
  };
};

export const mockPredict = async (
  file: Blob,
  model: ModelId,
): Promise<PredictResult> => {
  await tunggu(500);
  return buat(file, model);
};

export const mockCompare = async (file: Blob): Promise<CompareResult> => {
  await tunggu(700);
  const [B, C] = await Promise.all([buat(file, "B"), buat(file, "C")]);
  return { B, C, sepakat: B.label === C.label, mock: true };
};
