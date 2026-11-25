"use client";

import { IconLoader2 } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getSamples } from "@/repository/eksperimen/action";
import StatusLabel from "@/shared/component/StatusLabel";
import { CONTOH } from "../data";

interface SampleStripProps {
  /** Dipanggil setelah foto contoh berhasil diunduh menjadi File. */
  onPilih: (file: File) => void;
  /** Dipanggil bila foto contoh gagal diunduh. */
  onGalat: (pesan: string) => void;
  disabled?: boolean;
  className?: string;
}

/** Deretan 6 foto contoh dari set Testing beserta label aslinya. */
const SampleStrip = ({
  onPilih,
  onGalat,
  disabled = false,
  className,
}: SampleStripProps) => {
  const samples = getSamples().samples;
  const [memuat, setMemuat] = useState<string | null>(null);

  const pilih = async (url: string, nama: string) => {
    setMemuat(nama);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const blob = await res.blob();
      onPilih(new File([blob], nama, { type: blob.type || "image/jpeg" }));
    } catch {
      onGalat(CONTOH.gagal);
    } finally {
      setMemuat(null);
    }
  };

  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6",
        className,
      )}
    >
      {samples.map((s, i) => (
        <li key={s.file}>
          <button
            type="button"
            disabled={disabled || memuat !== null}
            onClick={() => pilih(s.url, s.file)}
            className="group flex w-full flex-col gap-2 rounded-md border border-rule bg-paper-raised p-2 text-left transition-colors duration-150 hover:border-brand disabled:pointer-events-none disabled:opacity-60"
          >
            <span className="relative block aspect-square w-full overflow-hidden rounded-sm bg-paper-sunken">
              <Image
                src={s.url}
                alt={`Pakai contoh ${i + 1}`}
                fill
                sizes="(min-width: 1024px) 160px, (min-width: 640px) 30vw, 45vw"
                className="object-cover"
              />
              {memuat === s.file ? (
                <span className="absolute inset-0 flex items-center justify-center bg-paper/70">
                  <IconLoader2
                    aria-hidden="true"
                    className="size-6 animate-spin motion-reduce:animate-none"
                  />
                </span>
              ) : null}
            </span>
            <span className="flex flex-col gap-1">
              <span className="label-caps">{CONTOH.labelAsli}</span>
              <StatusLabel label={s.label} size="sm" className="w-fit" />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default SampleStrip;
