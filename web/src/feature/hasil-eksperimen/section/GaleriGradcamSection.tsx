import type { FiguresData } from "@/repository/eksperimen/dto";
import SectionCard from "@/shared/component/SectionCard";
import FigureLightbox from "../component/FigureLightbox";
import StateKosong from "../component/StateKosong";

interface GaleriGradcamSectionProps {
  figures: FiguresData;
}

/** Nomor gambar pertama pada galeri (Gambar 1–6 dipakai section sebelumnya). */
const NOMOR_AWAL = 7;

/** Galeri Grad-CAM dan figur notebook, dengan lightbox. */
const GaleriGradcamSection = ({ figures }: GaleriGradcamSectionProps) => {
  const gradcam = figures.tersedia.filter((f) => f.kelompok === "gradcam");
  const gradcamKosong = figures.belum_ada.filter(
    (f) => f.kelompok === "gradcam",
  );
  const notebook = figures.tersedia.filter(
    (f) => f.kelompok === "training" || f.kelompok === "confusion",
  );
  const awalNotebook = NOMOR_AWAL + gradcam.length;

  return (
    <SectionCard
      id="galeri"
      label={`Gambar ${NOMOR_AWAL}+ · Galeri figur`}
      title="Grad-CAM dan figur notebook"
      description="Klik gambar untuk memperbesar. Tekan Esc atau tombol Tutup untuk kembali."
      contentClassName="flex flex-col gap-8"
    >
      <div>
        <h3 className="mb-3 font-heading font-semibold text-lg">Grad-CAM</h3>
        {gradcam.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gradcam.map((f, i) => (
              <FigureLightbox
                key={f.id}
                number={NOMOR_AWAL + i}
                title={f.judul}
                src={f.src}
                alt={f.caption}
                caption={f.caption}
              />
            ))}
          </div>
        ) : null}
        {gradcamKosong.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-3">
            {gradcamKosong.map((f) => (
              <li key={f.id}>
                <p className="label-caps mb-1.5">Gambar · {f.judul}</p>
                <StateKosong namaBerkas={f.nama_file} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div>
        <h3 className="mb-3 font-heading font-semibold text-lg">
          Figur notebook (model B)
        </h3>
        {notebook.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {notebook.map((f, i) => (
              <FigureLightbox
                key={f.id}
                number={awalNotebook + i}
                title={f.judul}
                src={f.src}
                alt={f.caption}
                caption={f.caption}
              />
            ))}
          </div>
        ) : (
          <StateKosong>Belum ada figur notebook di web_assets.</StateKosong>
        )}
      </div>
    </SectionCard>
  );
};

export default GaleriGradcamSection;
