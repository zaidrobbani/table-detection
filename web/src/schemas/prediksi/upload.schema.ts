import { z } from "zod";

export const MAX_UPLOAD_MB = 10;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export const TIPE_GAMBAR_DIDUKUNG = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

/** Untuk atribut `accept` pada input file. */
export const ACCEPT_GAMBAR = [
  ...TIPE_GAMBAR_DIDUKUNG,
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
].join(",");

export const uploadSchema = z
  .instanceof(Blob, { message: "Pilih satu foto terlebih dahulu." })
  .refine(
    (file) =>
      (TIPE_GAMBAR_DIDUKUNG as readonly string[]).includes(file.type) ||
      // Beberapa browser tidak mengisi MIME untuk HEIC; andalkan ekstensi.
      (file.type === "" &&
        file instanceof File &&
        /\.(heic|heif)$/i.test(file.name)),
    "Tipe berkas tidak didukung. Gunakan JPEG, PNG, WEBP, atau HEIC.",
  )
  .refine(
    (file) => file.size <= MAX_UPLOAD_BYTES,
    `Ukuran foto melebihi batas ${MAX_UPLOAD_MB} MB.`,
  )
  .refine((file) => file.size > 0, "Berkas kosong.");

export type UploadInput = z.infer<typeof uploadSchema>;

/** Kembalikan pesan error Indonesia, atau null bila berkas valid. */
export const validasiUpload = (file: Blob): string | null => {
  const hasil = uploadSchema.safeParse(file);
  return hasil.success
    ? null
    : (hasil.error.issues[0]?.message ?? "Berkas tidak valid.");
};
