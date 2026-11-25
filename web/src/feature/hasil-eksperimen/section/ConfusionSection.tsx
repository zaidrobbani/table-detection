import type { ConfusionData } from "@/repository/eksperimen/dto";
import SectionCard from "@/shared/component/SectionCard";
import ConfusionMatrixGrid from "../component/ConfusionMatrixGrid";
import { NAMA_MODEL } from "../data";

interface ConfusionSectionProps {
  confusion: ConfusionData;
}

/** Dua confusion matrix Testing (B dan C) sebagai grid. */
const ConfusionSection = ({ confusion }: ConfusionSectionProps) => (
  <SectionCard
    id="confusion"
    label="Gambar 2–3 · Confusion matrix Testing"
    title="Confusion matrix"
    description="Baris adalah kelas aktual, kolom adalah prediksi pada ambang 0,5. Persen dihitung per baris (per kelas aktual)."
    contentClassName="grid gap-8 md:grid-cols-2"
  >
    <div>
      <p className="label-caps mb-3">Gambar 2 · Model B</p>
      <ConfusionMatrixGrid
        data={confusion.Testing.B}
        labels={confusion.labels}
        namaModel={NAMA_MODEL.B}
      />
    </div>
    <div>
      <p className="label-caps mb-3">Gambar 3 · Model C</p>
      <ConfusionMatrixGrid
        data={confusion.Testing.C}
        labels={confusion.labels}
        namaModel={NAMA_MODEL.C}
      />
    </div>
  </SectionCard>
);

export default ConfusionSection;
