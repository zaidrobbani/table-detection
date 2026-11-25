/** Teks dan konstanta halaman Bandingkan. */

export const HERO = {
  eyebrow: "Bandingkan · P0 dan P1",
  title: "Bandingkan dua model pada foto yang sama",
  description:
    "Model B menerima foto tanpa pra-pemrosesan (P0). Model C menerima foto yang sudah diperbaiki kontrasnya dengan CLAHE (P1). Foto yang sama dikirim ke keduanya.",
} as const;

export const PILIH_FOTO = {
  label: "Pilih foto",
  judul: "Belum ada foto untuk dibandingkan",
  deskripsi:
    "Unggah foto meja atau pakai salah satu contoh. Untuk memotong foto ke area meja lebih dulu, mulai dari halaman Demo.",
  kembali: "Kembali ke Demo",
} as const;

export const FOTO = {
  judul: "Foto uji",
  alt: "Foto meja yang dibandingkan oleh kedua model",
  gantiFoto: "Ganti foto",
  menunggu: "Kedua model sedang menganalisis foto...",
  galatJudul: "Perbandingan gagal",
  galatUmum: "Gagal membandingkan model. Coba lagi.",
} as const;

export const KESEPAKATAN = {
  sepakat: "Kedua model sepakat",
  berbeda: "Model berbeda pendapat",
} as const;

export const KOLOM = {
  B: {
    id: "B",
    judul: "B: tanpa PCD (P0)",
    tab: "B · P0",
    namaInput: "Input model P0",
  },
  C: {
    id: "C",
    judul: "C: dengan CLAHE (P1)",
    tab: "C · P1",
    namaInput: "Input model P1 (CLAHE)",
  },
} as const;

export const KOLOM_TEKS = {
  probabilitas: "P(Kotor)",
  latensi: "Latensi",
  gradcam: "Grad-CAM",
  aria: "Hasil model",
  tabAria: "Pilih model yang ditampilkan",
} as const;

export const PEMBANDING = {
  label: "Perbandingan visual",
  judul: "Geser untuk membandingkan P0 dan P1",
  deskripsi:
    "Kiri adalah input P0 (tanpa PCD), kanan adalah input P1 (setelah CLAHE). Geser handle dengan mouse, jari, atau panah keyboard.",
  sebelum: "P0",
  sesudah: "P1 (CLAHE)",
  aria: "Posisi pembanding antara input P0 dan P1",
  altSebelum: "Input model B setelah P0, tanpa pra-pemrosesan",
  altSesudah: "Input model C setelah P1, dengan CLAHE",
} as const;
