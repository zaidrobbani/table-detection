/**
 * Bangun data eksperimen: scripts/source/** (+ public/) -> src/repository/eksperimen/data/*.json
 *
 * Jalankan: bun run build:data
 *
 * Aturan: angka HANYA dari berkas sumber. Data yang belum ada menjadi null.
 * Berkas opsional dipakai otomatis bila nanti ditambahkan:
 *   C/metrics_validation.csv          -> metrik Validation C
 *   C/training_history_25epoch.csv    -> riwayat training C (atau C/training_history.csv)
 *   C/predictions_testing.csv         -> confusion Testing C eksak + prob_kotor_C
 *   C/predictions_validation.csv      -> confusion Validation C
 *   C/statistik_p0_vs_p1.csv          -> StatsData.tambahan
 *   perbandingan_B_vs_C.csv           -> ClaheData.tabel
 *   public/figures/**\/gradcam_*.png, visual_p0_vs_p1.png -> daftar figur
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";
import type {
  ClaheData,
  ClaheRow,
  Confusion,
  ConfusionData,
  EksperimenAData,
  FigureItem,
  FigureMissing,
  FiguresData,
  HistoryData,
  HistoryPoint,
  KelasKey,
  KelompokFigur,
  MetricsData,
  MetrikSplit,
  ModelKey,
  SampleItem,
  SamplesData,
  SplitKey,
  StatsData,
} from "../src/repository/eksperimen/dto";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "scripts", "source");
const PUBLIC = join(ROOT, "public");
const OUT = join(ROOT, "src", "repository", "eksperimen", "data");

/* ------------------------------------------------------------------ */
/* Util baca berkas                                                    */
/* ------------------------------------------------------------------ */

const sumberDipakai = (rel: string) => `scripts/source/${rel}`;

const adaFile = (rel: string) => existsSync(join(SRC, rel));

const bacaTeks = (rel: string) => readFileSync(join(SRC, rel), "utf8");

const bacaJson = <T>(rel: string): T => JSON.parse(bacaTeks(rel)) as T;

/** Pisahkan satu baris CSV dengan dukungan tanda kutip ganda. */
const pisahBaris = (baris: string): string[] => {
  const hasil: string[] = [];
  let kini = "";
  let dalamKutip = false;
  for (let i = 0; i < baris.length; i += 1) {
    const ch = baris[i];
    if (dalamKutip) {
      if (ch === '"' && baris[i + 1] === '"') {
        kini += '"';
        i += 1;
      } else if (ch === '"') dalamKutip = false;
      else kini += ch;
    } else if (ch === '"') dalamKutip = true;
    else if (ch === ",") {
      hasil.push(kini);
      kini = "";
    } else kini += ch;
  }
  hasil.push(kini);
  return hasil;
};

type Baris = Record<string, string>;

const bacaCsv = (rel: string): Baris[] => {
  const baris = bacaTeks(rel)
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((b) => b.trim() !== "");
  const [header, ...isi] = baris;
  if (!header) return [];
  const kolom = pisahBaris(header).map((k) => k.trim());
  return isi.map((b) => {
    const sel = pisahBaris(b);
    return Object.fromEntries(kolom.map((k, i) => [k, (sel[i] ?? "").trim()]));
  });
};

const angka = (v: string | undefined, konteks: string): number => {
  const n = Number(v);
  if (v === undefined || v === "" || Number.isNaN(n)) {
    throw new Error(`Nilai angka tidak valid untuk ${konteks}: "${v}"`);
  }
  return n;
};

/** CSV generik -> baris dengan angka dikonversi bila memungkinkan. */
const barisGenerik = (rows: Baris[]): ClaheRow[] =>
  rows.map((r) =>
    Object.fromEntries(
      Object.entries(r).map(([k, v]) => [
        k,
        v !== "" && !Number.isNaN(Number(v)) ? Number(v) : v,
      ]),
    ),
  );

const tulis = (nama: string, data: unknown) => {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, nama), `${JSON.stringify(data, null, 2)}\n`);
  console.log(`  tulis ${relative(ROOT, join(OUT, nama))}`);
};

const dekat = (a: number, b: number, tol: number, pesan: string) => {
  if (Math.abs(a - b) > tol) {
    throw new Error(`Cek konsistensi gagal: ${pesan} (${a} vs ${b})`);
  }
};

