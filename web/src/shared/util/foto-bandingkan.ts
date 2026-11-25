/**
 * Serah-terima foto dari halaman Demo ke halaman Bandingkan tanpa upload ulang.
 * Foto disimpan sebagai data URL di sessionStorage. Bila kuota penuh atau
 * storage tidak tersedia, jatuh ke penyimpanan memori modul (hilang saat
 * halaman dimuat ulang, tetapi tidak membuat aplikasi crash).
 */

export const KEY_FOTO_BANDINGKAN = "meja-bersih:foto-bandingkan";

let fotoMemori: string | null = null;

/** Simpan foto. Mengembalikan "session" atau "memori" sesuai tempat simpan. */
export function simpanFotoBandingkan(dataUrl: string): "session" | "memori" {
  try {
    window.sessionStorage.setItem(KEY_FOTO_BANDINGKAN, dataUrl);
    fotoMemori = null;
    return "session";
  } catch {
    // Kuota habis atau storage diblokir: simpan di memori.
    fotoMemori = dataUrl;
    try {
      window.sessionStorage.removeItem(KEY_FOTO_BANDINGKAN);
    } catch {
      // Abaikan: storage memang tidak bisa diakses.
    }
    return "memori";
  }
}

/** Baca foto tersimpan, atau null bila tidak ada. */
export function bacaFotoBandingkan(): string | null {
  if (fotoMemori) return fotoMemori;
  try {
    return window.sessionStorage.getItem(KEY_FOTO_BANDINGKAN);
  } catch {
    return null;
  }
}

/** Hapus foto tersimpan di kedua tempat. */
export function hapusFotoBandingkan(): void {
  fotoMemori = null;
  try {
    window.sessionStorage.removeItem(KEY_FOTO_BANDINGKAN);
  } catch {
    // Abaikan.
  }
}
