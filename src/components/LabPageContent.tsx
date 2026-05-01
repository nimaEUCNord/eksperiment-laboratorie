"use client";

import { useState } from "react";
import type { Lab } from "@/content/types";
import type { AccentClasses } from "@/lib/accent";
import { Simulation } from "./Simulation";
import HookesLovLabGuide from "./HookesLovLabGuide";
import GenericLabGuide from "./GenericLabGuide";

interface LabPageContentProps {
  lab: Lab;
  accent: AccentClasses;
}

export default function LabPageContent({ lab, accent }: LabPageContentProps) {
  const [expandBackground, setExpandBackground] = useState(true);

  return (
    <>
      {/* Background sections - collapsible */}
      {lab.labGuide && (
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
              <p className="mt-2 text-slate-700">{lab.goal}</p>
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
                className={`mt-3 flex items-center justify-center rounded-2xl border ${accent.border} ${accent.bgSoft} px-6 py-8`}
              >
                <span className="font-serif text-4xl tracking-wide text-slate-900 sm:text-5xl">
                  {renderEquation(lab.keyEquation)}
                </span>
              </div>
            </section>
          ) : null}

          {lab.theory && lab.theory.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-slate-900">Teori</h2>
              <div className="mt-3 space-y-4 text-slate-700">
                {lab.theory.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      {/* Simulation section - only show when not in lab guide mode */}
      {!lab.labGuide && (
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

      {/* Lab observations - only show when not in lab guide mode */}
      {!lab.labGuide && lab.observations && lab.observations.length > 0 ? (
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
      ) : null}

      {/* Lab guide section */}
      {lab.labGuide && (
        <section className="mt-10">
          {lab.labGuideConfig ? (
            <GenericLabGuide lab={lab} config={lab.labGuideConfig} accent={accent} />
          ) : (
            <HookesLovLabGuide accent={accent} />
          )}
        </section>
      )}
    </>
  );
}

function renderEquation(eq: string) {
  return eq.split(/(\s+)/).map((token, i) => {
    if (/^\s+$/.test(token)) return token;
    if (/^[A-Za-z]$/.test(token)) {
      return (
        <span key={i} className="italic">
          {token}
        </span>
      );
    }
    return token;
  });
}
