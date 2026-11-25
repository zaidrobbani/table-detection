import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ClaheData } from "@/repository/eksperimen/dto";
import SectionCard from "@/shared/component/SectionCard";
import { formatAngka } from "@/shared/util/number";
import FigureLightbox from "../component/FigureLightbox";
import StateKosong from "../component/StateKosong";

interface EfekClaheSectionProps {
  clahe: ClaheData;
}

/** Parameter CLAHE, tabel perbandingan, dan figur P0 vs P1. */
const EfekClaheSection = ({ clahe }: EfekClaheSectionProps) => {
  const p = clahe.parameter;
  const baris = [
    { nama: "Clip limit", nilai: formatAngka(p.clahe_clip_limit, 1) },
    {
      nama: "Tile grid",
      nilai: `${p.clahe_tile_grid[0]} × ${p.clahe_tile_grid[1]}`,
    },
    { nama: "Ruang warna", nilai: p.ruang_warna },
    {
      nama: "Ukuran keluaran",
      nilai: `${p.output_size} × ${p.output_size} piksel`,
    },
    {
      nama: "Padding (RGB)",
      nilai: `(${p.padding_rgb.join(", ")})`,
    },
  ];
  const kolom = clahe.tabel?.[0] ? Object.keys(clahe.tabel[0]) : [];

  return (
    <SectionCard
      id="efek-clahe"
      label="Tabel 5–6 · Gambar 6"
      title="Efek CLAHE (P1)"
      description="P1 menerapkan CLAHE pada kanal L ruang warna LAB setelah resize proporsional, lalu padding ke 224 × 224."
      contentClassName="flex flex-col gap-8"
    >
      <div>
        <p className="label-caps mb-2">Tabel 5 · Parameter CLAHE</p>
        <Table>
          <caption className="sr-only">Parameter praproses CLAHE.</caption>
          <TableBody>
            {baris.map((b) => (
              <TableRow key={b.nama}>
                <TableHead scope="row" className="font-normal">
                  {b.nama}
                </TableHead>
                <TableCell className="tabular whitespace-normal text-right">
                  {b.nilai}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <p className="label-caps mb-2">Tabel 6 · Perbandingan B vs C</p>
        {clahe.tabel && kolom.length > 0 ? (
          <Table>
            <caption className="sr-only">
              Perbandingan B dan C dari notebook.
            </caption>
            <TableHeader>
              <TableRow>
                {kolom.map((k) => (
                  <TableHead key={k} scope="col">
                    {k}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {clahe.tabel.map((row, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: baris CSV tanpa id unik
                <TableRow key={i}>
                  {kolom.map((k) => (
                    <TableCell key={k} className="tabular">
                      {typeof row[k] === "number"
                        ? formatAngka(row[k] as number, 4)
                        : row[k]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <StateKosong namaBerkas="perbandingan_B_vs_C.csv" />
        )}
      </div>

      <div className="max-w-xl">
        {clahe.figur ? (
          <FigureLightbox
            number={6}
            title="Visual P0 vs P1"
            src={clahe.figur}
            alt="Perbandingan citra meja sebelum (P0) dan sesudah CLAHE (P1)."
            caption="Citra yang sama melalui pipeline P0 dan P1."
          />
        ) : (
          <div>
            <p className="label-caps mb-2">Gambar 6 · Visual P0 vs P1</p>
            <StateKosong namaBerkas="visual_p0_vs_p1.png" />
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default EfekClaheSection;
