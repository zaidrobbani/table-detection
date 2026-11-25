"use client";

import { IconPhotoX } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";

interface FotoPratinjauProps {
  /** Data URL / URL foto */
  src: string;
  alt: string;
  sizes?: string;
  /** Teks pengganti bila browser tidak bisa menampilkan foto (mis. HEIC) */
  pesanGagal?: string;
}

const PESAN_DEFAULT =
  "Pratinjau tidak tersedia: browser ini tidak bisa menampilkan format foto ini (misalnya HEIC). Foto tetap dikirim ke model.";

/**
 * Foto pengisi FigureFrame (`fill`). Bila browser gagal mendekode gambar
 * (umumnya HEIC/HEIF di Chrome/Firefox), tampilkan placeholder alih-alih
 * ikon gambar rusak.
 */
const FotoPratinjau = ({
  src,
  alt,
  sizes = "(min-width: 1024px) 400px, 100vw",
  pesanGagal = PESAN_DEFAULT,
}: FotoPratinjauProps) => {
  const [gagalUntuk, setGagalUntuk] = useState<string | null>(null);

  if (gagalUntuk === src) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
        <IconPhotoX aria-hidden="true" className="size-7 text-ink-muted" />
        <p className="max-w-60 text-ink-muted text-xs leading-snug">
          {pesanGagal}
        </p>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      className="object-contain"
      onError={() => setGagalUntuk(src)}
    />
  );
};

export default FotoPratinjau;
