import type { Metadata } from "next";
import HasilEksperimenContainer from "@/feature/hasil-eksperimen/container/HasilEksperimenContainer";

export const metadata: Metadata = {
  title: "Hasil eksperimen",
  description:
    "Metrik, confusion matrix, uji McNemar, dan kurva training model B (tanpa PCD) melawan C (CLAHE).",
};

export default function Page() {
  return <HasilEksperimenContainer />;
}
