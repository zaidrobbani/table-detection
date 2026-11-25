import { renderOgImage } from "./opengraph-image";

export const alt = "Meja Bersih: Deteksi Kebersihan Meja";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage();
}
