import type { Metadata } from "next";
import DeteksiContainer from "@/feature/deteksi/container/DeteksiContainer";

export const metadata: Metadata = {
  // Template judul dari layout tidak berlaku di segmen yang sama.
  title: { absolute: "Demo deteksi · Meja Bersih" },
  description:
    "Unggah foto meja, potong ke area meja, lalu lihat hasil Bersih atau Kotor beserta Grad-CAM.",
};

export default function Page() {
  return <DeteksiContainer />;
}
