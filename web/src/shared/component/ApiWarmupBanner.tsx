"use client";

import { IconLoader2, IconPlugConnectedX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useGetHealth } from "@/repository/prediksi/query";

const TUNDA_MS = 1500;

interface ApiWarmupBannerProps {
  className?: string;
}

/**
 * Banner cold start. Memantau /health (polling 5 detik) dan tampil selama
 * server belum warm atau belum terjangkau; hilang sendiri setelah warm.
 * Aman dipasang di setiap halaman yang memanggil API.
 */
const ApiWarmupBanner = ({ className }: ApiWarmupBannerProps) => {
  const { data, isError, isPending } = useGetHealth();
  // Saat cek /health pertama masih berjalan, tunda banner sebentar supaya
  // tidak berkedip di setiap pemuatan halaman ketika server sudah warm.
  const [tundaLewat, setTundaLewat] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTundaLewat(true), TUNDA_MS);
    return () => clearTimeout(t);
  }, []);

  if (data?.warm) return null;
  const gagal = isError && !isPending;
  if (!gagal && !data && !tundaLewat) return null;

  return (
    <output
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 rounded-md border border-warning-ink/30 bg-warning-subtle px-4 py-3 text-sm text-warning-ink",
        className,
      )}
    >
      {gagal ? (
        <IconPlugConnectedX
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0"
        />
      ) : (
        <IconLoader2
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 animate-spin motion-reduce:animate-none"
        />
      )}
      <p className="leading-snug">
        {gagal
          ? "Server model sedang dinyalakan, biasanya 30 sampai 60 detik. Belum bisa dihubungi; mencoba lagi otomatis tiap 5 detik."
          : "Server model sedang dinyalakan, biasanya 30 sampai 60 detik."}
      </p>
    </output>
  );
};

export default ApiWarmupBanner;
