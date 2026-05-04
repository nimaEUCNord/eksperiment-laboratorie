"use client";

import {
  Chart,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import type { ChartConfig } from "@/content/types";
import { Equation } from "@/components/Equation";

Chart.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

function formatEquationLatex(fit: Fit, mode: ChartConfig["fitMode"]): string {
  if (!fit) return "";
  const slope = fit.slope.toFixed(3);
  // Tolerate floating-point noise on a "free" fit through near-perfect data
  // so intercept = -1e-16 still collapses to y = a \cdot x.
  if (mode === "through-origin" || Math.abs(fit.intercept) < 1e-9) {
    return `y = ${slope} \\cdot x`;
  }
  const sign = fit.intercept >= 0 ? "+" : "-";
  const intercept = Math.abs(fit.intercept).toFixed(3);
  return `y = ${slope} \\cdot x ${sign} ${intercept}`;
}

type Row = Record<string, string>;

type AxisInput = {
  fysiskStorrelse: string;
  symbol: string;
  enhed: string;
};

type Props = {
  rows: Row[];
  chart: ChartConfig | null;
  showFit?: boolean;
  showR2?: boolean;
  xAxisInput?: AxisInput;
  yAxisInput?: AxisInput;
};

function hasAxisInputContent(input: AxisInput | undefined): boolean {
  if (!input) return false;
  return Boolean(
    input.fysiskStorrelse?.trim() ||
      input.symbol?.trim() ||
      input.enhed?.trim(),
  );
}

function AxisLabel({ input }: { input: AxisInput }) {
  const fs = input.fysiskStorrelse?.trim();
  const sym = input.symbol?.trim();
  const unit = input.enhed?.trim();
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap text-slate-700">
      {fs && <span>{fs}</span>}
      {sym && (
        <Equation latex={sym} fallback={<span className="italic">{sym}</span>} />
      )}
      {unit && (
        <span>
          (<Equation latex={`\\mathrm{${unit}}`} fallback={<span>{unit}</span>} />)
        </span>
      )}
    </span>
  );
}

type Fit = { slope: number; intercept: number } | null;

