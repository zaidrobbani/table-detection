import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface StatusLabelProps {
  label: "Bersih" | "Kotor";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE = {
  sm: "gap-1 px-2 py-0.5 text-xs [&_svg]:size-3.5",
  md: "gap-1.5 px-2.5 py-1 text-sm [&_svg]:size-4",
  lg: "gap-2.5 px-4 py-2 text-3xl sm:text-4xl [&_svg]:size-8",
} as const;

/**
 * Label hasil: teks + ikon + warna (tidak hanya warna, untuk aksesibilitas).
 */
const StatusLabel = ({ label, size = "md", className }: StatusLabelProps) => {
  const bersih = label === "Bersih";
  const Icon = bersih ? IconCircleCheck : IconAlertTriangle;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-heading font-semibold leading-none",
        bersih
          ? "border-bersih/40 bg-bersih-subtle text-bersih-ink"
          : "border-kotor/40 bg-kotor-subtle text-kotor-ink",
        SIZE[size],
        className,
      )}
    >
      <Icon aria-hidden="true" stroke={2} />
      <span>{label}</span>
    </span>
  );
};

export default StatusLabel;
