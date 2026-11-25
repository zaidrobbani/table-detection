import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PredictResult } from "@/repository/prediksi/dto";
import FigureFrame from "@/shared/component/FigureFrame";
import MetricValue from "@/shared/component/MetricValue";
import StatusLabel from "@/shared/component/StatusLabel";
import { KOLOM, KOLOM_TEKS } from "../data";

interface ModelColumnProps {
  model: "B" | "C";
  /** null selagi menunggu */
  hasil: PredictResult | null;
  /** Nomor gambar pertama; kolom memakai dua nomor berurutan */
  nomorAwal: number;
  className?: string;
}

/** Satu kolom model: citra input, Grad-CAM, label, P(Kotor), latensi. */
const ModelColumn = ({
  model,
  hasil,
  nomorAwal,
  className,
}: ModelColumnProps) => {
  const info = KOLOM[model];
  return (
    <section
      aria-label={`${KOLOM_TEKS.aria} ${info.judul}`}
      className={cn(
        "flex flex-col gap-5 rounded-md border border-rule bg-paper-raised p-4 sm:p-5",
        className,
      )}
    >
      <header className="flex flex-col gap-1">
        <p className="label-caps">Model {model}</p>
        <h3 className="font-heading font-semibold text-xl leading-snug">
          {info.judul}
        </h3>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <FigureFrame
          number={nomorAwal}
          title={info.namaInput}
          alt={`${info.namaInput}, 224 kali 224 piksel, persis yang diterima model ${model}`}
          src={hasil?.images.input_model}
        >
          {hasil ? undefined : (
            <Skeleton className="absolute inset-0 rounded-none" />
          )}
        </FigureFrame>
        <FigureFrame
          number={nomorAwal + 1}
          title={`${KOLOM_TEKS.gradcam} ${model}`}
          alt={`Grad-CAM model ${model}: peta panas area yang paling memengaruhi keputusan`}
          src={hasil?.images.gradcam}
        >
          {hasil ? undefined : (
            <Skeleton className="absolute inset-0 rounded-none" />
          )}
        </FigureFrame>
      </div>

      {hasil ? (
        <div className="motion-safe:fade-in flex flex-wrap items-end gap-x-8 gap-y-4 border-rule border-t pt-4 duration-200 motion-safe:animate-in">
          <StatusLabel label={hasil.label} size="md" />
          <MetricValue
            label={KOLOM_TEKS.probabilitas}
            value={hasil.prob_kotor}
            kind="angka"
            digits={4}
          />
          <MetricValue
            label={KOLOM_TEKS.latensi}
            value={hasil.latency_ms}
            kind="ms"
            tone="muted"
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="flex flex-wrap items-end gap-x-8 gap-y-4 border-rule border-t pt-4"
        >
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      )}
    </section>
  );
};

export default ModelColumn;
