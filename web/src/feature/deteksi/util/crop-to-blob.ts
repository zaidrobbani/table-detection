import { MAX_UPLOAD_BYTES } from "@/schemas/prediksi/upload.schema";

/** Area crop dalam piksel gambar asli (sama dengan Area react-easy-crop). */
export interface AreaCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Batas sisi terpanjang hasil crop. Aman karena model tetap di-resize ke 224.
 * Bila PNG masih melebihi batas upload, turun ke ukuran berikutnya.
 */
const BATAS_SISI = [2048, 1600, 1200, 900] as const;

interface GambarTerbuka {
  sumber: CanvasImageSource;
  lebar: number;
  tinggi: number;
  tutup: () => void;
}

/** Buka gambar dengan orientasi EXIF sudah diterapkan. */
async function bukaGambar(file: Blob): Promise<GambarTerbuka> {
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    return {
      sumber: bitmap,
      lebar: bitmap.width,
      tinggi: bitmap.height,
      tutup: () => bitmap.close(),
    };
  } catch {
    // Cadangan: <img> (browser modern menerapkan EXIF sendiri).
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return {
        sumber: img,
        lebar: img.naturalWidth,
        tinggi: img.naturalHeight,
        tutup: () => URL.revokeObjectURL(url),
      };
    } catch {
      URL.revokeObjectURL(url);
      throw new Error(
        "Foto tidak bisa dibaca browser. Coba format JPEG, PNG, atau WEBP.",
      );
    }
  }
}

const keBlobPng = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Gagal membuat gambar hasil potongan.")),
      "image/png",
    );
  });

/**
 * Potong `file` ke `area` (piksel gambar asli; null = seluruh gambar) dan
 * kembalikan PNG. Sisi terpanjang dibatasi 2048 px (lalu 1600 px bila hasil
 * masih lebih dari 10 MB).
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
      terakhir = await keBlobPng(canvas);
      if (terakhir.size <= MAX_UPLOAD_BYTES) return terakhir;
    }
    return terakhir as Blob;
  } finally {
    gambar.tutup();
  }
}
