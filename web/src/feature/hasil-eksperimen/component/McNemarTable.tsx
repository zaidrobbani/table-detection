import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StatsData } from "@/repository/eksperimen/dto";

interface McNemarTableProps {
  stats: StatsData;
}

/**
 * Tabel kontingensi 2x2: B benar/salah x C benar/salah. Sel yang tidak
 * sepakat (n10, n01) menjadi dasar uji McNemar dan diberi penekanan.
 */
const McNemarTable = ({ stats }: McNemarTableProps) => {
  const b = stats.n10_B_benar_C_salah;
  const c = stats.n01_B_salah_C_benar;
  const totalBBenar = stats.n11 + b;
  const totalBSalah = c + stats.n00;
  const totalCBenar = stats.n11 + c;
  const totalCSalah = b + stats.n00;
  const total = totalBBenar + totalBSalah;

  const sel = "tabular text-right text-base";
  const selTidakSepakat = `${sel} bg-brand-subtle font-semibold`;

  return (
    <Table>
      <caption className="sr-only">
        Tabel kontingensi McNemar model B dan C pada {stats.n} citra Testing.
      </caption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">
            <span className="sr-only">Model B</span>
          </TableHead>
          <TableHead scope="col" className="text-right">
            C benar
          </TableHead>
          <TableHead scope="col" className="text-right">
            C salah
          </TableHead>
          <TableHead scope="col" className="text-right">
            Jumlah
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableHead scope="row">B benar</TableHead>
          <TableCell className={sel}>{stats.n11}</TableCell>
          <TableCell className={selTidakSepakat}>{b}</TableCell>
          <TableCell className={`${sel} text-ink-muted`}>
            {totalBBenar}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableHead scope="row">B salah</TableHead>
          <TableCell className={selTidakSepakat}>{c}</TableCell>
          <TableCell className={sel}>{stats.n00}</TableCell>
          <TableCell className={`${sel} text-ink-muted`}>
            {totalBSalah}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableHead scope="row">Jumlah</TableHead>
          <TableCell className={`${sel} text-ink-muted`}>
            {totalCBenar}
          </TableCell>
          <TableCell className={`${sel} text-ink-muted`}>
            {totalCSalah}
          </TableCell>
          <TableCell className={`${sel} text-ink-muted`}>{total}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default McNemarTable;
