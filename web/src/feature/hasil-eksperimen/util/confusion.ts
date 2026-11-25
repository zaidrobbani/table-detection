import type { Confusion } from "@/repository/eksperimen/dto";

export interface SelMatriks {
  aktual: 0 | 1;
  prediksi: 0 | 1;
  jumlah: number;
  /** Proporsi terhadap total baris (0..1) */
  proporsi: number;
  /** true bila sel diagonal (prediksi benar) */
  benar: boolean;
}

export interface TurunanConfusion {
  total: number;
  benar: number;
  akurasi: number;
  recallBersih: number;
  recallKotor: number;
}

/** Sel matriks beserta proporsi per baris (kelas aktual). */
export function buatSel(matrix: Confusion["matrix"]): SelMatriks[] {
  const hasil: SelMatriks[] = [];
  for (const aktual of [0, 1] as const) {
    const totalBaris = matrix[aktual][0] + matrix[aktual][1];
    for (const prediksi of [0, 1] as const) {
      const jumlah = matrix[aktual][prediksi];
      hasil.push({
        aktual,
        prediksi,
        jumlah,
        proporsi: totalBaris > 0 ? jumlah / totalBaris : 0,
        benar: aktual === prediksi,
      });
    }
  }
  return hasil;
}

/** Akurasi dan recall per kelas yang dihitung ulang dari matriks. */
export function hitungTurunan(matrix: Confusion["matrix"]): TurunanConfusion {
  const total = matrix[0][0] + matrix[0][1] + matrix[1][0] + matrix[1][1];
  const benar = matrix[0][0] + matrix[1][1];
  const bersih = matrix[0][0] + matrix[0][1];
  const kotor = matrix[1][0] + matrix[1][1];
  return {
    total,
    benar,
    akurasi: total > 0 ? benar / total : 0,
    recallBersih: bersih > 0 ? matrix[0][0] / bersih : 0,
    recallKotor: kotor > 0 ? matrix[1][1] / kotor : 0,
  };
}
