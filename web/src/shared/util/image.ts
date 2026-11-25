import {
  MAX_KIRIM_BYTES,
  MAX_KIRIM_MB,
} from "@/schemas/prediksi/upload.schema";

/** Baca File/Blob menjadi data URL (base64). */
export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal membaca berkas gambar."));
    reader.readAsDataURL(file);
  });
}

/** Ubah data URL menjadi Blob tanpa fetch (aman untuk sessionStorage). */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64 = ""] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(header ?? "")?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** Ubah data URL menjadi File (nama diberikan). */
export function dataUrlToFile(dataUrl: string, name: string): File {
  const blob = dataUrlToBlob(dataUrl);
  return new File([blob], name, { type: blob.type });
}

export interface GambarTerbuka {
  sumber: CanvasImageSource;
  lebar: number;
  tinggi: number;
  tutup: () => void;
}

/** Buka gambar dengan orientasi EXIF sudah diterapkan. */
export async function bukaGambar(file: Blob): Promise<GambarTerbuka> {
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

export const canvasKeBlob = (
  canvas: HTMLCanvasElement,
  tipe: "image/png" | "image/jpeg",
  kualitas?: number,
) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Gagal membuat gambar hasil olahan.")),
      tipe,
      kualitas,
    );
  });

/** Langkah pengecilan: sisi terpanjang (px) dan kualitas JPEG. */
const LANGKAH_KECIL = [
  { sisi: 2048, kualitas: 0.92 },
  { sisi: 1600, kualitas: 0.85 },
  { sisi: 1200, kualitas: 0.8 },
] as const;

const pesanTerlaluBesar = `Foto lebih dari ${MAX_KIRIM_MB} MB dan tidak bisa diperkecil di browser ini (mis. HEIC). Pakai foto JPEG/PNG atau foto yang lebih kecil.`;

/**
 * Pastikan berkas yang dikirim ke API tidak melebihi 4 MB (batas body Vercel
 * Functions 4,5 MB). Berkas <= 4 MB dikirim apa adanya (paritas dengan foto
 * contoh). Yang lebih besar didekode (orientasi EXIF diterapkan), dikecilkan
 * ke sisi terpanjang 2048 px lalu di-encode JPEG 0,92; bila masih terlalu
 * besar turun ke 1600 px/0,85 dan 1200 px/0,8. Model tetap me-resize ke 224 px
 * jadi akurasi tidak terpengaruh.
 */
export async function siapkanUnggahan(berkas: Blob): Promise<Blob> {
  if (berkas.size <= MAX_KIRIM_BYTES) return berkas;

  let gambar: GambarTerbuka;
  try {
    gambar = await bukaGambar(berkas);
  } catch {
    throw new Error(pesanTerlaluBesar);
  }
  try {
    let terakhir: Blob | null = null;
    for (const { sisi, kualitas } of LANGKAH_KECIL) {
      const skala = Math.min(1, sisi / Math.max(gambar.lebar, gambar.tinggi));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(gambar.lebar * skala));
      canvas.height = Math.max(1, Math.round(gambar.tinggi * skala));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Browser tidak mendukung canvas.");
      // JPEG tidak punya alfa: latar putih agar PNG transparan tidak menjadi hitam.
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(gambar.sumber, 0, 0, canvas.width, canvas.height);
      terakhir = await canvasKeBlob(canvas, "image/jpeg", kualitas);
      if (terakhir.size <= MAX_KIRIM_BYTES) return terakhir;
    }
    throw new Error(
      `Foto tetap lebih dari ${MAX_KIRIM_MB} MB setelah diperkecil. Pakai foto yang lebih kecil.`,
    );
  } finally {
    gambar.tutup();
  }
}
