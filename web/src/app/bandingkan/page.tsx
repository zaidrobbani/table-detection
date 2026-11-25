import type { Metadata } from "next";
import BandingkanModelContainer from "@/feature/bandingkan-model/container/BandingkanModelContainer";

export const metadata: Metadata = {
  title: "Bandingkan model",
  description:
    "Bandingkan model tanpa PCD (P0) dan dengan CLAHE (P1) pada foto yang sama.",
};

export default function Page() {
  return <BandingkanModelContainer />;
}
