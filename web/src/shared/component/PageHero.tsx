import type React from "react";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  /** Label kecil kapital di atas judul, mis. "DEMO · KLASIFIKASI MEJA" */
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  /** Slot kanan/bawah: badge, tombol, dsb. */
  children?: React.ReactNode;
  className?: string;
}

const PageHero = ({
  eyebrow,
  title,
  description,
  children,
  className,
}: PageHeroProps) => (
  <header className={cn("border-rule border-b pb-6 sm:pb-8", className)}>
    {eyebrow ? <p className="label-caps mb-3">{eyebrow}</p> : null}
    <h1 className="max-w-3xl text-balance font-heading font-semibold text-3xl leading-tight sm:text-4xl">
      {title}
    </h1>
    {description ? (
      <p className="mt-3 max-w-2xl text-pretty text-base text-ink-muted leading-relaxed">
        {description}
      </p>
    ) : null}
    {children ? <div className="mt-5">{children}</div> : null}
  </header>
);

export default PageHero;
