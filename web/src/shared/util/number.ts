/**
 * Format angka gaya Indonesia: koma sebagai pemisah desimal.
 * Memakai Intl bila tersedia, tetapi hasil dinormalkan supaya SSR dan klien
 * sama persis.
 */

const nf = (digits: number) =>
  new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

/** formatAngka(0.81481, 4) -> "0,8148" */
export function formatAngka(value: number | null | undefined, digits = 4) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return nf(digits).format(value);
}

/** formatPersen(0.8148) -> "81,5%" ; nilai 0..1 */
export function formatPersen(value: number | null | undefined, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${nf(digits).format(value * 100)}%`;
}

/** formatDelta(0.0575, 4) -> "+0,0575" ; selalu bertanda */
export function formatDelta(value: number | null | undefined, digits = 4) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const abs = nf(digits).format(Math.abs(value));
  if (value > 0) return `+${abs}`;
  if (value < 0) return `−${abs}`;
  return abs;
}

/** formatDeltaPersen(0.0575) -> "+5,7 poin" ; selisih proporsi dalam poin persen */
export function formatDeltaPoin(value: number | null | undefined, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const abs = nf(digits).format(Math.abs(value * 100));
  if (value > 0) return `+${abs} poin`;
  if (value < 0) return `−${abs} poin`;
  return `${abs} poin`;
}

/** formatMs(842.3) -> "842 ms" ; di atas 1 dtk -> "1,2 dtk" */
export function formatMs(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  if (value >= 1000) return `${nf(1).format(value / 1000)} dtk`;
  return `${nf(0).format(value)} ms`;
}

/** formatUkuran(3_200_000) -> "3,1 MB" */
export function formatUkuran(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${nf(0).format(bytes / 1024)} KB`;
  return `${nf(1).format(bytes / (1024 * 1024))} MB`;
}
