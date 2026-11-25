"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import type { MetrikSplit } from "@/repository/eksperimen/dto";
import ClientOnly from "@/shared/component/ClientOnly";
import { formatAngka } from "@/shared/util/number";
import { METRIK_TESTING, NAMA_MODEL } from "../data";

interface MetricCompareChartProps {
  testing: { B: MetrikSplit; C: MetrikSplit };
}

const TEKS_AXIS = {
  fill: "var(--ink-muted)",
  fontSize: 11,
  fontFamily: "var(--font-mono)",
};

/**
 * Bar berkelompok per metrik Testing, B vs C. Sumbu default 0–1; tombol
 * "Zoom 0,6–1" memotong sumbu dan diberi catatan agar jujur.
 */
const MetricCompareChart = ({ testing }: MetricCompareChartProps) => {
  const [zoom, setZoom] = useState(false);

  const data = METRIK_TESTING.flatMap((m) => {
    const b = testing.B[m.key];
    const c = testing.C[m.key];
    if (typeof b !== "number" && typeof c !== "number") return [];
    return [{ metrik: m.singkat, B: b, C: c }];
  });

  const batasBawah = zoom ? 0.6 : 0;
  const ringkasan = data
    .map(
      (d) => `${d.metrik}: B ${formatAngka(d.B, 4)}, C ${formatAngka(d.C, 4)}`,
    )
    .join("; ");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          {(["B", "C"] as const).map((k) => (
            <li key={k} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block size-3 rounded-[3px]"
                style={{ background: `var(--series-${k.toLowerCase()})` }}
              />
              {NAMA_MODEL[k]}
            </li>
          ))}
        </ul>
        <fieldset className="m-0 flex min-w-0 items-center gap-1 border-0 p-0">
          <legend className="sr-only">Skala sumbu</legend>
          <Button
            type="button"
            size="sm"
            variant={zoom ? "outline" : "default"}
            aria-pressed={!zoom}
            onClick={() => setZoom(false)}
          >
            Skala 0–1
          </Button>
          <Button
            type="button"
            size="sm"
            variant={zoom ? "default" : "outline"}
            aria-pressed={zoom}
            onClick={() => setZoom(true)}
          >
            Zoom 0,6–1
          </Button>
        </fieldset>
      </div>

      {zoom ? (
        <p className="text-sm text-warning-ink">
          Sumbu dipotong: dimulai dari 0,6 sehingga panjang batang tidak
          sebanding dengan nilai. Baca angka pada tabel atau tooltip.
        </p>
      ) : null}

      <div
        role="img"
        aria-label={`Diagram batang berkelompok metrik Testing model B dan C. ${ringkasan}. Angka yang sama tersedia pada tabel di atas.`}
        className="h-[580px] w-full"
      >
        <ClientOnly>
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 640, height: 580 }}
          >
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
              barGap={2}
              barCategoryGap="22%"
              accessibilityLayer={false}
            >
              <CartesianGrid
                horizontal={false}
                stroke="var(--rule)"
                strokeWidth={1}
              />
              <XAxis
                type="number"
                domain={[batasBawah, 1]}
                allowDataOverflow
                tickFormatter={(v: number) => formatAngka(v, 1)}
                tick={TEKS_AXIS}
                stroke="var(--rule-strong)"
              />
              <YAxis
                type="category"
                dataKey="metrik"
                width={118}
                tick={TEKS_AXIS}
                stroke="var(--rule-strong)"
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--paper-sunken)", opacity: 0.6 }}
                contentStyle={{
                  background: "var(--paper-raised)",
                  border: "1px solid var(--rule)",
                  borderRadius: 6,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--ink)",
                }}
                labelStyle={{ color: "var(--ink)", fontWeight: 600 }}
                itemStyle={{ color: "var(--ink)" }}
                formatter={(v) => formatAngka(Number(v), 4)}
              />
              <Bar
                dataKey="B"
                name={NAMA_MODEL.B}
                fill="var(--series-b)"
                radius={[0, 4, 4, 0]}
                maxBarSize={14}
              />
              <Bar
                dataKey="C"
                name={NAMA_MODEL.C}
                fill="var(--series-c)"
                radius={[0, 4, 4, 0]}
                maxBarSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </ClientOnly>
      </div>
    </div>
  );
};

export default MetricCompareChart;
