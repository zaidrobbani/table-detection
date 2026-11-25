"use client";

import { IconCamera, IconPhotoUp, IconUpload } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ACCEPT_GAMBAR } from "@/schemas/prediksi/upload.schema";
import { DROPZONE } from "../data";

interface UploadDropzoneProps {
  /** Dipanggil dengan daftar berkas mentah; validasi dilakukan pemanggil. */
  onPilih: (daftar: ArrayLike<File>) => void;
  disabled?: boolean;
  /** Tampilan ringkas untuk halaman Bandingkan */
  ringkas?: boolean;
  className?: string;
}

/**
 * Area unggah: drag & drop, "Pilih foto", dan "Ambil foto" (kamera belakang
 * di ponsel).
 */
const UploadDropzone = ({
  onPilih,
  disabled = false,
  ringkas = false,
  className,
}: UploadDropzoneProps) => {
  const inputGaleri = useRef<HTMLInputElement>(null);
  const inputKamera = useRef<HTMLInputElement>(null);
  const [menyeret, setMenyeret] = useState(false);

  const tangani = (daftar: FileList | null) => {
    if (daftar && daftar.length > 0) onPilih(daftar);
  };

  return (
    <section
      aria-label={DROPZONE.labelArea}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setMenyeret(true);
      }}
      onDragLeave={(e) => {
        // Abaikan dragleave ke elemen anak
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setMenyeret(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setMenyeret(false);
        if (!disabled) tangani(e.dataTransfer.files);
      }}
      className={cn(
        "flex flex-col items-center gap-4 rounded-md border-2 border-rule-strong border-dashed bg-paper-sunken px-4 text-center transition-colors duration-150",
        ringkas ? "py-6" : "py-10 sm:py-14",
        menyeret && "border-brand bg-brand-subtle",
        disabled && "opacity-60",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-md border border-rule bg-paper-raised text-ink-muted"
      >
        {menyeret ? (
          <IconPhotoUp className="size-6" />
        ) : (
          <IconUpload className="size-6" />
        )}
      </span>
      <div className="max-w-sm">
        <p className="font-heading font-semibold text-lg leading-snug">
          {menyeret ? DROPZONE.lepas : DROPZONE.judul}
        </p>
        <p className="mt-1 text-ink-muted text-sm">{DROPZONE.bantuan}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          size="lg"
          disabled={disabled}
          onClick={() => inputGaleri.current?.click()}
        >
          <IconPhotoUp aria-hidden="true" data-icon="inline-start" />
          {DROPZONE.pilih}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          disabled={disabled}
          onClick={() => inputKamera.current?.click()}
        >
          <IconCamera aria-hidden="true" data-icon="inline-start" />
          {DROPZONE.ambil}
        </Button>
      </div>
      <input
        ref={inputGaleri}
        type="file"
        accept={ACCEPT_GAMBAR}
        className="sr-only"
        tabIndex={-1}
        aria-label={DROPZONE.pilih}
        onChange={(e) => {
          tangani(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={inputKamera}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-label={DROPZONE.ambil}
        onChange={(e) => {
          tangani(e.target.files);
          e.target.value = "";
        }}
      />
    </section>
  );
};

export default UploadDropzone;
