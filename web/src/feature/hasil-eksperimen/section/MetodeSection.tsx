import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SectionCard from "@/shared/component/SectionCard";
import { DATASET, HYPERPARAMETER } from "../data";

/** Dataset, arsitektur, protokol, dan hyperparameter. */
const MetodeSection = () => (
  <SectionCard
    id="metode"
    label="Tabel 8–9 · Metode"
    title="Metode dan protokol"
    description="B dan C memakai arsitektur, data, dan protokol training yang sama. Satu-satunya beda adalah praproses: P0 (resize + padding) untuk B, P1 (P0 ditambah CLAHE pada kanal L) untuk C."
    contentClassName="grid gap-8 md:grid-cols-2"
  >
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-caps mb-2">
          Tabel 8 · Dataset ({DATASET.total} citra)
        </p>
        <Table>
          <caption className="sr-only">Pembagian dataset.</caption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Split</TableHead>
              <TableHead scope="col" className="text-right">
                Citra
              </TableHead>
              <TableHead scope="col">Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DATASET.baris.map((b) => (
              <TableRow key={b.split}>
                <TableHead scope="row" className="font-normal">
                  {b.split}
                </TableHead>
                <TableCell className="tabular text-right">{b.n}</TableCell>
                <TableCell className="text-ink-muted">{b.keterangan}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed">
        <li>
          Arsitektur: MobileNetV2 berbobot ImageNet sebagai backbone beku (tahap
          1), lalu fine-tuning pada tahap 2.
        </li>
        <li>Protokol identik untuk B dan C; hanya praproses yang berbeda.</li>
        <li>
          P0: resize proporsional lalu padding abu ke 224 × 224. P1: P0 dengan
          CLAHE pada kanal L (LAB).
        </li>
        <li>Keputusan akhir memakai ambang 0,5 pada P(Kotor).</li>
        <li>
          Validation dan Testing adalah citra primer (bukan sintetis), sehingga
          tidak ada kebocoran data dari citra sintetis.
        </li>
      </ul>
    </div>

    <div>
      <p className="label-caps mb-2">Tabel 9 · Hyperparameter</p>
      <Table>
        <caption className="sr-only">Hyperparameter training.</caption>
        <TableBody>
          {HYPERPARAMETER.map((h) => (
            <TableRow key={h.nama}>
              <TableHead scope="row" className="font-normal">
                {h.nama}
              </TableHead>
              <TableCell className="tabular text-right">{h.nilai}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </SectionCard>
);

export default MetodeSection;