/* ------------------------------------------------------------------ */
/* Metrik                                                              */
/* ------------------------------------------------------------------ */

interface MetrikJson {
  variant: string;
  split: string;
  n_samples: number;
  accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  precision_bersih?: number;
  recall_bersih?: number;
  f1_bersih?: number;
  precision_kotor?: number;
  recall_kotor?: number;
  f1_kotor?: number;
  roc_auc?: number;
}

interface MetricsJson {
  C_testing: MetrikJson;
  B_testing_dihitung_ulang: MetrikJson;
  C_validation?: MetrikJson;
  uji_statistik: {
    n11: number;
    n10_B_benar_C_salah: number;
    n01_B_salah_C_benar: number;
    n00: number;
    p_mcnemar: number;
    delta_f1_macro: number;
    ci95_low: number;
    ci95_high: number;
  };
}

const dariCsvMacro = (
  r: Baris,
  model: ModelKey,
  split: SplitKey,
  extra?: Partial<MetrikJson>,
): MetrikSplit => ({
  model,
  variant: model === "B" ? "P0" : "P1",
  split,
  n_samples: angka(r.n_samples, "n_samples"),
  accuracy: angka(r.accuracy, "accuracy"),
  precision_macro: angka(r.precision_macro, "precision_macro"),
  recall_macro: angka(r.recall_macro, "recall_macro"),
  f1_macro: angka(r.f1_macro, "f1_macro"),
  precision_bersih: extra?.precision_bersih ?? null,
  recall_bersih: extra?.recall_bersih ?? null,
  f1_bersih: extra?.f1_bersih ?? null,
  precision_kotor: extra?.precision_kotor ?? null,
  recall_kotor: extra?.recall_kotor ?? null,
  f1_kotor: extra?.f1_kotor ?? null,
  roc_auc: extra?.roc_auc ?? null,
});

const dariJson = (
  m: MetrikJson,
  model: ModelKey,
  split: SplitKey,
): MetrikSplit => ({
  model,
  variant: model === "B" ? "P0" : "P1",
  split,
  n_samples: m.n_samples,
  accuracy: m.accuracy,
  precision_macro: m.precision_macro,
  recall_macro: m.recall_macro,
  f1_macro: m.f1_macro,
  precision_bersih: m.precision_bersih ?? null,
  recall_bersih: m.recall_bersih ?? null,
  f1_bersih: m.f1_bersih ?? null,
  precision_kotor: m.precision_kotor ?? null,
  recall_kotor: m.recall_kotor ?? null,
  f1_kotor: m.f1_kotor ?? null,
  roc_auc: m.roc_auc ?? null,
});

const buatMetrics = (mj: MetricsJson): MetricsData => {
  const sumber = [
    sumberDipakai("B/metrics_testing.csv"),
    sumberDipakai("B/metrics_validation.csv"),
    sumberDipakai("C/metrics.json"),
  ];
  const catatan: string[] = [];

  const bTestCsv = bacaCsv("B/metrics_testing.csv")[0];
  const bValCsv = bacaCsv("B/metrics_validation.csv")[0];
  if (!bTestCsv || !bValCsv) throw new Error("metrics B kosong");

  // Per-kelas B Testing hanya ada di C/metrics.json (B_testing_dihitung_ulang).
  const B_testing = dariCsvMacro(
    bTestCsv,
    "B",
    "Testing",
    mj.B_testing_dihitung_ulang,
  );
  dekat(
    B_testing.accuracy,
    mj.B_testing_dihitung_ulang.accuracy,
    1e-9,
    "acc B csv vs json",
  );
  dekat(
    B_testing.f1_macro,
    mj.B_testing_dihitung_ulang.f1_macro,
    1e-9,
    "f1 B csv vs json",
  );

  const B_validation = dariCsvMacro(bValCsv, "B", "Validation");
  catatan.push(
    "Validation B hanya memiliki metrik macro (tanpa per kelas dan ROC AUC) di berkas sumber.",
  );

  const C_testing = dariJson(mj.C_testing, "C", "Testing");

  let C_validation: MetrikSplit | null = null;
  if (adaFile("C/metrics_validation.csv")) {
    const r = bacaCsv("C/metrics_validation.csv")[0];
    if (r) C_validation = dariCsvMacro(r, "C", "Validation");
    sumber.push(sumberDipakai("C/metrics_validation.csv"));
  } else if (mj.C_validation) {
    C_validation = dariJson(mj.C_validation, "C", "Validation");
  } else {
    catatan.push(
      "Metrik Validation C belum tersedia di web_assets. Jalankan ulang Rapikan_Folder_DL.ipynb.",
    );
  }

  return {
    sumber,
    catatan,
    Testing: { B: B_testing, C: C_testing },
    Validation: { B: B_validation, C: C_validation },
  };
};

