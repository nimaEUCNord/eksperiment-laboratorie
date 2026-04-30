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

Chart.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

type Measurement = { massG: string; extensionMm: string };

type Props = {
  measurements: Measurement[];
  kFit: number;
};

export default function ForceExtensionChart({ measurements, kFit }: Props) {
  const points = measurements
    .map((r) => ({
      x: parseFloat(r.extensionMm) / 1000,
      y: (parseFloat(r.massG) / 1000) * 9.82,
    }))
    .filter(
      (p) =>
        Number.isFinite(p.x) && p.x > 0 && Number.isFinite(p.y) && p.y > 0,
    );

  if (points.length < 4) return null;

  const xMax = Math.max(...points.map((p) => p.x)) * 1.1;

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
      {
        label: `Bedste rette linje  (k ≈ ${kFit.toFixed(2)} N/m)`,
        data: [
          { x: 0, y: 0 },
          { x: xMax, y: kFit * xMax },
        ],
        borderColor: "rgba(125, 211, 252, 1)",
        backgroundColor: "transparent",
        borderWidth: 2,
        borderDash: [6, 3],
        pointRadius: 0,
        showLine: true,
      },
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
          text: "Forlængelse x (m)",
          font: { size: 13 },
        },
      },
      y: {
        type: "linear" as const,
        min: 0,
        title: {
          display: true,
          text: "Kraft F (N)",
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
