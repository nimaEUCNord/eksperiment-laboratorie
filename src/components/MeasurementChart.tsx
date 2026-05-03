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

Chart.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

function buildFitLabel(slope: number, symbol?: string, unit?: string): string {
  const sym = symbol ?? "hældning";
  const value = slope.toFixed(2);
  return unit
    ? `Bedste rette linje (${sym} ≈ ${value} ${unit})`
    : `Bedste rette linje (${sym} ≈ ${value})`;
}

type Row = Record<string, string>;

type Props = {
  rows: Row[];
  chart: ChartConfig;
};

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

export default function MeasurementChart({ rows, chart }: Props) {
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

  const minPoints = chart.minPoints ?? 4;
  if (points.length < minPoints) return null;

  const xMax = Math.max(...points.map((p) => p.x)) * 1.1;
  const fit = computeFit(points, chart.fitMode);

  const fitLabel = fit
    ? buildFitLabel(fit.slope, chart.slopeSymbol, chart.slopeUnit)
    : "";

  const data = {
    datasets: [
      {
        label: "Målinger",
        data: points,
        backgroundColor: "rgba(2, 132, 199, 0.85)",
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: false,
      },
      ...(fit
        ? [
            {
              label: fitLabel,
              data: [
                { x: 0, y: fit.intercept },
                { x: xMax, y: fit.slope * xMax + fit.intercept },
              ],
              borderColor: "rgba(125, 211, 252, 1)",
              backgroundColor: "transparent",
              borderWidth: 2,
              borderDash: [6, 3],
              pointRadius: 0,
              showLine: true,
            },
          ]
        : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 16 / 9,
    scales: {
      x: {
        type: "linear" as const,
        min: 0,
        title: {
          display: true,
          text: chart.xLabel,
          font: { size: 13 },
        },
      },
      y: {
        type: "linear" as const,
        min: 0,
        title: {
          display: true,
          text: chart.yLabel,
          font: { size: 13 },
        },
      },
    },
    plugins: {
      legend: { display: true },
    },
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <Scatter data={data} options={options} />
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