/* ------------------------------------------------------------------ */
/* Confusion                                                           */
/* ------------------------------------------------------------------ */

interface Pred {
  key: string;
  kelas: KelasKey;
  y_true: number;
  y_pred: number;
  prob_kotor: number;
}

const bacaPrediksi = (rel: string): Pred[] =>
  bacaCsv(rel).map((r) => ({
    key: r.key ?? "",
    kelas: (r.kelas === "Kotor" ? "Kotor" : "Bersih") as KelasKey,
    y_true: angka(r.y_true, `${rel} y_true`),
    y_pred: angka(r.y_pred, `${rel} y_pred`),
    prob_kotor: angka(r.prob_kotor, `${rel} prob_kotor`),
  }));

const confusionDariPrediksi = (
  rel: string,
  model: ModelKey,
  split: SplitKey,
): Confusion => {
  const preds = bacaPrediksi(rel);
  const m: [[number, number], [number, number]] = [
    [0, 0],
    [0, 0],
  ];
  for (const p of preds) m[p.y_true === 1 ? 1 : 0][p.y_pred === 1 ? 1 : 0] += 1;
  return {
    model,
    split,
    n: preds.length,
    matrix: m,
    total_per_kelas: [m[0][0] + m[0][1], m[1][0] + m[1][1]],
    turunan: false,
    sumber: `Dihitung dari ${sumberDipakai(rel)} (satu baris per citra, ambang 0,5).`,
  };
};

const buatConfusion = (metrics: MetricsData): ConfusionData => {
  const B_test = confusionDariPrediksi(
    "B/predictions_testing.csv",
    "B",
    "Testing",
  );
  const B_val = confusionDariPrediksi(
    "B/predictions_validation.csv",
    "B",
    "Validation",
  );

  // Cek silang dengan metrik B
  dekat(
    (B_test.matrix[0][0] + B_test.matrix[1][1]) / B_test.n,
    metrics.Testing.B.accuracy,
    1e-9,
    "accuracy B Testing dari confusion vs metrics",
  );
  dekat(
    (B_val.matrix[0][0] + B_val.matrix[1][1]) / B_val.n,
    metrics.Validation.B?.accuracy ?? 0,
    1e-9,
    "accuracy B Validation dari confusion vs metrics",
  );

  // C Testing: eksak dari prediksi bila ada, selain itu diturunkan dari recall per kelas.
  let C_test: Confusion;
  if (adaFile("C/predictions_testing.csv")) {
    C_test = confusionDariPrediksi("C/predictions_testing.csv", "C", "Testing");
  } else {
    const c = metrics.Testing.C;
    const nBersih = B_test.total_per_kelas[0]; // 26, jumlah citra Testing per kelas sama untuk B dan C
    const nKotor = B_test.total_per_kelas[1]; // 28
    if (c.recall_bersih === null || c.recall_kotor === null) {
      throw new Error(
        "recall per kelas C tidak ada; confusion C tidak dapat diturunkan",
      );
    }
    const bersihBenar = Math.round(c.recall_bersih * nBersih);
    const kotorBenar = Math.round(c.recall_kotor * nKotor);
    // Cek silang: harus cocok dengan accuracy dan precision per kelas di metrics.json
    dekat(
      (bersihBenar + kotorBenar) / (nBersih + nKotor),
      c.accuracy,
      1e-9,
      "accuracy C turunan",
    );
    dekat(
      bersihBenar / (bersihBenar + (nKotor - kotorBenar)),
      c.precision_bersih ?? 0,
      1e-9,
      "precision Bersih C turunan",
    );
    dekat(
      kotorBenar / (kotorBenar + (nBersih - bersihBenar)),
      c.precision_kotor ?? 0,
      1e-9,
      "precision Kotor C turunan",
    );
    C_test = {
      model: "C",
      split: "Testing",
      n: nBersih + nKotor,
      matrix: [
        [bersihBenar, nBersih - bersihBenar],
        [nKotor - kotorBenar, kotorBenar],
      ],
      total_per_kelas: [nBersih, nKotor],
      turunan: true,
      sumber: `Diturunkan dari recall per kelas di ${sumberDipakai("C/metrics.json")} (Bersih benar = round(recall_bersih x ${nBersih}) = ${bersihBenar}, Kotor benar = round(recall_kotor x ${nKotor}) = ${kotorBenar}). Prediksi per citra C belum tersedia. Hasil dicek silang dengan akurasi dan presisi per kelas.`,
    };
  }

  const C_val = adaFile("C/predictions_validation.csv")
    ? confusionDariPrediksi("C/predictions_validation.csv", "C", "Validation")
    : null;

  return {
    labels: ["Bersih", "Kotor"],
    Testing: { B: B_test, C: C_test },
    Validation: { B: B_val, C: C_val },
  };
};

