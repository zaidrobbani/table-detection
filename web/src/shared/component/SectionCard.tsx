import type React from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  /** Label kecil kapital, mis. "TABEL 1" */
  label?: string;
  title?: string;
  description?: React.ReactNode;
  /** Slot kanan header (tombol, toggle) */
  actions?: React.ReactNode;
  children: React.ReactNode;
  /** id untuk tautan anchor */
  id?: string;
  className?: string;
  /** Kelas untuk area isi */
  contentClassName?: string;
}

/** Kartu garis tipis tanpa bayangan; header opsional. */
const SectionCard = ({
  label,
  title,
  description,
  actions,
  children,
  id,
  className,
  contentClassName,
}: SectionCardProps) => {
  const adaHeader = label || title || description || actions;
  return (
    <section
      id={id}
      aria-labelledby={id && title ? `${id}-judul` : undefined}
      className={cn(
        "scroll-mt-20 rounded-md border border-rule bg-paper-raised",
        className,
      )}
    >
      {adaHeader ? (
        <div className="flex flex-wrap items-start justify-between gap-3 border-rule border-b px-4 py-4 sm:px-6">
          <div className="min-w-0">
            {label ? <p className="label-caps mb-1.5">{label}</p> : null}
            {title ? (
              <h2
                id={id ? `${id}-judul` : undefined}
                className="font-heading font-semibold text-xl leading-snug sm:text-2xl"
              >
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1.5 max-w-2xl text-ink-muted text-sm leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}
      <div className={cn("px-4 py-4 sm:px-6 sm:py-5", contentClassName)}>
        {children}
      </div>
    </section>
  );
};

export default SectionCard;
