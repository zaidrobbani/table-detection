import Image from "next/image";
import type React from "react";
import { cn } from "@/lib/utils";

interface FigureFrameProps {
  /** Nomor gambar, tampil sebagai "GAMBAR n" */
  number: number;
  /** Judul pendek kapital setelah nomor, mis. "Grad-CAM" */
  title: string;
  /** Teks alternatif wajib bila memakai `src` */
  alt?: string;
  /** Sumber gambar (path publik atau data URL). Abaikan bila memakai children. */
  src?: string;
  /** Rasio bingkai, default persegi */
  aspect?: "square" | "4/3" | "3/2" | "16/9" | "auto";
  /** Isi kustom (mis. gambar bertumpuk + slider); menggantikan `src`. */
  children?: React.ReactNode;
  /** Keterangan di bawah label caption */
  caption?: React.ReactNode;
  /** object-fit untuk `src` */
  fit?: "contain" | "cover";
  /** Untuk gambar besar di atas lipatan */
  priority?: boolean;
  className?: string;
}

const ASPECT: Record<NonNullable<FigureFrameProps["aspect"]>, string> = {
  square: "aspect-square",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "16/9": "aspect-video",
  auto: "",
};

/**
 * Figur berbingkai tipis dengan caption bernomor:
 * "GAMBAR 2 · GRAD-CAM" + keterangan.
 */
const FigureFrame = ({
  number,
  title,
  alt,
  src,
  aspect = "square",
  children,
  caption,
  fit = "contain",
  priority = false,
  className,
}: FigureFrameProps) => (
  <figure className={cn("flex min-w-0 flex-col gap-2", className)}>
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-md border border-rule bg-paper-sunken",
        ASPECT[aspect],
      )}
    >
      {children ??
        (src ? (
          <Image
            src={src}
            alt={alt ?? title}
            fill
            unoptimized
            priority={priority}
            sizes="(min-width: 1024px) 400px, 100vw"
            className={fit === "cover" ? "object-cover" : "object-contain"}
          />
        ) : null)}
    </div>
    <figcaption className="flex flex-col gap-0.5">
      <span className="label-caps">
        Gambar {number} · {title}
      </span>
      {caption ? (
        <span className="text-ink-muted text-sm leading-snug">{caption}</span>
      ) : null}
    </figcaption>
  </figure>
);

export default FigureFrame;
