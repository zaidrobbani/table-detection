"use client";

import { IconCrop, IconPhotoX } from "@tabler/icons-react";
import { useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import SectionCard from "@/shared/component/SectionCard";
import { CROP, PILIHAN_RASIO, ZOOM } from "../data";

interface CropStepProps {
  /** URL objek foto yang akan dipotong */
  sumber: string;
  /** Sedang memproses potongan atau menyiapkan unggahan */
  sibuk: boolean;
  onAnalisis: (area: Area) => void;
  onLewati: () => void;
  onBatal: () => void;
}

/**
 * Langkah potong. react-easy-crop tidak mendukung rasio bebas, jadi tersedia
 * pilihan rasio: Asli (mengikuti foto), 1:1, 4:3, dan 3:4.
 */
const CropStep = ({
  sumber,
  sibuk,
  onAnalisis,
  onLewati,
  onBatal,
}: CropStepProps) => {
  const [posisi, setPosisi] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(ZOOM.min);
  const [rasioId, setRasioId] = useState(PILIHAN_RASIO[0]?.id ?? "asli");
  const [rasioAsli, setRasioAsli] = useState(4 / 3);
  const [area, setArea] = useState<Area | null>(null);
  const [gagalMuat, setGagalMuat] = useState(false);

  const pilihan = PILIHAN_RASIO.find((r) => r.id === rasioId);
  const aspect = pilihan?.nilai ?? rasioAsli;

  return (
    <SectionCard
      label={CROP.label}
      title={CROP.judul}
      description={CROP.bantuan}
    >
      <div className="flex flex-col gap-5">
        <div className="relative h-[min(65dvh,32rem)] w-full overflow-hidden rounded-md border border-rule bg-ink">
          {gagalMuat ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-paper-sunken p-6 text-center">
              <IconPhotoX
                aria-hidden="true"
                className="size-8 text-ink-muted"
              />
              <p className="max-w-sm text-ink text-sm">{CROP.gagalMuat}</p>
            </div>
          ) : (
            <Cropper
              image={sumber}
              crop={posisi}
              zoom={zoom}
              minZoom={ZOOM.min}
              maxZoom={ZOOM.maks}
              aspect={aspect}
              onCropChange={setPosisi}
              onZoomChange={setZoom}
              onCropComplete={(_, piksel) => setArea(piksel)}
              onMediaLoaded={(m) =>
                setRasioAsli(m.naturalWidth / m.naturalHeight)
              }
              mediaProps={{ onError: () => setGagalMuat(true), alt: "" }}
            />
          )}
        </div>

        <p className="text-ink-muted text-sm">{CROP.petunjukKeyboard}</p>

        <div className="grid gap-5 sm:grid-cols-2">
          <fieldset className="flex flex-col gap-2">
            <legend className="label-caps mb-2">{CROP.rasio}</legend>
            <div className="flex flex-wrap gap-2">
              {PILIHAN_RASIO.map((r) => (
                <label
                  key={r.id}
                  className={cn(
                    "flex h-8 cursor-pointer items-center rounded-md border px-3 font-mono text-sm transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand has-[:focus-visible]:outline-offset-2",
                    rasioId === r.id
                      ? "border-brand bg-brand-subtle text-ink"
                      : "border-rule-strong bg-paper-raised text-ink-muted hover:text-ink",
                  )}
                >
                  <input
                    type="radio"
                    name="rasio-crop"
                    value={r.id}
                    checked={rasioId === r.id}
                    onChange={() => setRasioId(r.id)}
                    className="sr-only"
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <span className="label-caps" id="label-zoom">
              {CROP.zoom}{" "}
              <span className="tabular text-ink">{zoom.toFixed(2)}x</span>
            </span>
            <Slider
              aria-labelledby="label-zoom"
              min={ZOOM.min}
              max={ZOOM.maks}
              step={ZOOM.langkah}
              value={[zoom]}
              onValueChange={([v]) => setZoom(v ?? ZOOM.min)}
              className="py-2"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-rule border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={onBatal}
            disabled={sibuk}
          >
            {CROP.batal}
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onLewati}
              disabled={sibuk}
            >
              {CROP.lewati}
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={() => area && onAnalisis(area)}
              disabled={sibuk || gagalMuat || !area}
            >
              <IconCrop aria-hidden="true" data-icon="inline-start" />
              {sibuk ? CROP.menganalisis : CROP.analisis}
            </Button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default CropStep;
