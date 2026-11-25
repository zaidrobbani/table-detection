import type { StatsData } from "@/repository/eksperimen/dto";
import { formatAngka, formatDelta } from "@/shared/util/number";

export interface KesimpulanUji {
  signifikan: boolean;
  ciMelewatiNol: boolean;
  /** Kalimat utama berdasarkan p-value */
  kalimat: string;
  /** Kalimat tentang CI95 ΔF1 macro */
  kalimatCi: string;
}

/**
 * Menyusun kesimpulan uji McNemar secara otomatis dari data.
 * Ambang alpha dan jumlah citra (n) dibaca dari argumen/data, bukan hardcode.
 */
export function buatKesimpulanUji(
  stats: StatsData,
  alpha = 0.05,
): KesimpulanUji {
  const signifikan = stats.p_mcnemar < alpha;
  const ciMelewatiNol = stats.ci95_low <= 0 && stats.ci95_high >= 0;
  const p = formatAngka(stats.p_mcnemar, 3);
  const a = formatAngka(alpha, 2);

  const kalimat = signifikan
    ? `p = ${p} < ${a}: perbedaan B dan C signifikan secara statistik.`
    : `p = ${p} ≥ ${a}: perbedaan B dan C belum signifikan, test set hanya ${stats.n} citra.`;

  const rentang = `[${formatDelta(stats.ci95_low, 4)}; ${formatDelta(stats.ci95_high, 4)}]`;
  const kalimatCi = ciMelewatiNol
    ? `CI95 bootstrap ΔF1 macro ${rentang} melewati 0, jadi arah selisih belum bisa dipastikan.`
    : stats.ci95_low > 0
      ? `CI95 bootstrap ΔF1 macro ${rentang} berada di atas 0, selisih mengarah ke keunggulan C.`
      : `CI95 bootstrap ΔF1 macro ${rentang} berada di bawah 0, selisih mengarah ke keunggulan B.`;

  return { signifikan, ciMelewatiNol, kalimat, kalimatCi };
}
