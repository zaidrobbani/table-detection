import { IconFileOff } from "@tabler/icons-react";
import type React from "react";
import { cn } from "@/lib/utils";

interface StateKosongProps {
  /** Nama berkas sumber yang belum ada */
  namaBerkas?: string;
  /** Pesan kustom; menggantikan pesan standar */
  children?: React.ReactNode;
  className?: string;
}

/** State kosong yang jujur untuk data yang belum tersedia. */
const StateKosong = ({ namaBerkas, children, className }: StateKosongProps) => (
  <div
    className={cn(
      "flex items-start gap-3 rounded-md border border-rule-strong border-dashed bg-paper-sunken px-4 py-4 text-sm",
      className,
    )}
  >
    <IconFileOff
      aria-hidden="true"
      className="mt-0.5 size-4 shrink-0 text-ink-muted"
    />
    <p className="text-ink-muted leading-relaxed">
      {children ?? (
        <>
          Belum tersedia di web_assets:{" "}
          <code className="tabular text-ink">{namaBerkas}</code>. Jalankan ulang
          Rapikan_Folder_DL.ipynb lalu{" "}
          <code className="tabular text-ink">bun run build:data</code>.
        </>
      )}
    </p>
  </div>
);

export default StateKosong;
