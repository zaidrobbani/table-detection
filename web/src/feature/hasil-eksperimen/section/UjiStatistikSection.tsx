import { IconCircleCheck, IconInfoCircle } from "@tabler/icons-react";
import type { StatsData } from "@/repository/eksperimen/dto";
import SectionCard from "@/shared/component/SectionCard";
import { formatAngka, formatDelta } from "@/shared/util/number";
import IntervalCi from "../component/IntervalCi";
import McNemarTable from "../component/McNemarTable";
import { buatKesimpulanUji } from "../util/kesimpulan-uji";

interface UjiStatistikSectionProps {
  stats: StatsData;
}

/** Uji McNemar B vs C, p-value, dan ΔF1 macro dengan CI95 bootstrap. */
const UjiStatistikSection = ({ stats }: UjiStatistikSectionProps) => {
  const kesimpulan = buatKesimpulanUji(stats);
  const Ikon = kesimpulan.signifikan ? IconCircleCheck : IconInfoCircle;

  return (
    <SectionCard
      id="uji-statistik"
      label="Tabel 4 · Gambar 4"
      title="Uji statistik B vs C"
      description={`Uji McNemar pada ${stats.n} citra Testing. Sel berlatar biru adalah pasangan yang tidak sepakat; hanya sel itu yang menentukan p-value.`}
      contentClassName="flex flex-col gap-6"
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <p className="label-caps mb-2">Tabel 4 · Kontingensi 2×2</p>
          <McNemarTable stats={stats} />
        </div>
        <div className="flex flex-col gap-5">
          <div>
            <p className="label-caps">p-value McNemar</p>
            <p className="tabular mt-1 font-medium text-4xl leading-none">
              {formatAngka(stats.p_mcnemar, 3)}
            </p>
          </div>
          <div>
            <p className="label-caps">
              Gambar 4 · ΔF1 macro (C − B), CI95 bootstrap
            </p>
            <p className="tabular mt-1 mb-2 font-medium text-2xl leading-none">
              {formatDelta(stats.delta_f1_macro, 4)}
            </p>
            <IntervalCi
              label="ΔF1 macro (C − B)"
              nilai={stats.delta_f1_macro}
              low={stats.ci95_low}
              high={stats.ci95_high}
            />
          </div>
        </div>
      </div>

      <output
        aria-live="polite"
        className="flex items-start gap-3 rounded-md border border-rule bg-paper-sunken px-4 py-3 text-sm leading-relaxed"
      >
        <Ikon
          aria-hidden="true"
          className={`mt-0.5 size-4 shrink-0 ${kesimpulan.signifikan ? "text-bersih-ink" : "text-warning-ink"}`}
        />
        <span>
          <span className="font-medium">{kesimpulan.kalimat}</span>{" "}
          {kesimpulan.kalimatCi}
        </span>
      </output>
    </SectionCard>
  );
};

export default UjiStatistikSection;
