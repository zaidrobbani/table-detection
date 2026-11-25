import { ImageResponse } from "next/og";
import { SITE } from "@/shared/constant/routes";

export const alt = `${SITE.name}: ${SITE.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f6f4ef";
const INK = "#1b1f24";
const RULE = "#d9d4c7";
const ACCENT = "#2747d9";
const BERSIH = "#1f8a5b";
const KOTOR = "#c2410c";

export function renderOgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: PAPER,
        color: INK,
        backgroundImage: `linear-gradient(to right, ${RULE} 1px, transparent 1px), linear-gradient(to bottom, ${RULE} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        fontFamily: "serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 24,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: "#5a5f66",
        }}
      >
        Pengolahan Citra Digital · Visi Komputer · FILKOM UB 2026
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 104,
            fontWeight: 700,
            lineHeight: 1.05,
          }}
        >
          {SITE.title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 34,
            lineHeight: 1.35,
            maxWidth: 900,
            color: "#3a3f46",
          }}
        >
          MobileNetV2 tanpa PCD (P0) melawan CLAHE (P1), lengkap dengan
          Grad-CAM.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            display: "flex",
            padding: "10px 24px",
            border: `3px solid ${BERSIH}`,
            borderRadius: 6,
            color: BERSIH,
            fontSize: 36,
            fontWeight: 700,
          }}
        >
          Bersih
        </div>
        <div
          style={{
            display: "flex",
            padding: "10px 24px",
            border: `3px solid ${KOTOR}`,
            borderRadius: 6,
            color: KOTOR,
            fontSize: 36,
            fontWeight: 700,
          }}
        >
          Kotor
        </div>
        <div style={{ display: "flex", flex: 1 }} />
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: ACCENT,
            fontWeight: 700,
          }}
        >
          {SITE.name}
        </div>
      </div>
    </div>,
    { ...size },
  );
}

export default function Image() {
  return renderOgImage();
}
