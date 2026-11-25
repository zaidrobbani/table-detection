"use client";

import { IconX, IconZoomIn } from "@tabler/icons-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FigureFrame from "@/shared/component/FigureFrame";

interface FigureLightboxProps {
  number: number;
  title: string;
  src: string;
  alt: string;
  caption?: string;
}

/**
 * Figur dengan thumbnail yang bisa diperbesar (dialog shadcn). Esc dan tombol
 * "Tutup" menutup dialog; fokus dikembalikan ke thumbnail.
 */
const FigureLightbox = ({
  number,
  title,
  src,
  alt,
  caption,
}: FigureLightboxProps) => (
  <Dialog>
    <FigureFrame number={number} title={title} aspect="4/3" caption={caption}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Perbesar gambar ${number}: ${title}`}
          className="group absolute inset-0 cursor-zoom-in"
        >
          <Image
            src={src}
            alt={alt}
            fill
            unoptimized
            sizes="(min-width: 1024px) 380px, 100vw"
            className="object-contain"
          />
          <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md border border-rule bg-paper-raised px-2 py-1 text-ink text-xs opacity-90 transition-opacity group-hover:opacity-100">
            <IconZoomIn aria-hidden="true" className="size-3.5" />
            Perbesar
          </span>
        </button>
      </DialogTrigger>
    </FigureFrame>
    <DialogContent
      showCloseButton={false}
      className="max-h-[92dvh] sm:max-w-5xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-caps mb-1">
            Gambar {number} · {title}
          </p>
          <DialogTitle className="font-heading text-base">{title}</DialogTitle>
          <DialogDescription className="mt-1">
            {caption ?? alt}
          </DialogDescription>
        </div>
        <DialogClose asChild>
          <Button type="button" variant="outline" size="sm">
            <IconX aria-hidden="true" data-icon="inline-start" />
            Tutup
          </Button>
        </DialogClose>
      </div>
      <div className="relative h-[68dvh] w-full overflow-hidden rounded-md border border-rule bg-paper-sunken">
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes="100vw"
          className="object-contain"
        />
      </div>
    </DialogContent>
  </Dialog>
);

export default FigureLightbox;
