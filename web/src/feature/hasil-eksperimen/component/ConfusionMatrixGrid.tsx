import { IconCalculator } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import type { Confusion } from "@/repository/eksperimen/dto";
import { formatAngka, formatPersen } from "@/shared/util/number";
import { buatSel, hitungTurunan } from "../util/confusion";

interface ConfusionMatrixGridProps {
  data: Confusion;
  labels: [string, string];
  /** Nama model untuk caption tabel, mis. "B · tanpa PCD (P0)" */
  namaModel: string;
}

/** Intensitas maksimum warna sel; dijaga rendah agar teks tetap kontras di terang dan gelap. */
const INTENSITAS_MAKS = 38;

/**
 * Confusion matrix sebagai tabel semantik: baris = Aktual, kolom = Prediksi.
 * Sel berisi jumlah dan persen per baris; intensitas warna mengikuti proporsi.
 * Sel benar (diagonal) hijau, sel salah jingga; keduanya juga diberi teks.
 */
const ConfusionMatrixGrid = ({
  data,
  labels,
  namaModel,
}: ConfusionMatrixGridProps) => {
  const sel = buatSel(data.matrix);
  const turunan = hitungTurunan(data.matrix);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-sm">{namaModel}</span>
        {data.turunan ? (
          <Badge variant="outline" className="gap-1 text-warning-ink">
            <IconCalculator aria-hidden="true" className="size-3" />
            Diturunkan dari recall per kelas
          </Badge>
        ) : null}
      </div>

      <table className="w-full table-fixed border-separate border-spacing-1 text-center">
        <caption className="sr-only">
          Confusion matrix {namaModel}, {data.split}, {data.n} citra. Baris
          menunjukkan kelas aktual, kolom menunjukkan kelas prediksi.
        </caption>
        <thead>
          <tr>
            <td className="w-[4.5rem]" />
            <td className="w-[4.5rem]" />
            <th
              colSpan={2}
              scope="colgroup"
              className="label-caps pb-1 font-medium"
            >
              Prediksi
            </th>
          </tr>
          <tr>
            <td />
            <td />
            {labels.map((l) => (
              <th
                key={l}
                scope="col"
                className="pb-1 font-medium text-ink text-sm"
              >
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[0, 1].map((aktual) => (
            <tr key={labels[aktual]}>
              {aktual === 0 ? (
                <th
                  rowSpan={2}
                  scope="rowgroup"
                  className="label-caps align-middle font-medium [transform:rotate(180deg)] [writing-mode:vertical-rl]"
                >
                  Aktual
                </th>
              ) : null}
              <th
                scope="row"
                className="pr-1 text-right font-medium text-ink text-sm"
              >
                {labels[aktual]}
              </th>
              {sel
                .filter((s) => s.aktual === aktual)
                .map((s) => (
                  <td
                    key={`${s.aktual}-${s.prediksi}`}
                    className="rounded-md border border-rule px-2 py-4 sm:py-6"
                    style={{
                      background: `color-mix(in oklab, var(${s.benar ? "--bersih" : "--kotor"}) ${(s.proporsi * INTENSITAS_MAKS).toFixed(1)}%, var(--paper-raised))`,
                    }}
                  >
                    <span className="tabular block font-semibold text-2xl text-ink leading-none">
                      {s.jumlah}
                    </span>
                    <span className="tabular mt-1 block text-ink text-xs">
                      {formatPersen(s.proporsi, 1)} baris
                    </span>
                    <span className="mt-1 block text-[0.6875rem] text-ink uppercase tracking-wider">
                      {s.benar ? "benar" : "salah"}
                    </span>
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="tabular grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="label-caps">Akurasi</dt>
          <dd className="mt-0.5 text-ink text-sm">
            {formatAngka(turunan.akurasi, 4)}
          </dd>
        </div>
        <div>
          <dt className="label-caps">Recall {labels[0]}</dt>
          <dd className="mt-0.5 text-ink text-sm">
            {formatAngka(turunan.recallBersih, 4)}
          </dd>
        </div>
        <div>
          <dt className="label-caps">Recall {labels[1]}</dt>
          <dd className="mt-0.5 text-ink text-sm">
            {formatAngka(turunan.recallKotor, 4)}
          </dd>
        </div>
      </dl>
      <p className="text-ink-muted text-xs leading-relaxed">{data.sumber}</p>
    </div>
  );
};

export default ConfusionMatrixGrid;
