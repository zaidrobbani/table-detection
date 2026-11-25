export const ROUTES = {
  DEMO: "/",
  BANDINGKAN: "/bandingkan",
  HASIL: "/hasil",
} as const;

export interface NavItem {
  label: string;
  href: string;
  /** Penjelasan singkat untuk title/aria. */
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Demo",
    href: ROUTES.DEMO,
    description: "Unggah foto meja dan lihat hasil deteksi",
  },
  {
    label: "Bandingkan",
    href: ROUTES.BANDINGKAN,
    description: "Bandingkan model tanpa PCD dan dengan CLAHE",
  },
  {
    label: "Hasil",
    href: ROUTES.HASIL,
    description: "Hasil eksperimen dan uji statistik",
  },
];

export const SITE = {
  name: "Meja Bersih",
  title: "Deteksi Kebersihan Meja",
  description:
    "Klasifikasi foto meja Bersih atau Kotor dengan MobileNetV2, membandingkan model tanpa pra-pemrosesan (P0) dan dengan CLAHE (P1), lengkap dengan Grad-CAM dan hasil eksperimen.",
  course: "Pengolahan Citra Digital dan Visi Komputer",
  institution: "FILKOM Universitas Brawijaya",
  year: 2026,
  group: "Kelompok PCD + Viskom",
  members: ["Faruqi", "Fahry", "Zaid"],
  references: [
    {
      label: "MobileNetV2 (Sandler dkk.)",
      detail: "arXiv:1801.04381",
      href: "https://arxiv.org/abs/1801.04381",
    },
    {
      label: "Grad-CAM (Selvaraju dkk.)",
      detail: "arXiv:1610.02391",
      href: "https://arxiv.org/abs/1610.02391",
    },
    {
      label: "CLAHE (Zuiderveld, 1994)",
      detail: "Graphics Gems IV",
      href: undefined as string | undefined,
    },
  ],
} as const;
