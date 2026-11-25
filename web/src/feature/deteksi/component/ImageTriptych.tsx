import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import type { PredictResult } from "@/repository/prediksi/dto";
import FigureFrame from "@/shared/component/FigureFrame";
import FotoPratinjau from "@/shared/component/FotoPratinjau";
import { MODEL, TRIPTYCH } from "../data";
import HeatmapOpacitySlider from "./HeatmapOpacitySlider";

interface ImageTriptychProps {
  /** Data URL foto hasil crop; null selagi disiapkan */
  fotoAsli: string | null;
  /** Hasil model aktif; null selagi menunggu */
  hasil: PredictResult | null;
  opasitas: number;
  onOpasitasChange: (nilai: number) => void;
}

const KerangkaGambar = () => (
  <Skeleton className="absolute inset-0 rounded-none" />
);

/**
 * Tiga gambar berurutan: foto asli, input model (P0 atau CLAHE), dan Grad-CAM
 * sebagai tumpukan input model + overlay dengan opasitas yang bisa diatur.
 * Tiga kolom di desktop, bertumpuk di HP.
 */
const ImageTriptych = ({
  fotoAsli,
  hasil,
  opasitas,
  onOpasitasChange,
}: ImageTriptychProps) => {
  const info = MODEL[hasil?.model ?? "C"];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 md:grid-cols-3">
        <FigureFrame number={1} title={TRIPTYCH.fotoAsli} aspect="square">
          {fotoAsli ? (
            <FotoPratinjau src={fotoAsli} alt={TRIPTYCH.altFotoAsli} />
          ) : (
            <KerangkaGambar />
          )}
        </FigureFrame>

        <FigureFrame
          number={2}
          title={info.namaInput}
          aspect="square"
          alt={`Foto setelah pra-pemrosesan ${info.pipeline}, persis seperti yang diterima model ${info.label}`}
          src={hasil?.images.input_model}
        >
          {hasil ? undefined : <KerangkaGambar />}
        </FigureFrame>

        <FigureFrame number={3} title={TRIPTYCH.gradcam} aspect="square">
          {hasil ? (
            <>
              <Image
                src={hasil.images.input_model}
                alt={`Grad-CAM ${info.label}: peta panas di atas input model. ${TRIPTYCH.penjelasan}`}
                fill
                unoptimized
                sizes="(min-width: 1024px) 400px, 100vw"
                className="object-contain"
              />
              <Image
                src={hasil.images.gradcam}
                alt=""
                fill
                unoptimized
                sizes="(min-width: 1024px) 400px, 100vw"
                className="object-contain transition-opacity duration-150"
                style={{ opacity: opasitas / 100 }}
              />
            </>
          ) : (
            <KerangkaGambar />
          )}
        </FigureFrame>
      </div>

      <div className="grid items-end gap-4 md:grid-cols-3">
        <p className="text-ink-muted text-sm leading-snug md:col-span-2">
          {TRIPTYCH.penjelasan}
        </p>
        <HeatmapOpacitySlider nilai={opasitas} onChange={onOpasitasChange} />
      </div>
    </div>
  );
};

export default ImageTriptych;
