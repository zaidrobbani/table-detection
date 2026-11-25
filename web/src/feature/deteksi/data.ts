import type { ModelId } from "@/repository/prediksi/dto";

/** Teks dan konstanta halaman Demo. */

export const HERO = {
  eyebrow: "Demo · klasifikasi meja",
  title: "Deteksi kebersihan meja",
  description:
    "Unggah foto meja, potong ke permukaan meja, lalu lihat hasil Bersih atau Kotor beserta area yang paling memengaruhi keputusan model.",
} as const;

export type LangkahDeteksi = "pilih" | "crop" | "hasil";

export const LANGKAH: { id: LangkahDeteksi; label: string }[] = [
  { id: "pilih", label: "Pilih foto" },
  { id: "crop", label: "Potong" },
  { id: "hasil", label: "Hasil" },
];

export const DROPZONE = {
  judul: "Tarik foto meja ke sini",
  bantuan: "JPEG, PNG, WEBP, atau HEIC, maksimal 10 MB.",
  pilih: "Pilih foto",
  ambil: "Ambil foto",
  lepas: "Lepaskan foto untuk memilihnya",
  labelArea: "Area unggah foto meja",
} as const;

export const CONTOH = {
  label: "Atau coba contoh",
  judul: "Foto contoh dari set Testing",
  deskripsi:
    "Enam foto asli dari data uji beserta label sebenarnya. Bandingkan dengan hasil model.",
  labelAsli: "Label asli",
  gagal: "Foto contoh gagal dimuat. Periksa koneksi lalu coba lagi.",
} as const;

export const CROP = {
  label: "Langkah 2 · Potong",
  judul: "Potong ke permukaan meja",
  bantuan:
    "Model dilatih dengan foto yang hanya berisi area meja. Potong foto ke permukaan meja supaya hasilnya akurat.",
  rasio: "Rasio potongan",
  zoom: "Perbesar",
  analisis: "Analisis",
  menganalisis: "Menyiapkan...",
  lewati: "Lewati crop",
  batal: "Ganti foto",
  gagalMuat:
    "Foto ini tidak bisa ditampilkan browser untuk dipotong. Anda tetap bisa memakai Lewati crop.",
  gagalProses: "Gagal memotong foto. Coba lagi atau lewati crop.",
  heicLewati:
    "Foto HEIC tidak bisa ditampilkan di browser ini, jadi langkah potong dilewati dan foto dikirim utuh.",
  petunjukKeyboard:
    "Geser foto dengan mouse atau jari. Panah keyboard menggeser, slider mengatur zoom.",
} as const;

export interface PilihanRasio {
  id: string;
  label: string;
  /** null = ikuti rasio foto asli */
  nilai: number | null;
}

export const PILIHAN_RASIO: PilihanRasio[] = [
  { id: "asli", label: "Asli", nilai: null },
  { id: "1-1", label: "1:1", nilai: 1 },
  { id: "4-3", label: "4:3", nilai: 4 / 3 },
  { id: "3-4", label: "3:4", nilai: 3 / 4 },
];

export const ZOOM = { min: 1, maks: 4, langkah: 0.05 } as const;

export const HASIL = {
  label: "Langkah 3 · Hasil",
  judul: "Hasil deteksi",
  keyakinan: "Keyakinan",
  menganalisis: "Model sedang menganalisis foto...",
  fotoLain: "Foto lain",
  bandingkan: "Bandingkan dengan baseline",
  bandingkanBantuan:
    "Membawa foto yang sama ke halaman Bandingkan tanpa unggah ulang.",
  galatJudul: "Analisis gagal",
  galatUmum: "Gagal menganalisis foto. Coba lagi.",
  modelLabel: "Pilih model",
} as const;

export const MODEL: Record<
  ModelId,
  { label: string; singkat: string; pipeline: "P0" | "P1"; namaInput: string }
> = {
  C: {
    label: "Model C",
    singkat: "dengan CLAHE (P1)",
    pipeline: "P1",
    namaInput: "Setelah CLAHE (input model)",
  },
  B: {
    label: "Model B",
    singkat: "tanpa PCD (P0)",
    pipeline: "P0",
    namaInput: "Setelah P0 (input model)",
  },
};

export const MODEL_DEFAULT: ModelId = "C";

export const RULER = {
  judul: "Penggaris P(Kotor)",
  nilai: "P(Kotor)",
  ambang: "Ambang 0,5",
  zonaBersih: "Bersih",
  zonaKotor: "Kotor",
  /** Jumlah tick: tiap 0,1 dari 0 sampai 1 */
  langkahTick: 0.1,
} as const;

export const TRIPTYCH = {
  fotoAsli: "Foto asli",
  gradcam: "Grad-CAM",
  altFotoAsli: "Foto meja hasil potongan yang dikirim ke model",
  penjelasan:
    "Area merah adalah bagian foto yang paling memengaruhi keputusan model.",
} as const;

export const HEATMAP = {
  label: "Opasitas heatmap",
  aria: "Opasitas peta panas Grad-CAM",
} as const;

export const OPASITAS_AWAL = 100;