/* ------------------------------------------------------------------ */
/* Uji statistik                                                       */
/* ------------------------------------------------------------------ */

const buatStats = (mj: MetricsJson): StatsData => {
  const u = mj.uji_statistik;
  const n = u.n11 + u.n10_B_benar_C_salah + u.n01_B_salah_C_benar + u.n00;
  const tambahan = adaFile("C/statistik_p0_vs_p1.csv")
    ? barisGenerik(bacaCsv("C/statistik_p0_vs_p1.csv"))
    : null;
  return {
    split: "Testing",
    n,
    n11: u.n11,
    n10_B_benar_C_salah: u.n10_B_benar_C_salah,
    n01_B_salah_C_benar: u.n01_B_salah_C_benar,
    n00: u.n00,
    p_mcnemar: u.p_mcnemar,
    delta_f1_macro: u.delta_f1_macro,
    ci95_low: u.ci95_low,
    ci95_high: u.ci95_high,
    sumber: `${sumberDipakai("C/metrics.json")} (uji_statistik)${tambahan ? `, ${sumberDipakai("C/statistik_p0_vs_p1.csv")}` : ""}`,
    tambahan,
  };
};

/* ------------------------------------------------------------------ */
/* History                                                             */
/* ------------------------------------------------------------------ */

const bacaHistory = (rel: string): HistoryPoint[] =>
  bacaCsv(rel).map((r, i) => ({
    epoch: r.epoch ? angka(r.epoch, `${rel} epoch`) : i + 1,
    accuracy: angka(r.accuracy, `${rel} accuracy`),
    loss: angka(r.loss, `${rel} loss`),
    precision: angka(r.precision, `${rel} precision`),
    recall: angka(r.recall, `${rel} recall`),
    val_accuracy: angka(r.val_accuracy, `${rel} val_accuracy`),
    val_loss: angka(r.val_loss, `${rel} val_loss`),
    val_precision: angka(r.val_precision, `${rel} val_precision`),
    val_recall: angka(r.val_recall, `${rel} val_recall`),
  }));

interface ConfigC {
  epochs_stage1: number;
  epochs_total: number;
  pcd_config: {
    output_size: number;
    padding_rgb: [number, number, number];
    clahe_clip_limit: number;
    clahe_tile_grid: [number, number];
  };
}

const buatHistory = (cfg: ConfigC): HistoryData => {
  const sumber = [
    sumberDipakai("B/training_history_25epoch.csv"),
    sumberDipakai("C/config_eksperimen_C.json"),
  ];
  const B = bacaHistory("B/training_history_25epoch.csv");
  if (B.length !== cfg.epochs_total) {
    throw new Error(
      `Jumlah epoch B (${B.length}) != epochs_total (${cfg.epochs_total})`,
    );
  }
  const relC = [
    "C/training_history_25epoch.csv",
    "C/training_history.csv",
  ].find(adaFile);
  const C = relC ? bacaHistory(relC) : null;
  if (relC) sumber.push(sumberDipakai(relC));
  return {
    tahap2_mulai_epoch: cfg.epochs_stage1 + 1,
    epochs_total: cfg.epochs_total,
    B,
    C,
    sumber,
  };
};