function computeFit(points: { x: number; y: number }[], mode: ChartConfig["fitMode"]): Fit {
  if (mode === "none" || points.length < 2) return null;

  if (mode === "through-origin") {
    let num = 0;
    let den = 0;
    for (const p of points) {
      num += p.x * p.y;
      den += p.x * p.x;
    }
    if (den <= 0) return null;
    return { slope: num / den, intercept: 0 };
  }

  // free linear fit (least squares with intercept)
  const n = points.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function computeR2(
  points: { x: number; y: number }[],
  fit: NonNullable<Fit>,
): number | null {
  if (points.length < 2) return null;
  const meanY = points.reduce((s, p) => s + p.y, 0) / points.length;
  let ssRes = 0;
  let ssTot = 0;
  for (const p of points) {
    const yhat = fit.slope * p.x + fit.intercept;
    ssRes += (p.y - yhat) ** 2;
    ssTot += (p.y - meanY) ** 2;
  }
  if (ssTot === 0) return null;
  return 1 - ssRes / ssTot;
}

export default function MeasurementChart({ rows, chart, showFit, showR2, xAxisInput, yAxisInput }: Props) {
  if (chart === null) {
    const data = { datasets: [] as never[] };
    const options = {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 16 / 9,
      animation: false as const,
      scales: {
        x: { type: "linear" as const, min: 0, title: { display: false } },
        y: { type: "linear" as const, min: 0, title: { display: false } },
      },
      plugins: { legend: { display: false } },
    };
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <Scatter data={data} options={options} />
      </div>
    );
  }

  const xScale = chart.xScale ?? 1;
  const yScale = chart.yScale ?? 1;

  const points = rows
    .map((r) => {
      const xRaw = parseFloat(r[chart.xField]);
      const yRaw = parseFloat(r[chart.yField]);
      return {
        x: xRaw * xScale,
        y: yRaw * yScale,
      };
    })
    .filter(
      (p) =>
        Number.isFinite(p.x) && p.x > 0 && Number.isFinite(p.y) && p.y > 0,
    );

  const xMaxRaw = points.length > 0 ? Math.max(...points.map((p) => p.x)) : 0;
  const xMax = xMaxRaw > 0 ? xMaxRaw * 1.1 : undefined;
  const fit = showFit ? computeFit(points, chart.fitMode) : null;
  const r2 = fit && showR2 ? computeR2(points, fit) : null;

  const data = {
    datasets: [
      ...(points.length > 0
        ? [
            {
              label: "Målinger",
              data: points,
              backgroundColor: "rgba(2, 132, 199, 0.85)",
              borderColor: "rgba(2, 132, 199, 0.85)",
              pointStyle: "circle" as const,
              pointRadius: 6,
              pointHoverRadius: 8,
              showLine: false,
            },
          ]
        : []),
      ...(fit && xMax
        ? [
            {
              label: "Bedste rette linje",
              data: [
                { x: 0, y: fit.intercept },
                { x: xMax, y: fit.slope * xMax + fit.intercept },
              ],
              borderColor: "rgba(125, 211, 252, 1)",
              backgroundColor: "rgba(125, 211, 252, 1)",
              borderWidth: 2,
              borderDash: [6, 3],
              pointStyle: "line" as const,
              pointRadius: 0,
              showLine: true,
            },
          ]
        : []),
    ],
  };

  const overlayX = hasAxisInputContent(xAxisInput);
  const overlayY = hasAxisInputContent(yAxisInput);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 16 / 9,
    scales: {
      x: {
        type: "linear" as const,
        min: 0,
        title: {
          display: !overlayX,
          text: chart.xLabel,
          font: { size: 16 },
        },
      },
      y: {
        type: "linear" as const,
        min: 0,
        title: {
          display: !overlayY,
          text: chart.yLabel,
          font: { size: 16 },
        },
      },
    },
    plugins: {
      legend: {
        display: data.datasets.length > 0,
        labels: {
          usePointStyle: true,
          generateLabels: (c: Chart) =>
            c.data.datasets.map((ds, i) => ({
              text: typeof ds.label === "string" ? ds.label : "",
              fillStyle: (ds.backgroundColor as string) ?? "transparent",
              strokeStyle: (ds.borderColor as string) ?? "transparent",
              lineWidth: (ds.borderWidth as number) ?? 2,
              lineDash: (ds.borderDash as number[]) ?? [],
              pointStyle: (ds.pointStyle as "circle" | "line") ?? "circle",
              hidden: !c.isDatasetVisible(i),
              datasetIndex: i,
            })),
        },
      },
    },
  };

  const equationLatex = fit ? formatEquationLatex(fit, chart.fitMode) : "";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex">
        {overlayY && yAxisInput && (
          <div className="flex items-center pr-2">
            <div className="-rotate-90 whitespace-nowrap origin-center">
              <AxisLabel input={yAxisInput} />
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Scatter data={data} options={options} />
          {overlayX && xAxisInput && (
            <div className="mt-2 flex justify-center">
              <AxisLabel input={xAxisInput} />
            </div>
          )}
        </div>
      </div>
      {fit && equationLatex && (
        <div data-testid="regression-equation" className="mt-2 text-center text-slate-700">
          <div>
            <Equation latex={equationLatex} mode="display" />
          </div>
          {r2 !== null && (
            <div data-testid="regression-r2">
              <Equation latex={`R^2 = ${r2.toFixed(3)}`} mode="display" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function fitFromRows(rows: Row[], chart: ChartConfig): Fit {
  const xScale = chart.xScale ?? 1;
  const yScale = chart.yScale ?? 1;
  const points = rows
    .map((r) => ({
      x: parseFloat(r[chart.xField]) * xScale,
      y: parseFloat(r[chart.yField]) * yScale,
    }))
    .filter(
      (p) => Number.isFinite(p.x) && p.x > 0 && Number.isFinite(p.y) && p.y > 0,
    );
  return computeFit(points, chart.fitMode);
}
