/**
 * Akses data eksperimen. Komponen hanya boleh membaca data lewat berkas ini
 * (jangan import JSON langsung). Data dibangun oleh `bun run build:data`.
 * Semua fungsi sinkron karena data statis ikut bundel.
 */
import clahe from "./data/clahe.json";
import confusion from "./data/confusion.json";
import eksperimenA from "./data/eksperimen-a.json";
import figures from "./data/figures.json";
import history from "./data/history.json";
import metrics from "./data/metrics.json";
import samples from "./data/samples.json";
import stats from "./data/stats.json";
import type {
  ClaheData,
  ConfusionData,
  EksperimenAData,
  FiguresData,
  HistoryData,
  MetricsData,
  SamplesData,
  StatsData,
} from "./dto";

export const getMetrics = (): MetricsData => metrics as MetricsData;

export const getConfusion = (): ConfusionData => confusion as ConfusionData;

export const getStats = (): StatsData => stats as StatsData;

export const getHistory = (): HistoryData => history as HistoryData;

export const getClahe = (): ClaheData => clahe as ClaheData;

export const getSamples = (): SamplesData => samples as SamplesData;

/** null sampai data Eksperimen A (ML klasik) masuk. */
export const getEksperimenA = (): EksperimenAData | null =>
  eksperimenA as EksperimenAData | null;

export const getFigures = (): FiguresData => figures as FiguresData;
