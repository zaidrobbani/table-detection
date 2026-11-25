"use client";

import { IconArrowLeft, IconPhotoUp } from "@tabler/icons-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SampleStrip from "@/feature/deteksi/component/SampleStrip";
import UploadDropzone from "@/feature/deteksi/component/UploadDropzone";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import ApiWarmupBanner from "@/shared/component/ApiWarmupBanner";
import FigureFrame from "@/shared/component/FigureFrame";
import FotoPratinjau from "@/shared/component/FotoPratinjau";
import LoadErrorPanel from "@/shared/component/LoadErrorPanel";
import MockBadge from "@/shared/component/MockBadge";
import PageHero from "@/shared/component/PageHero";
import SectionCard from "@/shared/component/SectionCard";
import { ROUTES } from "@/shared/constant/routes";
import AgreementBadge from "../component/AgreementBadge";
import BeforeAfterSlider from "../component/BeforeAfterSlider";
import ModelColumn from "../component/ModelColumn";
import { FOTO, HERO, KOLOM, KOLOM_TEKS, PEMBANDING, PILIH_FOTO } from "../data";
import { useBandingkanModelContainer } from "../hooks/useBandingkanModelContainer";

/** Susunan halaman Bandingkan; logika ada di useBandingkanModelContainer. */
const BandingkanModelContainer = () => {
  const b = useBandingkanModelContainer();
  const mobile = useIsMobile();

  return (
    <div className="page-container flex flex-col gap-6 py-8 sm:py-12">
      <PageHero
        eyebrow={HERO.eyebrow}
        title={HERO.title}
        description={HERO.description}
      />
      <ApiWarmupBanner />

      {!b.siap ? <Skeleton aria-hidden="true" className="h-64 w-full" /> : null}

      {b.siap && !b.foto ? (
        <SectionCard
          label={PILIH_FOTO.label}
          title={PILIH_FOTO.judul}
          description={PILIH_FOTO.deskripsi}
          actions={
            <Link
              href={ROUTES.DEMO}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <IconArrowLeft aria-hidden="true" data-icon="inline-start" />
              {PILIH_FOTO.kembali}
            </Link>
          }
          contentClassName="flex flex-col gap-6"
        >
          <UploadDropzone onPilih={b.pilihDaftar} ringkas />
          <SampleStrip onPilih={b.pilihContoh} onGalat={b.galatContoh} />
        </SectionCard>
      ) : null}

      {b.siap && b.foto ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            {b.hasil ? <AgreementBadge sepakat={b.hasil.sepakat} /> : null}
            {b.hasil?.mock ? <MockBadge /> : null}
            {b.memuat ? (
              <output className="text-ink-muted text-sm">
                {FOTO.menunggu}
              </output>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="sm:ml-auto"
              onClick={b.gantiFoto}
            >
              <IconPhotoUp aria-hidden="true" data-icon="inline-start" />
              {FOTO.gantiFoto}
            </Button>
          </div>

          {b.galat && !b.hasil ? (
            <LoadErrorPanel
              title={FOTO.galatJudul}
              message={b.galat}
              onRetry={b.cobaLagi}
              retrying={b.memuat}
            />
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,16rem)_1fr]">
            <FigureFrame number={1} title={FOTO.judul} className="max-w-xs">
              <FotoPratinjau src={b.foto} alt={FOTO.alt} />
            </FigureFrame>

            {mobile ? (
              <Tabs defaultValue="C" className="min-w-0">
                <TabsList
                  aria-label={KOLOM_TEKS.tabAria}
                  className="w-full group-data-horizontal/tabs:h-10"
                >
                  <TabsTrigger value="B">{KOLOM.B.tab}</TabsTrigger>
                  <TabsTrigger value="C">{KOLOM.C.tab}</TabsTrigger>
                </TabsList>
                <TabsContent value="B">
                  <ModelColumn
                    model="B"
                    hasil={b.hasil?.B ?? null}
                    nomorAwal={2}
                  />
                </TabsContent>
                <TabsContent value="C">
                  <ModelColumn
                    model="C"
                    hasil={b.hasil?.C ?? null}
                    nomorAwal={4}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="grid min-w-0 gap-6 md:grid-cols-2">
                <ModelColumn
                  model="B"
                  hasil={b.hasil?.B ?? null}
                  nomorAwal={2}
                />
                <ModelColumn
                  model="C"
                  hasil={b.hasil?.C ?? null}
                  nomorAwal={4}
                />
              </div>
            )}
          </div>

          {b.hasil ? (
            <SectionCard
              label={PEMBANDING.label}
              title={PEMBANDING.judul}
              description={PEMBANDING.deskripsi}
            >
              <FigureFrame
                number={6}
                title="P0 dan P1"
                aspect="auto"
                caption={`${PEMBANDING.sebelum} di kiri, ${PEMBANDING.sesudah} di kanan`}
              >
                <BeforeAfterSlider
                  sebelum={b.hasil.B.images.input_model}
                  sesudah={b.hasil.C.images.input_model}
                  altSebelum={PEMBANDING.altSebelum}
                  altSesudah={PEMBANDING.altSesudah}
                  labelSebelum={PEMBANDING.sebelum}
                  labelSesudah={PEMBANDING.sesudah}
                />
              </FigureFrame>
            </SectionCard>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default BandingkanModelContainer;