/* ------------------------------------------------------------------ */
/* CLAHE                                                               */
/* ------------------------------------------------------------------ */

/** Cari berkas dengan nama tertentu di public/figures (rekursif). */
const daftarFigurPublik = (): string[] => {
  const dasar = join(PUBLIC, "figures");
  if (!existsSync(dasar)) return [];
  const hasil: string[] = [];
  const jelajah = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) jelajah(p);
      else if (/\.(png|jpe?g|webp)$/i.test(e.name)) {
        hasil.push(`/${relative(PUBLIC, p).split("\\").join("/")}`);
      }
    }
  };
  jelajah(dasar);
  return hasil.sort();
};

const cariFigur = (daftar: string[], nama: string): string | null =>
  daftar.find((p) => p.endsWith(`/${nama}`)) ?? null;

const buatClahe = (cfg: ConfigC, figurPublik: string[]): ClaheData => {
  const relTabel = [
    "perbandingan_B_vs_C.csv",
    "C/perbandingan_B_vs_C.csv",
    "B/perbandingan_B_vs_C.csv",
  ].find(adaFile);
  const sumber = [sumberDipakai("C/config_eksperimen_C.json")];
  if (relTabel) sumber.push(sumberDipakai(relTabel));
  return {
    parameter: {
      output_size: cfg.pcd_config.output_size,
      padding_rgb: cfg.pcd_config.padding_rgb,
      clahe_clip_limit: cfg.pcd_config.clahe_clip_limit,
      clahe_tile_grid: cfg.pcd_config.clahe_tile_grid,
      ruang_warna: "LAB (CLAHE hanya pada kanal L)",
    },
    tabel: relTabel ? barisGenerik(bacaCsv(relTabel)) : null,
    figur: cariFigur(figurPublik, "visual_p0_vs_p1.png"),
    sumber,
  };
};

/* ------------------------------------------------------------------ */
/* Samples                                                             */
/* ------------------------------------------------------------------ */

const buatSamples = (): SamplesData => {
  const daftar = JSON.parse(
    readFileSync(join(PUBLIC, "samples", "samples.json"), "utf8"),
  ) as { file: string; label: KelasKey }[];

  const probPer = (rel: string): Map<string, number> => {
    const peta = new Map<string, number>();
    if (!adaFile(rel)) return peta;
    for (const p of bacaPrediksi(rel))
      peta.set(p.key.split("/").pop() ?? p.key, p.prob_kotor);
    return peta;
  };
  const probB = probPer("B/predictions_testing.csv");
  const probC = probPer("C/predictions_testing.csv");

  const samples: SampleItem[] = daftar.map((s) => {
    if (!existsSync(join(PUBLIC, "samples", s.file))) {
      throw new Error(`Berkas contoh tidak ada: public/samples/${s.file}`);
    }
    return {
      file: s.file,
      url: `/samples/${s.file}`,
      label: s.label,
      prob_kotor_B: probB.get(s.file) ?? null,
      prob_kotor_C: probC.get(s.file) ?? null,
    };
  });
  return { samples };
};

/* ------------------------------------------------------------------ */
/* Figur                                                               */
/* ------------------------------------------------------------------ */

interface KatalogFigur {
  nama: string;
  id: string;
  judul: string;
  caption: string;
  kelompok: KelompokFigur;
  model: FigureItem["model"];
}

