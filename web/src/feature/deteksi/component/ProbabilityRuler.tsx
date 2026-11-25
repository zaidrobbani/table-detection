import { cn } from "@/lib/utils";
import { formatAngka } from "@/shared/util/number";
import { RULER } from "../data";

interface ProbabilityRulerProps {
  /** P(Kotor), 0..1 */
  nilai: number;
  threshold?: number;
  className?: string;
}

const JUMLAH_TICK = Math.round(1 / RULER.langkahTick);
const TICKS = Array.from({ length: JUMLAH_TICK + 1 }, (_, i) => i);

const persen = (v: number) => `${Math.min(100, Math.max(0, v * 100))}%`;

/**
 * Penggaris horizontal 0-100 dengan tick tiap 0,1, garis ambang, dan penanda
 * nilai P(Kotor). Zona diberi teks, tidak hanya warna.
 */
const ProbabilityRuler = ({
  nilai,
  threshold = 0.5,
  className,
}: ProbabilityRulerProps) => {
  const label = nilai >= threshold ? RULER.zonaKotor : RULER.zonaBersih;
  const aria = `Penggaris probabilitas Kotor dari 0 sampai 100 persen. Nilai model ${formatAngka(
    nilai * 100,
    1,
  )} persen, ${nilai >= threshold ? "di atas" : "di bawah"} ambang ${formatAngka(
    threshold * 100,
    0,
  )} persen, sehingga hasilnya ${label}.`;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="label-caps">{RULER.judul}</span>
        <span className="tabular text-ink text-sm">
          {RULER.nilai} = {formatAngka(nilai, 4)}
        </span>
      </div>
      <div role="img" aria-label={aria} className="px-3">
        {/* Penanda nilai */}
        <div className="relative h-7">
          <span
            className="motion-safe:fade-in absolute bottom-0 flex -translate-x-1/2 flex-col items-center duration-200 motion-safe:animate-in"
            style={{ left: persen(nilai) }}
          >
            <span className="rounded-sm bg-ink px-1.5 py-0.5 font-medium font-mono text-[0.6875rem] text-ink-inverse leading-none">
              {formatAngka(nilai * 100, 1)}
            </span>
            <span className="size-0 border-x-4 border-x-transparent border-t-4 border-t-ink" />
          </span>
        </div>

        {/* Batang zona + garis ambang */}
        <div className="relative h-5 overflow-visible rounded-sm border border-rule-strong">
          <div
            className="absolute inset-y-0 left-0 bg-bersih-subtle"
            style={{ width: persen(threshold) }}
          />
          <div
            className="absolute inset-y-0 right-0 bg-kotor-subtle"
            style={{ width: persen(1 - threshold) }}
          />
          <div
            className="absolute -inset-y-1.5 w-0.5 -translate-x-1/2 bg-ink"
            style={{ left: persen(threshold) }}
          />
          <div
            className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-brand"
            style={{ left: persen(nilai) }}
          />
        </div>

        {/* Tick tiap 0,1 */}
        <div className="relative h-8">
          {TICKS.map((i) => {
            const v = i * RULER.langkahTick;
            const utama = i % 2 === 0;
            return (
              <span
                key={i}
                className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
                style={{ left: persen(v) }}
              >
                <span
                  className={cn(
                    "w-px bg-rule-strong",
                    utama ? "h-2.5" : "h-1.5",
                  )}
                />
                {utama ? (
                  <span className="tabular mt-0.5 text-[0.6875rem] text-ink-muted leading-none">
                    {Math.round(v * 100)}
                  </span>
                ) : null}
              </span>
            );
          })}
        </div>

        {/* Keterangan zona dan ambang */}
        <div className="relative flex justify-between pt-1 text-xs">
          <span className="font-medium text-bersih-ink">
            {RULER.zonaBersih}
          </span>
          <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-ink-muted">
            {RULER.ambang}
          </span>
          <span className="font-medium text-kotor-ink">{RULER.zonaKotor}</span>
        </div>
      </div>
    </div>
  );
};

export default ProbabilityRuler;
