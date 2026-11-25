"use client";

import { cn } from "@/lib/utils";
import ApiWarmupBanner from "@/shared/component/ApiWarmupBanner";
import PageHero from "@/shared/component/PageHero";
import SectionCard from "@/shared/component/SectionCard";
import CropStep from "../component/CropStep";
import ImageTriptych from "../component/ImageTriptych";
import ResultPanel from "../component/ResultPanel";
import SampleStrip from "../component/SampleStrip";
import UploadDropzone from "../component/UploadDropzone";
import { CONTOH, HERO, LANGKAH } from "../data";
import { useDeteksiContainer } from "../hooks/useDeteksiContainer";

/** Susunan halaman Demo; seluruh logika ada di useDeteksiContainer. */
const DeteksiContainer = () => {
  const d = useDeteksiContainer();
  const indeks = LANGKAH.findIndex((l) => l.id === d.langkah);

  return (
    <div className="page-container flex flex-col gap-6 py-8 sm:py-12">
      <PageHero
        eyebrow={HERO.eyebrow}
        title={HERO.title}
        description={HERO.description}
      />
      <ApiWarmupBanner />

      <ol
        aria-label="Langkah"
        className="flex flex-wrap items-center gap-x-4 gap-y-1"
      >
        {LANGKAH.map((l, i) => (
          <li
            key={l.id}
            aria-current={i === indeks ? "step" : undefined}
            className={cn(
              "label-caps flex items-center gap-2",
              i === indeks && "text-ink",
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border text-[0.625rem]",
                i === indeks
                  ? "border-ink bg-ink text-ink-inverse"
                  : "border-rule-strong",
              )}
            >
              {i + 1}
            </span>
            {l.label}
          </li>
        ))}
      </ol>

      {d.langkah === "pilih" ? (
        <div className="motion-safe:fade-in flex flex-col gap-6 duration-200 motion-safe:animate-in">
          <UploadDropzone onPilih={d.pilihDaftar} />
          <SectionCard
            label={CONTOH.label}
            title={CONTOH.judul}
            description={CONTOH.deskripsi}
          >
            <SampleStrip onPilih={d.pilihContoh} onGalat={d.galatContoh} />
          </SectionCard>
        </div>
      ) : null}

      {d.langkah === "crop" && d.sumberCrop ? (
        <div className="motion-safe:fade-in duration-200 motion-safe:animate-in">
          <CropStep
            sumber={d.sumberCrop}
            sibuk={d.sibukCrop}
            onAnalisis={d.analisisCrop}
            onLewati={d.lewatiCrop}
            onBatal={d.batalCrop}
          />
        </div>
      ) : null}

      {d.langkah === "hasil" ? (
        <div className="flex flex-col gap-6">
          <ResultPanel
            model={d.model}
            onModelChange={d.ubahModel}
            hasil={d.hasilAktif}
            memuat={d.memuatAktif}
            galat={d.galatAktif}
            onCobaLagi={d.cobaLagi}
            bisaBandingkan={d.fotoUrl !== null}
            onSimpanUntukBandingkan={d.simpanUntukBandingkan}
            onFotoLain={d.reset}
          />
          <SectionCard label="Gambar" title="Dari foto ke keputusan">
            <ImageTriptych
              fotoAsli={d.fotoUrl}
              hasil={d.hasilAktif}
              opasitas={d.opasitas}
              onOpasitasChange={d.setOpasitas}
            />
          </SectionCard>
        </div>
      ) : null}
    </div>
  );
};

export default DeteksiContainer;
