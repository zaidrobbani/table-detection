"use client";

import { type ReactNode, useSyncExternalStore } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  /** Ditampilkan saat prerender/SSR sebelum hidrasi */
  fallback?: ReactNode;
}

const berlangganan = () => () => {};

/**
 * Merender children hanya di browser. Dipakai untuk komponen (mis. Recharts)
 * yang memakai nilai acak saat render sehingga tidak boleh di-prerender.
 */
const ClientOnly = ({ children, fallback = null }: ClientOnlyProps) => {
  const diKlien = useSyncExternalStore(
    berlangganan,
    () => true,
    () => false,
  );
  return diKlien ? children : fallback;
};

export default ClientOnly;
