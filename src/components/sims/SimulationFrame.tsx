"use client";

import { useState } from "react";
import {
  P5Canvas,
  type Sketch,
  type SketchProps,
} from "@p5-wrapper/react";

export type SliderConfig = {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  decimals: number;
  default: number;
};

export type StatConfig = {
  symbol: string;
  label: string;
  value: string;
};

export type SelectConfig = {
  key: string;
  label: string;
  options: { value: number; label: string }[];
  default: number;
};

interface SimulationFrameProps<P extends SketchProps> {
  sketch: Sketch<P>;
  sliders?: SliderConfig[];
  selects?: SelectConfig[];
  buildSketchProps: (values: Record<string, number>) => Omit<P, keyof SketchProps>;
  stats?: (values: Record<string, number>) => StatConfig[];
}

export function SimulationFrame<P extends SketchProps>({
  sketch,
  sliders = [],
  selects = [],
  buildSketchProps,
  stats,
}: SimulationFrameProps<P>) {
  const [values, setValues] = useState<Record<string, number>>(() => ({
    ...Object.fromEntries(sliders.map((s) => [s.key, s.default])),
    ...Object.fromEntries(selects.map((s) => [s.key, s.default])),
  }));

  const sketchProps = buildSketchProps(values);
  const statRow = stats?.(values) ?? [];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white [&_canvas]:block [&_canvas]:h-auto [&_canvas]:max-w-full [&_canvas:not(:last-of-type)]:hidden">
        <P5Canvas sketch={sketch} {...(sketchProps as P)} />
      </div>

      {statRow.length > 0 && <StatRow stats={statRow} />}

      <div className="grid grid-cols-1 gap-5 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        {selects.map((select) => (
          <SelectField
            key={select.key}
            select={select}
            value={values[select.key]}
            onChange={(v) =>
              setValues((prev) => ({ ...prev, [select.key]: v }))
            }
          />
        ))}
        {sliders.map((slider) => (
          <SliderField
            key={slider.key}
            slider={slider}
            value={values[slider.key]}
            onChange={(v) =>
              setValues((prev) => ({ ...prev, [slider.key]: v }))
            }
          />
        ))}
      </div>
    </div>
  );
}

function StatRow({ stats }: { stats: StatConfig[] }) {
  const cols = Math.min(stats.length, 4);
  const colsClass =
    cols >= 4
      ? "sm:grid-cols-4"
      : cols === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2";
  return (
    <div className={`grid grid-cols-2 gap-3 ${colsClass}`}>
      {stats.map((s) => (
        <Stat key={`${s.symbol}-${s.label}`} {...s} />
      ))}
    </div>
  );
}

function Stat({ symbol, label, value }: StatConfig) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-baseline gap-1 text-sm text-slate-600">
        <span>{label},</span>
        <span className="font-serif italic text-slate-700">{symbol}</span>
      </div>
      <div className="mt-1 font-mono text-lg font-semibold text-sky-700">
        {value}
      </div>
    </div>
  );
}

function SelectField({
  select,
  value,
  onChange,
}: {
  select: SelectConfig;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-700">
          {select.label}
        </span>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
      >
        {select.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SliderField({
  slider,
  value,
  onChange,
}: {
  slider: SliderConfig;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-700">{slider.label}</span>
        <span className="font-mono text-sm font-semibold text-sky-700">
          {value.toFixed(slider.decimals)} {slider.unit}
        </span>
      </div>
      <input
        type="range"
        min={slider.min}
        max={slider.max}
        step={slider.step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-sky-600"
      />
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{slider.min}</span>
        <span>{slider.max}</span>
      </div>
    </label>
  );
}