const KATALOG_FIGUR: KatalogFigur[] = [
  {
    nama: "confusion_matrix_testing.png",
    id: "cm-b-testing",
    judul: "Confusion matrix B, Testing",
    caption: "Confusion matrix model B (tanpa PCD, P0) pada 54 citra Testing.",
    kelompok: "confusion",
    model: "B",
  },
  {
    nama: "confusion_matrix_validation.png",
    id: "cm-b-validation",
    judul: "Confusion matrix B, Validation",
    caption:
      "Confusion matrix model B (tanpa PCD, P0) pada 52 citra Validation.",
    kelompok: "confusion",
    model: "B",
  },
  {
    nama: "training_curve.png",
    id: "kurva-b-15",
    judul: "Kurva training B, tahap 1",
    caption:
      "Loss dan akurasi model B selama 15 epoch tahap 1 (backbone beku).",
    kelompok: "training",
    model: "B",
  },
  {
    nama: "training_curve_25epoch.png",
    id: "kurva-b-25",
    judul: "Kurva training B, 25 epoch",
    caption:
      "Loss dan akurasi model B selama 25 epoch; tahap 2 dimulai pada epoch 16.",
    kelompok: "training",
    model: "B",
  },
  {
    nama: "gradcam_B_vs_C.png",
    id: "gradcam-b-vs-c",
    judul: "Grad-CAM B vs C",
    caption:
      "Perbandingan Grad-CAM model B (P0) dan C (P1) pada citra yang sama.",
    kelompok: "gradcam",
    model: "B_vs_C",
  },
  {
    nama: "gradcam_kesalahan_C.png",
    id: "gradcam-kesalahan-c",
    judul: "Grad-CAM kesalahan model C",
    caption: "Grad-CAM pada citra yang salah diklasifikasi model C.",
    kelompok: "gradcam",
    model: "C",
  },
  {
    nama: "visual_p0_vs_p1.png",
    id: "visual-p0-p1",
    judul: "Visual P0 vs P1",
    caption: "Perbandingan visual citra tanpa PCD (P0) dan dengan CLAHE (P1).",
    kelompok: "clahe",
    model: "B_vs_C",
  },
];

const buatFigures = (figurPublik: string[]): FiguresData => {
  const tersedia: FigureItem[] = [];
  const belum_ada: FigureMissing[] = [];
  const terpakai = new Set<string>();

  for (const k of KATALOG_FIGUR) {
    const src = cariFigur(figurPublik, k.nama);
    if (src) {
      terpakai.add(src);
      tersedia.push({
        id: k.id,
        judul: k.judul,
        caption: k.caption,
        src,
        kelompok: k.kelompok,
        model: k.model,
      });
    } else {
      belum_ada.push({
        id: k.id,
        judul: k.judul,
        kelompok: k.kelompok,
        nama_file: k.nama,
      });
    }
  }

  // Figur lain yang ada di public/figures tetapi belum ada di katalog.
  for (const src of figurPublik) {
    if (terpakai.has(src)) continue;
    const nama = src.split("/").pop() ?? src;
    const kelompok: KelompokFigur = /gradcam/i.test(nama)
      ? "gradcam"
      : /confusion/i.test(nama)
        ? "confusion"
        : /clahe|p0_vs_p1/i.test(nama)
          ? "clahe"
          : "training";
    const model: FigureItem["model"] = src.includes("/C/")
      ? "C"
      : src.includes("/B/")
        ? "B"
        : "B_vs_C";
    tersedia.push({
      id: nama.replace(/\.[^.]+$/, "").toLowerCase(),
      judul: nama.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
      caption: `Figur ${nama}.`,
      src,
      kelompok,
      model,
    });
  }
  return { tersedia, belum_ada };
};

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

const main = () => {
  console.log("Membangun data eksperimen dari scripts/source ...");
  const mj = bacaJson<MetricsJson>("C/metrics.json");
  const cfg = bacaJson<ConfigC>("C/config_eksperimen_C.json");
  const figurPublik = daftarFigurPublik();

  const metrics = buatMetrics(mj);
  const confusion = buatConfusion(metrics);
  const stats = buatStats(mj);
  const history = buatHistory(cfg);
  const clahe = buatClahe(cfg, figurPublik);
  const samples = buatSamples();
  const figures = buatFigures(figurPublik);
  const eksperimenA: EksperimenAData | null = null; // menunggu data dari Fahry

  // Cek silang uji McNemar: n11 + n10 = benar B, n11 + n01 = benar C
  const nTest = stats.n;
  dekat(
    (stats.n11 + stats.n10_B_benar_C_salah) / nTest,
    metrics.Testing.B.accuracy,
    1e-9,
    "acc B dari McNemar",
  );
  dekat(
    (stats.n11 + stats.n01_B_salah_C_benar) / nTest,
    metrics.Testing.C.accuracy,
    1e-9,
    "acc C dari McNemar",
  );

  tulis("metrics.json", metrics);
  tulis("confusion.json", confusion);
  tulis("stats.json", stats);
  tulis("history.json", history);
  tulis("clahe.json", clahe);
  tulis("samples.json", samples);
  tulis("eksperimen-a.json", eksperimenA);
  tulis("figures.json", figures);
  console.log("Selesai.");
};

main();
