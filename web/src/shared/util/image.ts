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
