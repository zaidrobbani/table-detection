/**
 * Tipe data eksperimen. Semua angka berasal dari berkas sumber di
 * web/scripts/source lewat scripts/build-eksperimen-data.ts.
 * Nilai `null` berarti "data belum tersedia" dan UI harus menampilkan state
 * kosong yang jujur (jangan mengarang angka).
 */

export type ModelKey = "B" | "C";
export type SplitKey = "Testing" | "Validation";
export type KelasKey = "Bersih" | "Kotor";

/** Metrik satu model pada satu split. Field per kelas null bila tidak ada di sumber. */
export interface MetrikSplit {
  model: ModelKey;
  /** P0 untuk B, P1 untuk C */
  variant: "P0" | "P1";
  split: SplitKey;
  n_samples: number;
  accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  precision_bersih: number | null;
  recall_bersih: number | null;
  f1_bersih: number | null;
  precision_kotor: number | null;
  recall_kotor: number | null;
  f1_kotor: number | null;
  roc_auc: number | null;
}

export type NamaMetrik =
  | "accuracy"
  | "precision_macro"
  | "recall_macro"
  | "f1_macro";

export interface MetricsData {
  /** Berkas sumber yang dipakai */
  sumber: string[];
  /** Catatan kejujuran data (mis. validation C belum ada) */
  catatan: string[];
  Testing: { B: MetrikSplit; C: MetrikSplit };
  Validation: { B: MetrikSplit | null; C: MetrikSplit | null };
}

/** Matriks 2x2: baris = kelas sebenarnya, kolom = prediksi. Urutan [Bersih, Kotor]. */
export interface Confusion {
  model: ModelKey;
  split: SplitKey;
  n: number;
  /** matrix[aktual][prediksi]; mis. matrix[0][1] = Bersih diprediksi Kotor */
  matrix: [[number, number], [number, number]];
  /** Jumlah citra per kelas sebenarnya: [Bersih, Kotor] */
  total_per_kelas: [number, number];
  /** true bila diturunkan dari recall per kelas, bukan dihitung dari prediksi per citra */
  turunan: boolean;
  /** Penjelasan asal angka */
  sumber: string;
}

export interface ConfusionData {
  labels: [KelasKey, KelasKey];
  Testing: { B: Confusion; C: Confusion };
  Validation: { B: Confusion | null; C: Confusion | null };
}

/** Uji McNemar B (P0) vs C (P1) pada Testing, plus selisih F1 macro dan CI95 bootstrap. */
export interface StatsData {
  split: "Testing";
  n: number;
  /** keduanya benar */
  n11: number;
  /** B benar, C salah */
  n10_B_benar_C_salah: number;
  /** B salah, C benar */
  n01_B_salah_C_benar: number;
  /** keduanya salah */
  n00: number;
  p_mcnemar: number;
  delta_f1_macro: number;
  ci95_low: number;
  ci95_high: number;
  sumber: string;
  /** Baris mentah statistik_p0_vs_p1.csv bila berkas itu ada nanti */
  tambahan: Record<string, string | number>[] | null;
}

/** Satu epoch riwayat training. */
export interface HistoryPoint {
  epoch: number;
  accuracy: number;
  loss: number;
  precision: number;
  recall: number;
  val_accuracy: number;
  val_loss: number;
  val_precision: number;
  val_recall: number;
}

export interface HistoryData {
  /** Epoch pertama tahap 2 (fine-tuning), dari epochs_stage1 + 1 */
  tahap2_mulai_epoch: number;
  epochs_total: number;
  B: HistoryPoint[] | null;
  /** null sampai C/training_history.csv ada */
  C: HistoryPoint[] | null;
  sumber: string[];
}

export interface ClaheParameter {
  output_size: number;
  padding_rgb: [number, number, number];
  clahe_clip_limit: number;
  clahe_tile_grid: [number, number];
  ruang_warna: string;
}

export interface ClaheRow {
  [kolom: string]: string | number;
}

/** Efek CLAHE. `tabel` dan `figur` null sampai berkas notebook tersedia. */
export interface ClaheData {
  parameter: ClaheParameter;
  /** Baris dari perbandingan_B_vs_C.csv bila ada */
  tabel: ClaheRow[] | null;
  /** Path publik figur P0 vs P1, mis. /figures/C/visual_p0_vs_p1.png */
  figur: string | null;
  sumber: string[];
}

export interface SampleItem {
  file: string;
  /** Path publik, mis. /samples/F_028_B_A_Crop.jpg */
  url: string;
  /** Label sebenarnya (dari samples.json) */
  label: KelasKey;
  /** P(Kotor) model B dari predictions_testing.csv, null bila tidak ditemukan */
  prob_kotor_B: number | null;
  /** P(Kotor) model C, null sampai C/predictions_testing.csv ada */
  prob_kotor_C: number | null;
}

export interface SamplesData {
  samples: SampleItem[];
}

/** Hasil Eksperimen A (ML klasik). Berkasnya null sampai data dari Fahry masuk. */
export interface EksperimenAItem {
  nama: string;
  fitur: string;
  accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  n_samples: number;
  split: SplitKey;
}

export interface EksperimenAData {
  items: EksperimenAItem[];
  sumber: string;
}

export type KelompokFigur = "training" | "confusion" | "gradcam" | "clahe";

export interface FigureItem {
  id: string;
  judul: string;
  caption: string;
  /** Path publik, mis. /figures/B/training_curve.png */
  src: string;
  kelompok: KelompokFigur;
  model: ModelKey | "B_vs_C";
}

export interface FigureMissing {
  id: string;
  judul: string;
  kelompok: KelompokFigur;
  nama_file: string;
}

export interface FiguresData {
  /** Figur yang berkasnya ada di public/figures */
  tersedia: FigureItem[];
  /** Figur yang diharapkan tetapi belum ada (untuk state kosong jujur) */
  belum_ada: FigureMissing[];
}
