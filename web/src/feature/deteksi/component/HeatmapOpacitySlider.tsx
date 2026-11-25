"use client";

import { useId } from "react";
import { Slider } from "@/components/ui/slider";
import { HEATMAP } from "../data";

interface HeatmapOpacitySliderProps {
  /** 0..100 */
  nilai: number;
  onChange: (nilai: number) => void;
}

/** Mengatur opasitas lapisan Grad-CAM di atas input model. */
const HeatmapOpacitySlider = ({
  nilai,
  onChange,
}: HeatmapOpacitySliderProps) => {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <span className="label-caps" id={id}>
        {HEATMAP.label} <span className="tabular text-ink">{nilai}%</span>
      </span>
      <Slider
        aria-labelledby={id}
        min={0}
        max={100}
        step={5}
        value={[nilai]}
        onValueChange={([v]) => onChange(v ?? 0)}
        className="py-2"
      />
    </div>
  );
};

export default HeatmapOpacitySlider;
