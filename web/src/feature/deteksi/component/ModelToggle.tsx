"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ModelId } from "@/repository/prediksi/dto";
import { HASIL, MODEL } from "../data";

interface ModelToggleProps {
  nilai: ModelId;
  onChange: (model: ModelId) => void;
}

const URUTAN: ModelId[] = ["C", "B"];

/** Pilih model C (default, dengan CLAHE) atau B (baseline tanpa PCD). */
const ModelToggle = ({ nilai, onChange }: ModelToggleProps) => (
  <ToggleGroup
    type="single"
    variant="outline"
    spacing={0}
    value={nilai}
    aria-label={HASIL.modelLabel}
    onValueChange={(v) => {
      // Radix mengirim "" saat item aktif ditekan lagi; abaikan.
      if (v === "B" || v === "C") onChange(v);
    }}
    className="w-full sm:w-fit"
  >
    {URUTAN.map((id) => (
      <ToggleGroupItem
        key={id}
        value={id}
        aria-label={`${MODEL[id].label}, ${MODEL[id].singkat}`}
        className="h-auto flex-1 flex-col gap-0 px-3 py-1.5 data-[state=on]:border-brand data-[state=on]:bg-brand-subtle data-[state=on]:text-ink sm:flex-none"
      >
        <span className="font-medium">{MODEL[id].label}</span>
        <span className="font-normal text-ink-muted text-xs">
          {MODEL[id].singkat}
        </span>
      </ToggleGroupItem>
    ))}
  </ToggleGroup>
);

export default ModelToggle;
