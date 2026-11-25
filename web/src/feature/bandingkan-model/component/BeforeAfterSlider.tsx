"use client";

import Image from "next/image";
import { useState } from "react";
import { PEMBANDING } from "../data";

interface BeforeAfterSliderProps {
  sebelum: string;
  sesudah: string;
  altSebelum: string;
  altSesudah: string;
  labelSebelum: string;
  labelSesudah: string;
}

/**
 * Pembanding sebelum/sesudah. Dua gambar ditumpuk; gambar "sebelum" dipotong
 * dengan clip-path. Input range tak terlihat menangani mouse, sentuh, dan
 * keyboard (panah, Home, End) sekaligus.
 */
const BeforeAfterSlider = ({
  sebelum,
  sesudah,
  altSebelum,
  altSesudah,
  labelSebelum,
  labelSesudah,
}: BeforeAfterSliderProps) => {
  const [posisi, setPosisi] = useState(50);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md select-none overflow-hidden bg-paper-sunken has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand has-[:focus-visible]:outline-offset-2">
      <Image
        src={sesudah}
        alt={altSesudah}
        fill
        unoptimized
        sizes="(min-width: 768px) 448px, 100vw"
        className="object-contain"
        draggable={false}
      />
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - posisi}% 0 0)` }}
      >
        <Image
          src={sebelum}
          alt={altSebelum}
          fill
          unoptimized
          sizes="(min-width: 768px) 448px, 100vw"
          className="object-contain"
          draggable={false}
        />
      </div>

      <span className="pointer-events-none absolute top-2 left-2 rounded-sm bg-ink px-1.5 py-0.5 font-mono text-[0.6875rem] text-ink-inverse uppercase tracking-[0.12em]">
        {labelSebelum}
      </span>
      <span className="pointer-events-none absolute top-2 right-2 rounded-sm bg-ink px-1.5 py-0.5 font-mono text-[0.6875rem] text-ink-inverse uppercase tracking-[0.12em]">
        {labelSesudah}
      </span>

      {/* Garis dan handle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white outline outline-1 outline-black/40"
        style={{ left: `${posisi}%` }}
      >
        <span className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink bg-white font-mono text-ink text-xs">
          ⇆
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={posisi}
        onChange={(e) => setPosisi(Number(e.target.value))}
        aria-label={PEMBANDING.aria}
        aria-valuetext={`${labelSebelum} terlihat ${posisi} persen, ${labelSesudah} ${100 - posisi} persen`}
        className="absolute inset-0 m-0 size-full cursor-ew-resize touch-pan-y appearance-none bg-transparent opacity-0 [&::-moz-range-thumb]:h-full [&::-moz-range-thumb]:w-0 [&::-webkit-slider-thumb]:h-full [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:appearance-none"
      />
    </div>
  );
};

export default BeforeAfterSlider;
