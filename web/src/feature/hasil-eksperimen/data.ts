import type { MetrikSplit, NamaMetrik } from "@/repository/eksperimen/dto";

/** Kunci metrik numerik pada MetrikSplit. */
export type KunciMetrik = NamaMetrik | KunciMetrikKelas | "roc_auc";

type KunciMetrikKelas =
  | "precision_bersih"
  | "recall_bersih"
  | "f1_bersih"
  | "precision_kotor"
  | "recall_kotor"
  | "f1_kotor";

export interface DefinisiMetrik {
  key: KunciMetrik & keyof MetrikSplit;
  /** Label lengkap untuk tabel */
  label: string;
  /** Label ringkas untuk sumbu grafik */
  singkat: string;
  kelompok: "Keseluruhan" | "Macro" | "Bersih" | "Kotor";
}

/** Urutan baris metrik Testing (dipakai tabel dan grafik). */
export const METRIK_TESTING: DefinisiMetrik[] = [
  {
    key: "accuracy",
    label: "Accuracy",
    singkat: "Accuracy",
    kelompok: "Keseluruhan",
  },
  {
    key: "precision_macro",
    label: "Precision macro",
    singkat: "Precision (macro)",
    kelompok: "Macro",
  },
  {
    key: "recall_macro",
    label: "Recall macro",
    singkat: "Recall (macro)",
    kelompok: "Macro",
  },
  {
    key: "f1_macro",
    label: "F1 macro",
    singkat: "F1 (macro)",
    kelompok: "Macro",
  },
  {
    key: "precision_bersih",
    label: "Precision kelas Bersih",
    singkat: "Precision (Bersih)",
    kelompok: "Bersih",
  },
  {
    key: "recall_bersih",
    label: "Recall kelas Bersih",
    singkat: "Recall (Bersih)",
    kelompok: "Bersih",
  },
  {
    key: "f1_bersih",
    label: "F1 kelas Bersih",
    singkat: "F1 (Bersih)",
    kelompok: "Bersih",
  },
  {
    key: "precision_kotor",
    label: "Precision kelas Kotor",
    singkat: "Precision (Kotor)",
    kelompok: "Kotor",
  },
  {
    key: "recall_kotor",
    label: "Recall kelas Kotor",
    singkat: "Recall (Kotor)",
    kelompok: "Kotor",
  },
  {
    key: "f1_kotor",
    label: "F1 kelas Kotor",
    singkat: "F1 (Kotor)",
    kelompok: "Kotor",
  },
  {
    key: "roc_auc",
    label: "ROC AUC",
    singkat: "ROC AUC",
    kelompok: "Keseluruhan",
  },
];

/** Metrik macro yang tersedia di Validation. */
export const METRIK_VALIDATION: DefinisiMetrik[] = METRIK_TESTING.filter(
  (m) => m.kelompok === "Macro" || m.key === "accuracy",
);

export const NAMA_MODEL = {
  B: "B · tanpa PCD (P0)",
  C: "C · CLAHE (P1)",
} as const;

export const BERKAS_REBUILD =
  "Jalankan ulang Rapikan_Folder_DL.ipynb lalu `bun run build:data`.";

/** Daftar isi halaman. id harus sama dengan id SectionCard. */
export const DAFTAR_ISI = [
  { id: "ringkasan", label: "Ringkasan" },
  { id: "metrik", label: "Metrik" },
  { id: "confusion", label: "Confusion matrix" },
  { id: "uji-statistik", label: "Uji statistik" },
  { id: "kurva-training", label: "Kurva training" },
  { id: "efek-clahe", label: "Efek CLAHE" },
  { id: "galeri", label: "Galeri figur" },
  { id: "eksperimen-a", label: "Eksperimen A" },
  { id: "metode", label: "Metode" },
] as const;

/** Komposisi dataset (dari spesifikasi proyek). */
export const DATASET = {
  total: 804,
  baris: [
    { split: "Training", n: 698, keterangan: "termasuk 454 citra sintetis" },
    { split: "Validation", n: 52, keterangan: "citra primer" },
    { split: "Testing", n: 54, keterangan: "citra primer" },
  ],
} as const;

/** Hyperparameter (sumber: scripts/source/C/config_eksperimen_C.json, sama untuk B dan C). */
export const HYPERPARAMETER = [
  { nama: "Seed", nilai: "42" },
  { nama: "Batch size", nilai: "16" },
  { nama: "Learning rate", nilai: "1e-4" },
  { nama: "Dropout", nilai: "0,2" },
  { nama: "Epoch tahap 1 (backbone beku)", nilai: "15" },
  { nama: "Epoch total", nilai: "25" },
  { nama: "Patience (early stopping)", nilai: "4" },
  { nama: "Ambang keputusan", nilai: "0,5" },
] as const;
