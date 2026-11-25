import { validasiUpload } from "@/schemas/prediksi/upload.schema";

export type HasilPilihFile = { file: File } | { galat: string };

/**
 * Ambil satu berkas dari daftar (input file atau drag & drop) lalu validasi
 * tipe dan ukurannya. Bila lebih dari satu, berkas pertama yang dipakai.
 */
export function pilihFileTunggal(
  daftar: ArrayLike<File> | null | undefined,
): HasilPilihFile {
  const file = daftar && daftar.length > 0 ? daftar[0] : undefined;
  if (!file) return { galat: "Pilih satu foto terlebih dahulu." };
  const galat = validasiUpload(file);
  return galat ? { galat } : { file };
}

/** HEIC/HEIF (foto iPhone) dikenali dari MIME atau ekstensi. */
export function isHeic(file: File): boolean {
  return (
    /^image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)
  );
}

/**
 * Cek apakah browser bisa mendekode gambar ini (Chrome/Firefox tidak bisa
 * HEIC; Safari bisa). Dipakai untuk memutuskan apakah langkah crop mungkin.
 */
export async function bisaDitampilkan(file: Blob): Promise<boolean> {
  if (typeof createImageBitmap !== "function") return true;
  try {
    const bitmap = await createImageBitmap(file);
    bitmap.close();
    return true;
  } catch {
    return false;
  }
}
