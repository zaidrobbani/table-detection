import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { HistoryData } from "@/repository/eksperimen/dto";
import SectionCard from "@/shared/component/SectionCard";
import StateKosong from "../component/StateKosong";
import TrainingCurveChart from "../component/TrainingCurveChart";
import { NAMA_MODEL } from "../data";

interface KurvaTrainingSectionProps {
  history: HistoryData;
}

/** Kurva loss dan accuracy; tab B/C, C tampil kosong sampai datanya ada. */
const KurvaTrainingSection = ({ history }: KurvaTrainingSectionProps) => (
  <SectionCard
    id="kurva-training"
    label="Gambar 5 · Kurva training"
    title="Kurva training"
    description={`Loss dan accuracy per epoch (${history.epochs_total} epoch). Garis putus-putus vertikal menandai awal tahap 2 (fine-tuning) pada epoch ${history.tahap2_mulai_epoch}.`}
  >
    <Tabs defaultValue="B">
      <TabsList aria-label="Pilih model">
        <TabsTrigger value="B">Model B</TabsTrigger>
        <TabsTrigger value="C">Model C</TabsTrigger>
      </TabsList>
      {(["B", "C"] as const).map((m) => {
        const data = history[m];
        return (
          <TabsContent key={m} value={m} className="pt-4">
            <p className="mb-3 font-medium text-sm">{NAMA_MODEL[m]}</p>
            {data ? (
              <TrainingCurveChart
                data={data}
                model={m}
                tahap2Mulai={history.tahap2_mulai_epoch}
              />
            ) : (
              <StateKosong namaBerkas={`${m}/training_history.csv`} />
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  </SectionCard>
);

export default KurvaTrainingSection;
