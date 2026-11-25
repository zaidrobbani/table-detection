import { IconArrowsDiff, IconRefresh } from "@tabler/icons-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ModelId, PredictResult } from "@/repository/prediksi/dto";
import LoadErrorPanel from "@/shared/component/LoadErrorPanel";
import MetricValue from "@/shared/component/MetricValue";
import MockBadge from "@/shared/component/MockBadge";
import SectionCard from "@/shared/component/SectionCard";
import StatusLabel from "@/shared/component/StatusLabel";
import { ROUTES } from "@/shared/constant/routes";
import { HASIL } from "../data";
import ModelToggle from "./ModelToggle";
import ProbabilityRuler from "./ProbabilityRuler";

interface ResultPanelProps {
  model: ModelId;
  onModelChange: (model: ModelId) => void;
  /** Hasil model aktif; null selagi menunggu atau gagal */
  hasil: PredictResult | null;
  memuat: boolean;
  galat: string | null;
  onCobaLagi: () => void;
  /** Foto sudah siap disimpan untuk halaman Bandingkan */
  bisaBandingkan: boolean;
  /** Simpan foto ke sessionStorage/memori sebelum pindah halaman */
  onSimpanUntukBandingkan: () => void;
  onFotoLain: () => void;
}

const KerangkaHasil = () => (
  <div className="flex flex-col gap-5" aria-hidden="true">
    <Skeleton className="h-14 w-44" />
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-24 w-full" />
  </div>
);

/** Label besar, keyakinan, penggaris probabilitas, dan aksi lanjutan. */
const ResultPanel = ({
  model,
  onModelChange,
  hasil,
  memuat,
  galat,
  onCobaLagi,
  bisaBandingkan,
  onSimpanUntukBandingkan,
  onFotoLain,
}: ResultPanelProps) => (
  <SectionCard
    label={HASIL.label}
    title={HASIL.judul}
    actions={<ModelToggle nilai={model} onChange={onModelChange} />}
  >
    <div className="flex flex-col gap-6">
      {galat && !hasil ? (
        <LoadErrorPanel
          title={HASIL.galatJudul}
          message={galat}
          onRetry={onCobaLagi}
          retrying={memuat}
        />
      ) : null}

      {memuat && !hasil ? (
        <>
          <output className="sr-only">{HASIL.menganalisis}</output>
          <KerangkaHasil />
        </>
      ) : null}

      {hasil ? (
        <div
          key={hasil.model}
          className="motion-safe:fade-in motion-safe:slide-in-from-bottom-1 flex flex-col gap-6 duration-200 motion-safe:animate-in"
        >
          <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
            <div className="flex flex-col gap-2">
              <StatusLabel label={hasil.label} size="lg" />
            </div>
            <MetricValue
              label={HASIL.keyakinan}
              value={hasil.confidence}
              kind="persen"
              size="lg"
            />
            {hasil.mock ? <MockBadge className="mb-1" /> : null}
          </div>
          <ProbabilityRuler
            nilai={hasil.prob_kotor}
            threshold={hasil.threshold}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-rule border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          {bisaBandingkan ? (
            <Link
              href={ROUTES.BANDINGKAN}
              onClick={onSimpanUntukBandingkan}
              className={cn(buttonVariants({ size: "lg" }), "w-fit")}
            >
              <IconArrowsDiff aria-hidden="true" data-icon="inline-start" />
              {HASIL.bandingkan}
            </Link>
          ) : (
            <Button type="button" size="lg" disabled className="w-fit">
              <IconArrowsDiff aria-hidden="true" data-icon="inline-start" />
              {HASIL.bandingkan}
            </Button>
          )}
          <p className="text-ink-muted text-xs">{HASIL.bandingkanBantuan}</p>
        </div>
        <Button type="button" variant="outline" size="lg" onClick={onFotoLain}>
          <IconRefresh aria-hidden="true" data-icon="inline-start" />
          {HASIL.fotoLain}
        </Button>
      </div>
    </div>
  </SectionCard>
);

export default ResultPanel;
