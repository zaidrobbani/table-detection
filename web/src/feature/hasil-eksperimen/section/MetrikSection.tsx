import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MetricsData } from "@/repository/eksperimen/dto";
import SectionCard from "@/shared/component/SectionCard";
import { formatAngka, formatDelta } from "@/shared/util/number";
import MetricCompareChart from "../component/MetricCompareChart";
import { METRIK_TESTING, METRIK_VALIDATION, NAMA_MODEL } from "../data";

interface MetrikSectionProps {
  metrics: MetricsData;
}

const angka = "tabular text-right";

const Delta = ({ b, c }: { b: number | null; c: number | null }) => {
  if (b === null || c === null) {
    return <span className="text-ink-muted">—</span>;
  }
  const d = c - b;
  return (
    <span
      className={
        d > 0 ? "text-bersih-ink" : d < 0 ? "text-kotor-ink" : "text-ink-muted"
      }
    >
      {formatDelta(d, 4)}
    </span>
  );
};

/** Tabel metrik Testing dan Validation, plus grafik batang berkelompok. */
const MetrikSection = ({ metrics }: MetrikSectionProps) => {
  const { Testing, Validation } = metrics;
  const valB = Validation.B;
  const valC = Validation.C;

  return (
    <SectionCard
      id="metrik"
      label="Tabel 2–3 · Gambar 1"
      title="Metrik klasifikasi"
      description="Model B memakai pipeline P0 (tanpa PCD), model C memakai P1 (CLAHE). Kolom Δ adalah C dikurangi B."
      contentClassName="flex flex-col gap-8"
    >
      <div>
        <p className="label-caps mb-2">
          Tabel 2 · Testing ({Testing.B.n_samples} citra)
        </p>
        <Table>
          <caption className="sr-only">
            Metrik Testing model B dan C beserta selisih.
          </caption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Metrik</TableHead>
              <TableHead scope="col" className="text-right">
                {NAMA_MODEL.B}
              </TableHead>
              <TableHead scope="col" className="text-right">
                {NAMA_MODEL.C}
              </TableHead>
              <TableHead scope="col" className="text-right">
                Δ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {METRIK_TESTING.map((m) => {
              const b = Testing.B[m.key];
              const c = Testing.C[m.key];
              return (
                <TableRow key={m.key}>
                  <TableHead scope="row" className="font-normal">
                    {m.label}
                  </TableHead>
                  <TableCell className={angka}>{formatAngka(b, 4)}</TableCell>
                  <TableCell className={angka}>{formatAngka(c, 4)}</TableCell>
                  <TableCell className={angka}>
                    <Delta b={b} c={c} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div>
        <p className="label-caps mb-2">
          Tabel 3 · Validation
          {valB ? ` (${valB.n_samples} citra)` : ""}
        </p>
        <Table>
          <caption className="sr-only">
            Metrik macro Validation model B; model C belum tersedia.
          </caption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Metrik</TableHead>
              <TableHead scope="col" className="text-right">
                {NAMA_MODEL.B}
              </TableHead>
              <TableHead scope="col" className="text-right">
                {NAMA_MODEL.C}
              </TableHead>
              <TableHead scope="col" className="text-right">
                Δ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {METRIK_VALIDATION.map((m) => {
              const b = valB ? valB[m.key] : null;
              const c = valC ? valC[m.key] : null;
              return (
                <TableRow key={m.key}>
                  <TableHead scope="row" className="font-normal">
                    {m.label}
                  </TableHead>
                  <TableCell className={angka}>
                    {b === null ? "—" : formatAngka(b, 4)}
                  </TableCell>
                  <TableCell className={`${angka} text-ink-muted`}>
                    {c === null ? "—" : formatAngka(c, 4)}
                  </TableCell>
                  <TableCell className={angka}>
                    <Delta b={b} c={c} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <ul className="mt-2 flex flex-col gap-1 text-ink-muted text-sm">
          {metrics.catatan.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="label-caps mb-3">
          Gambar 1 · Perbandingan metrik Testing, B vs C
        </p>
        <MetricCompareChart testing={Testing} />
      </div>
    </SectionCard>
  );
};

export default MetrikSection;
