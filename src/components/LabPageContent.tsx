"use client";

import { useState } from "react";
import type { LabConfig } from "@/content/types";
import type { AccentClasses } from "@/lib/accent";
import { Simulation } from "./Simulation";
import LabTemplate from "./LabTemplate";
import { Equation } from "./Equation";
import { RichText } from "./RichText";

interface LabPageContentProps {
  lab: LabConfig;
  accent: AccentClasses;
}

export default function LabPageContent({ lab, accent }: LabPageContentProps) {
  const isGuided = lab.kind === "guided";
  const [expandBackground, setExpandBackground] = useState(!isGuided);
  const [expandSimulation, setExpandSimulation] = useState(false);
  const [simKey, setSimKey] = useState(0);
  const resetSim = () => setSimKey((k) => k + 1);

  return (
    <>
      {/* Background sections - collapsible when a guide is present */}
      {isGuided && (
        <div className="mt-10">
          <button
            onClick={() => setExpandBackground(!expandBackground)}
            className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-left hover:bg-slate-50"
          >
            <span className="text-lg">{expandBackground ? "▼" : "▶"}</span>
            <span className="font-semibold text-slate-900">
              {expandBackground ? "Skjul" : "Vis"} formål, begreber og teori
            </span>
          </button>
        </div>
      )}

      {expandBackground && (
        <>
          {lab.goal ? (
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-slate-900">Formål</h2>
              <p className="mt-2 text-slate-700">
                <RichText text={lab.goal} />
              </p>
            </section>
          ) : null}

          {lab.keyConcepts && lab.keyConcepts.length > 0 ? (
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-slate-900">Centrale begreber</h2>
              <ul className="mt-3 space-y-2">
                {lab.keyConcepts.map((c) => (
                  <li key={c} className="flex gap-3 text-slate-700">
                    <span
                      className={`mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${accent.bg}`}
                      aria-hidden
                    />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {lab.keyEquation ? (
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-slate-900">Nøgleligning</h2>
              <div
                className={`mt-3 flex items-center justify-center rounded-2xl border ${accent.border} ${accent.bgSoft} px-6 py-0`}
              >
                <span className="text-3xl sm:text-2xl">
                  <Equation latex={lab.keyEquation} mode="display" />
                </span>
              </div>
            </section>
          ) : null}

          {lab.theory && lab.theory.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-slate-900">Teori</h2>
              <div className="mt-3 space-y-4 text-slate-700">
                {lab.theory.map((paragraph, i) => (
                  <p key={i}>
                    <RichText text={paragraph} />
                  </p>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      {/* Main content — one branch per kind */}
      {lab.kind === "guided" && (
        <>
          <div className="mt-10">
            <button
              onClick={() => setExpandSimulation(!expandSimulation)}
              className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-left hover:bg-slate-50"
            >
              <span className="text-lg">{expandSimulation ? "▼" : "▶"}</span>
              <span className="font-semibold text-slate-900">
                {expandSimulation ? "Skjul" : "Vis"} simulation
              </span>
            </button>
            {expandSimulation && (
              <div className="mt-4">
                <Simulation key={simKey} simulationId={lab.simulationId} resetKey={simKey} />
              </div>
            )}
          </div>

          <section className="mt-10">
            <LabTemplate
              lab={lab}
              guide={lab.guide}
              accent={accent}
              simKey={simKey}
              onResetSim={resetSim}
            />
          </section>
        </>
      )}

      {lab.kind === "simulation" && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Simulation</h2>
          <p className="mt-2 text-sm text-slate-600">
            Træk i skyderne og se, hvordan banen ændrer sig. Animationen starter
            forfra, hver gang du justerer en parameter.
          </p>
          <div className="mt-4">
            <Simulation simulationId={lab.simulationId} />
          </div>
        </section>
      )}

      {lab.kind === "observations" && lab.observations.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">I laboratoriet</h2>
          <p className="mt-2 text-sm text-slate-600">
            Når du står i lokalet med en rigtig fjeder, er det disse ting, du
            skal observere og måle.
          </p>
          <ol className="mt-4 space-y-3">
            {lab.observations.map((step, i) => (
              <li key={i} className="flex gap-3 text-slate-700">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${accent.bg}`}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
