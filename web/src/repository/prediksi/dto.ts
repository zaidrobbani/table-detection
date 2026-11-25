export type ModelId = "B" | "C";
export type PipelineId = "P0" | "P1";
export type LabelKebersihan = "Bersih" | "Kotor";

/** GET /health */
export interface HealthResponse {
  status: "ok";
  models: ModelId[];
  tensorflow: string;
  /** true setelah model dimuat dan warmup selesai */
  warm: boolean;
}

/** Hasil prediksi satu model (POST /predict, dan isi /compare). */
export interface PredictResult {
  model: ModelId;
  pipeline: PipelineId;
  label: LabelKebersihan;
  /** P(Kotor), 0..1 */
  prob_kotor: number;
  /** Keyakinan pada label terpilih (0.5..1) */
  confidence: number;
  threshold: number;
  images: {
    /** Gambar 224x224 yang benar-benar masuk model (P0 atau P1), data URL PNG */
    input_model: string;
    /** Overlay Grad-CAM, data URL PNG */
    gradcam: string;
  };
  latency_ms: number;
  /**
   * Hanya diisi oleh mock FE. Respons backend tidak memiliki field ini.
   * UI menampilkan badge "MODE MOCK" bila true.
   */
  mock?: true;
}

/** POST /compare */
export interface CompareResult {
  B: PredictResult;
  C: PredictResult;
  /** true bila label B dan C sama */
  sepakat: boolean;
  /** Hanya mock FE. */
  mock?: true;
}

/** Bentuk error backend: { detail: "pesan Indonesia" } */
export interface ErrorResponse {
  detail: string;
}

export interface PostPredictPayload {
  file: Blob;
  model: ModelId;
}

export interface PostComparePayload {
  file: Blob;
}
