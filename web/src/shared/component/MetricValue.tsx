import { cn } from "@/lib/utils";
import {
  formatAngka,
  formatDelta,
  formatMs,
  formatPersen,
} from "@/shared/util/number";

interface MetricValueProps {
  /** null/undefined menampilkan "–" (data belum tersedia) */
  value: number | null | undefined;
  /** angka 0,8148 | persen 81,5% | delta +0,0575 | ms */
  kind?: "angka" | "persen" | "delta" | "ms";
  /** Jumlah desimal; default 4 (angka/delta), 1 (persen) */
  digits?: number;
  /** Label kecil kapital di atas nilai */
  label?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** Warna nilai: delta positif hijau, negatif jingga */
  tone?: "default" | "good" | "bad" | "muted";
  className?: string;
}

const SIZE = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-3xl",
  xl: "text-5xl",
} as const;

const TONE = {
  default: "text-ink",
  good: "text-bersih-ink",
  bad: "text-kotor-ink",
  muted: "text-ink-muted",
} as const;

const format = (
  value: number | null | undefined,
  kind: NonNullable<MetricValueProps["kind"]>,
  digits?: number,
) => {
  switch (kind) {
    case "persen":
      return formatPersen(value, digits ?? 1);
    case "delta":
      return formatDelta(value, digits ?? 4);
    case "ms":
      return formatMs(value);
    default:
      return formatAngka(value, digits ?? 4);
  }
};

/** Angka metrik gaya tabel jurnal: mono, tabular-nums, koma desimal. */
const MetricValue = ({
  value,
  kind = "angka",
  digits,
  label,
  size = "md",
  tone = "default",
  className,
}: MetricValueProps) => {
  const kosong = value === null || value === undefined || Number.isNaN(value);
  return (
    <span className={cn("inline-flex flex-col gap-0.5", className)}>
      {label ? <span className="label-caps">{label}</span> : null}
      <span
        className={cn(
          "tabular font-medium leading-none",
          SIZE[size],
          kosong ? TONE.muted : TONE[tone],
        )}
        title={kosong ? "Data belum tersedia" : undefined}
      >
        {format(value, kind, digits)}
      </span>
    </span>
  );
};

export default MetricValue;
