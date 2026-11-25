import { formatDelta } from "@/shared/util/number";

interface IntervalCiProps {
  nilai: number;
  low: number;
  high: number;
  label: string;
}

/** Visual interval kecil: garis tegak di 0, bar CI95, titik pada nilai titik. */
const IntervalCi = ({ nilai, low, high, label }: IntervalCiProps) => {
  const kiri = Math.min(low, 0);
  const kanan = Math.max(high, 0);
  const pad = (kanan - kiri) * 0.12;
  const min = kiri - pad;
  const max = kanan + pad;
  const pos = (v: number) => `${(((v - min) / (max - min)) * 100).toFixed(2)}%`;

  return (
    <div
      role="img"
      aria-label={`${label}: ${formatDelta(nilai)} dengan CI95 dari ${formatDelta(low)} sampai ${formatDelta(high)}. Garis acuan berada di 0.`}
      className="flex flex-col gap-1"
    >
      <div className="relative h-10 w-full">
        <div className="absolute inset-x-0 top-1/2 h-px bg-rule-strong" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-series-c"
          style={{ left: pos(low), width: `calc(${pos(high)} - ${pos(low)})` }}
        />
        {[low, high].map((v) => (
          <div
            key={v}
            className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-series-c"
            style={{ left: pos(v) }}
          />
        ))}
        <div
          className="absolute inset-y-0 w-px bg-ink"
          style={{ left: pos(0) }}
        />
        <div
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-series-c ring-2 ring-paper-raised"
          style={{ left: pos(nilai) }}
        />
      </div>
      <div className="tabular relative h-4 text-ink-muted text-xs">
        <span className="absolute -translate-x-1/2" style={{ left: pos(low) }}>
          {formatDelta(low, 3)}
        </span>
        <span
          className="absolute -translate-x-1/2 text-ink"
          style={{ left: pos(0) }}
        >
          0
        </span>
        <span className="absolute -translate-x-1/2" style={{ left: pos(high) }}>
          {formatDelta(high, 3)}
        </span>
      </div>
    </div>
  );
};

export default IntervalCi;
