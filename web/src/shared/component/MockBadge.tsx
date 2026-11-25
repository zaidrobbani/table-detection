import { cn } from "@/lib/utils";

interface MockBadgeProps {
  className?: string;
}

/** Penanda hasil/mode mock. Wajib tampil bila hasil berasal dari mock FE. */
const MockBadge = ({ className }: MockBadgeProps) => (
  <output
    className={cn(
      "inline-flex items-center rounded-md border border-warning-ink/40 bg-warning-subtle px-2 py-0.5 font-medium font-mono text-[0.6875rem] text-warning-ink uppercase tracking-[0.12em]",
      className,
    )}
  >
    Mode mock
  </output>
);

export default MockBadge;
