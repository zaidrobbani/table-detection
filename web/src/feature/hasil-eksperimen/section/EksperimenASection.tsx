import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EksperimenAData } from "@/repository/eksperimen/dto";
import SectionCard from "@/shared/component/SectionCard";
import { formatAngka } from "@/shared/util/number";
import StateKosong from "../component/StateKosong";

interface EksperimenASectionProps {
  data: EksperimenAData | null;
}

/** Eksperimen A (ML klasik); kosong sampai data dari Fahry masuk. */
const EksperimenASection = ({ data }: EksperimenASectionProps) => (
  <SectionCard
    id="eksperimen-a"
    label="Tabel 7 · Eksperimen A"
    title="Eksperimen A (ML klasik)"
    description="Baseline pembelajaran mesin klasik berbasis fitur buatan tangan."
  >
    {data && data.items.length > 0 ? (
      <>
        <Table>
          <caption className="sr-only">Hasil Eksperimen A.</caption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Metode</TableHead>
              <TableHead scope="col">Fitur</TableHead>
              <TableHead scope="col" className="text-right">
                Split
              </TableHead>
              <TableHead scope="col" className="text-right">
                Accuracy
              </TableHead>
              <TableHead scope="col" className="text-right">
                Precision
              </TableHead>
              <TableHead scope="col" className="text-right">
                Recall
              </TableHead>
              <TableHead scope="col" className="text-right">
                F1
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((it) => (
              <TableRow key={`${it.nama}-${it.fitur}-${it.split}`}>
                <TableHead scope="row" className="font-normal">
                  {it.nama}
                </TableHead>
                <TableCell>{it.fitur}</TableCell>
                <TableCell className="text-right">
                  {it.split} (n = {it.n_samples})
                </TableCell>
                <TableCell className="tabular text-right">
                  {formatAngka(it.accuracy, 4)}
                </TableCell>
                <TableCell className="tabular text-right">
                  {formatAngka(it.precision_macro, 4)}
                </TableCell>
                <TableCell className="tabular text-right">
                  {formatAngka(it.recall_macro, 4)}
                </TableCell>
                <TableCell className="tabular text-right">
                  {formatAngka(it.f1_macro, 4)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-2 text-ink-muted text-sm">Sumber: {data.sumber}</p>
      </>
    ) : (
      <StateKosong>
        Menunggu data dari Fahry. Hasil Eksperimen A akan tampil di sini setelah
        berkasnya masuk dan{" "}
        <code className="tabular text-ink">bun run build:data</code> dijalankan.
      </StateKosong>
    )}
  </SectionCard>
);

export default EksperimenASection;
