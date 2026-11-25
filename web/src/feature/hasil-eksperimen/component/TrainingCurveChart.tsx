"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistoryPoint, ModelKey } from "@/repository/eksperimen/dto";
import ClientOnly from "@/shared/component/ClientOnly";
import { formatAngka } from "@/shared/util/number";

interface TrainingCurveChartProps {
  data: HistoryPoint[];
  model: ModelKey;
  /** Epoch pertama tahap 2 (fine-tuning) */
  tahap2Mulai: number;
}

const TEKS_AXIS = {
  fill: "var(--ink-muted)",
  fontSize: 11,
  fontFamily: "var(--font-mono)",
};

interface PanelProps {
  data: HistoryPoint[];
  judul: string;
  trainKey: "loss" | "accuracy";
  valKey: "val_loss" | "val_accuracy";
  warna: string;
  tahap2Mulai: number;
  domain?: [number, number];
}

const Panel = ({
  data,
  judul,
  trainKey,
  valKey,
  warna,
  tahap2Mulai,
  domain,
}: PanelProps) => (
  <div className="flex flex-col gap-2">
    <p className="label-caps">{judul}</p>
    <div
      role="img"
      aria-label={`Kurva ${judul}: garis train dan validation per epoch, ${data.length} epoch. Tahap 2 dimulai pada epoch ${tahap2Mulai}.`}
      className="h-[280px] w-full"
    >
      <ClientOnly>
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 480, height: 280 }}
        >
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, bottom: 4, left: 0 }}
            accessibilityLayer={false}
          >
            <CartesianGrid stroke="var(--rule)" vertical={false} />
            <XAxis
              dataKey="epoch"
              tick={TEKS_AXIS}
              stroke="var(--rule-strong)"
              tickLine={false}
              label={{
                value: "Epoch",
                position: "insideBottomRight",
                offset: -2,
                style: TEKS_AXIS,
              }}
            />
            <YAxis
              domain={domain ?? ["auto", "auto"]}
              tick={TEKS_AXIS}
              stroke="var(--rule-strong)"
              tickLine={false}
              width={42}
              tickFormatter={(v: number) => formatAngka(v, 1)}
            />
            <Tooltip
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
              labelFormatter={(l) => `Epoch ${l}`}
              formatter={(v) => formatAngka(Number(v), 4)}
            />
            <ReferenceLine
              x={tahap2Mulai}
              stroke="var(--ink-muted)"
              strokeDasharray="4 4"
              label={{
                value: "Tahap 2",
                position: "insideTopRight",
                fill: "var(--ink-muted)",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
              }}
            />
            <Line
              dataKey={trainKey}
              name="Train"
              stroke={warna}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                stroke: "var(--paper-raised)",
                strokeWidth: 2,
              }}
              strokeLinecap="round"
              isAnimationActive={false}
            />
            <Line
              dataKey={valKey}
              name="Validation"
              stroke={warna}
              strokeWidth={2}
              strokeDasharray="1 4"
              dot={false}
              activeDot={{
                r: 4,
                stroke: "var(--paper-raised)",
                strokeWidth: 2,
              }}
              strokeLinecap="round"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ClientOnly>
    </div>
  </div>
);

/**
 * Kurva loss dan accuracy (train vs validation) per epoch.
 * Warna mengikuti entitas model (B abu, C biru); validation berupa garis titik-titik.
 */
const TrainingCurveChart = ({
  data,
  model,
  tahap2Mulai,
}: TrainingCurveChartProps) => {
  const warna = model === "B" ? "var(--series-b)" : "var(--series-c)";
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
        <li className="flex items-center gap-2">
          <svg aria-hidden="true" width="28" height="6">
            <line
              x1="0"
              y1="3"
              x2="28"
              y2="3"
              stroke={warna}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Train
        </li>
        <li className="flex items-center gap-2">
          <svg aria-hidden="true" width="28" height="6">
            <line
              x1="1"
              y1="3"
              x2="27"
              y2="3"
              stroke={warna}
              strokeWidth="2"
              strokeDasharray="1 4"
              strokeLinecap="round"
            />
          </svg>
          Validation
        </li>
        <li className="flex items-center gap-2 text-ink-muted">
          <svg aria-hidden="true" width="28" height="6">
            <line
              x1="0"
              y1="3"
              x2="28"
              y2="3"
              stroke="var(--ink-muted)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          </svg>
          Awal tahap 2 (epoch {tahap2Mulai})
        </li>
      </ul>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          data={data}
          judul="Loss"
          trainKey="loss"
          valKey="val_loss"
          warna={warna}
          tahap2Mulai={tahap2Mulai}
        />
        <Panel
          data={data}
          judul="Accuracy"
          trainKey="accuracy"
          valKey="val_accuracy"
          warna={warna}
          tahap2Mulai={tahap2Mulai}
          domain={[0, 1]}
        />
      </div>
    </div>
  );
};

export default TrainingCurveChart;
