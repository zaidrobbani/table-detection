import { MAX_KIRIM_BYTES } from "@/schemas/prediksi/upload.schema";
import { bukaGambar, canvasKeBlob } from "@/shared/util/image";

/** Area crop dalam piksel gambar asli (sama dengan Area react-easy-crop). */
export interface AreaCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Batas sisi terpanjang hasil crop. Aman karena model tetap di-resize ke 224.
 * Bila hasil masih melebihi batas kirim (4 MB), turun ke ukuran berikutnya.
 */
const BATAS_SISI = [2048, 1600, 1200, 900] as const;

/** Kualitas JPEG cadangan bila PNG melebihi batas kirim. */
const KUALITAS_JPEG = 0.95;

/**
 * Potong `file` ke `area` (piksel gambar asli; null = seluruh gambar).
 * Hasil PNG (tanpa kehilangan) dengan sisi terpanjang <= 2048 px. Bila PNG
 * lebih dari 4 MB (batas body Vercel), ukuran piksel yang sama dicoba sebagai
 * JPEG 0,95 sebelum sisi diperkecil ke 1600/1200/900 px.
 */
export async function cropKeBlob(
  file: Blob,
  area: AreaCrop | null,
): Promise<Blob> {
  const gambar = await bukaGambar(file);
  try {
    const x = Math.max(0, Math.round(area?.x ?? 0));
    const y = Math.max(0, Math.round(area?.y ?? 0));
    const lebar = Math.min(
      gambar.lebar - x,
      Math.round(area?.width ?? gambar.lebar),
    );
    const tinggi = Math.min(
      gambar.tinggi - y,
      Math.round(area?.height ?? gambar.tinggi),
    );
    if (lebar < 1 || tinggi < 1) {
      throw new Error("Area potongan tidak valid.");
    }

    let terakhir: Blob | null = null;
    for (const batas of BATAS_SISI) {
      const skala = Math.min(1, batas / Math.max(lebar, tinggi));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(lebar * skala));
      canvas.height = Math.max(1, Math.round(tinggi * skala));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Browser tidak mendukung canvas.");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        gambar.sumber,
        x,
        y,
        lebar,
        tinggi,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      terakhir = await canvasKeBlob(canvas, "image/png");
      if (terakhir.size <= MAX_KIRIM_BYTES) return terakhir;
      terakhir = await canvasKeBlob(canvas, "image/jpeg", KUALITAS_JPEG);
      if (terakhir.size <= MAX_KIRIM_BYTES) return terakhir;
    }
    return terakhir as Blob;
  } finally {
    gambar.tutup();
  }
}
