import { IconArrowsDiff, IconChecks } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { KESEPAKATAN } from "../data";

interface AgreementBadgeProps {
  sepakat: boolean;
  className?: string;
}

/** Penanda apakah label model B dan C sama (ikon + teks, bukan hanya warna). */
const AgreementBadge = ({ sepakat, className }: AgreementBadgeProps) => {
  const Ikon = sepakat ? IconChecks : IconArrowsDiff;
  return (
    <output
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-medium text-sm",
        sepakat
          ? "border-bersih/40 bg-bersih-subtle text-bersih-ink"
          : "border-warning-ink/40 bg-warning-subtle text-warning-ink",
        className,
      )}
    >
      <Ikon aria-hidden="true" className="size-4" stroke={2} />
      {sepakat ? KESEPAKATAN.sepakat : KESEPAKATAN.berbeda}
    </output>
  );
};

export default AgreementBadge;
