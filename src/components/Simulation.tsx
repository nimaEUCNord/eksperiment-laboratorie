"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const SimulationLoading = () => (
  <div className="aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
      Indlæser simulation…
    </div>
  </div>
);

const sims: Record<string, ComponentType> = {
  "skraat-kast": dynamic(() => import("./sims/SkraatKast"), {
    ssr: false,
    loading: SimulationLoading,
  }),
  "template-lab": dynamic(() => import("./sims/TemplateLab"), {
    ssr: false,
    loading: SimulationLoading,
  }),
};

export function Simulation({
  simulationId,
  resetKey,
}: {
  simulationId?: string;
  resetKey?: number;
}) {
  if (simulationId && sims[simulationId]) {
    const Sim = sims[simulationId];
    return <Sim key={resetKey} />;
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-500">
        <div className="text-4xl" aria-hidden>
          🧪
        </div>
        <p className="text-sm font-medium">Simulation kommer her</p>
        {simulationId ? (
          <p className="font-mono text-xs text-slate-400">id: {simulationId}</p>
        ) : null}
      </div>
    </div>
  );
}
