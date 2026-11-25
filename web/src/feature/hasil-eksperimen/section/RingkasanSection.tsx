import { IconArrowNarrowRight } from "@tabler/icons-react";
import type { MetricsData } from "@/repository/eksperimen/dto";
import MetricValue from "@/shared/component/MetricValue";
import SectionCard from "@/shared/component/SectionCard";
import { formatDeltaPoin } from "@/shared/util/number";
import { NAMA_MODEL } from "../data";

interface RingkasanSectionProps {
  metrics: MetricsData;
}

const KARTU = [
  { key: "accuracy", label: "Accuracy" },
  { key: "f1_macro", label: "F1 macro" },
] as const;

/** Kartu ringkasan: Accuracy dan F1 macro Testing, B vs C, plus selisih. */
const RingkasanSection = ({ metrics }: RingkasanSectionProps) => {
  const { B, C } = metrics.Testing;
  return (
    <SectionCard
      id="ringkasan"
      label="Tabel 1 · Ringkasan Testing"
      title="Ringkasan hasil"
      description={`Dua metrik utama pada ${B.n_samples} citra Testing. Selisih dihitung C dikurangi B dalam poin persentase.`}
      contentClassName="grid gap-6 sm:grid-cols-2"
    >
      {KARTU.map((k) => {
        const selisih = C[k.key] - B[k.key];
        return (
          <div
            key={k.key}
            className="flex flex-col gap-4 rounded-md border border-rule p-4"
          >
            <p className="label-caps">{k.label} · Testing</p>
            <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
              <MetricValue
                value={B[k.key]}
                size="xl"
                label={NAMA_MODEL.B}
                tone="muted"
              />
              <IconArrowNarrowRight
                aria-hidden="true"
                className="mb-1.5 size-6 text-ink-muted"
              />
              <MetricValue value={C[k.key]} size="xl" label={NAMA_MODEL.C} />
            </div>
            <p className="tabular border-rule border-t pt-3 text-sm">
              <span className="text-ink-muted">Δ (C − B): </span>
              <span
                className={
                  selisih > 0
                    ? "font-semibold text-bersih-ink"
                    : selisih < 0
                      ? "font-semibold text-kotor-ink"
                      : "font-semibold"
                }
              >
                {formatDeltaPoin(selisih)}
              </span>
            </p>
          </div>
        );
      })}
    </SectionCard>
  );
};

export default RingkasanSection;
