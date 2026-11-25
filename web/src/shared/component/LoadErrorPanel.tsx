import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadErrorPanelProps {
  /** Pesan Indonesia (biasanya ApiError.message) */
  message: string;
  title?: string;
  /** Bila diisi, tombol "Coba lagi" tampil */
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

/** Panel error dengan pesan jelas dan tombol "Coba lagi". */
const LoadErrorPanel = ({
  message,
  title = "Terjadi kendala",
  onRetry,
  retrying = false,
  className,
}: LoadErrorPanelProps) => (
  <div
    role="alert"
    className={cn(
      "flex flex-col items-start gap-3 rounded-md border border-kotor/40 bg-kotor-subtle p-4 sm:flex-row sm:items-center sm:justify-between",
      className,
    )}
  >
    <div className="flex items-start gap-3">
      <IconAlertCircle
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-kotor-ink"
      />
      <div>
        <p className="font-medium text-kotor-ink text-sm">{title}</p>
        <p className="mt-0.5 text-ink text-sm leading-snug">{message}</p>
      </div>
    </div>
    {onRetry ? (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRetry}
        disabled={retrying}
      >
        <IconRefresh aria-hidden="true" data-icon="inline-start" />
        Coba lagi
      </Button>
    ) : null}
  </div>
);

export default LoadErrorPanel;
