"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import ForceExtensionChart from "./ForceExtensionChart";
import type { AccentClasses } from "@/lib/accent";

const HookesLovSim = dynamic(() => import("./sims/HookesLov"), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
      Indlæser simulation…
    </div>
  ),
});

type Mode = "guidet" | "semi" | "open";
type Phase = "choose" | 1 | 2 | 3 | "conclusion";
type Row = { massG: string; extensionMm: string };

const SIM_K = 5;
const EMPTY_ROW = (): Row => ({ massG: "", extensionMm: "" });

const PHASES = [
  { key: 1, label: "Forberedelse" },
  { key: 2, label: "Mål" },
  { key: 3, label: "Analysér" },
  { key: "conclusion", label: "Konklusion" },
] as const;

type Props = { accent: AccentClasses };

export default function HookesLovLabGuide({ accent }: Props) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [phase, setPhase] = useState<Phase>("choose");
  const [prediction, setPrediction] = useState("");
  const [rows, setRows] = useState<Row[]>(() =>
    Array.from({ length: 6 }, EMPTY_ROW),
  );
  const [openHints, setOpenHints] = useState<Set<string>>(new Set());
  const [studentK, setStudentK] = useState("");
  const [reflection, setReflection] = useState("");
  const [showFacit, setShowFacit] = useState(false);

  const validRows = useMemo(
    () =>
      rows.filter((r) => {
        const m = parseFloat(r.massG);
        const x = parseFloat(r.extensionMm);
        return Number.isFinite(m) && m > 0 && Number.isFinite(x) && x > 0;
      }),
    [rows],
  );

  const kFit = useMemo(() => {
    if (validRows.length < 4) return null;
    let num = 0;
    let den = 0;
    for (const r of validRows) {
      const xi = parseFloat(r.extensionMm) / 1000;
      const Fi = (parseFloat(r.massG) / 1000) * 9.82;
      num += xi * Fi;
      den += xi * xi;
    }
    return den > 0 ? num / den : null;
  }, [validRows]);

  const canProceedToPhase3 = validRows.length >= 4;

  const studentKNum = parseFloat(studentK);
  const percentDiff =
    kFit !== null && Number.isFinite(studentKNum) && studentKNum > 0
      ? Math.abs((studentKNum - SIM_K) / SIM_K) * 100
      : null;

  const updateRow = (i: number, field: keyof Row, value: string) =>
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)),
    );

  const toggleHint = (id: string) =>
    setOpenHints((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const phaseIndex = (p: Phase) => {
    if (p === "choose") return -1;
    if (p === "conclusion") return 3;
    return (p as number) - 1;
  };

  if (phase === "choose") {
    return (
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Laboratorieguide
        </h2>
        <p className="mt-2 text-slate-600">
          Vælg den undersøgelsesform, der passer til jeres time.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(
            [
              {
                key: "guidet" as Mode,
                title: "Guidet",
                desc: "Trin-for-trin vejledning og instruktioner ved hvert fase.",
              },
              {
                key: "semi" as Mode,
                title: "Semi-guidet",
                desc: "Korte overblik med hints, som du kan åbne efter behov.",
              },
              {
                key: "open" as Mode,
                title: "Åben undersøgelse",
                desc: "Kun værktøjerne – du bestemmer selv fremgangsmåden.",
              },
            ] as const
          ).map(({ key, title, desc }) => (
            <button
              key={key}
              onClick={() => {
                setMode(key);
                setPhase(1);
              }}
              className={`rounded-xl border-2 p-5 text-left transition-colors hover:${accent.bgSoft} hover:${accent.border} border-slate-200 bg-white`}
            >
              <div className={`text-base font-semibold ${accent.text}`}>
                {title}
              </div>
              <div className="mt-1.5 text-sm text-slate-600">{desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentIdx = phaseIndex(phase);

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">
        Laboratorieguide
      </h2>

      {/* Progress bar */}
      <div className="mt-4 flex items-center gap-0">
        {PHASES.map((p, i) => {
          const active = phaseIndex(phase) === i;
          const done = phaseIndex(phase) > i;
          return (
            <div key={String(p.key)} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    active || done
                      ? `${accent.bg} text-white`
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span
                  className={`mt-1 whitespace-nowrap text-xs ${active ? accent.text : "text-slate-400"}`}
                >
                  {p.label}
                </span>
              </div>
              {i < PHASES.length - 1 && (
                <div
                  className={`mb-4 h-0.5 w-8 sm:w-16 ${currentIdx > i ? accent.bg : "bg-slate-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Phase 1 */}
      {phase === 1 && (
        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Fase 1 — Forberedelse
            </h3>
            {mode === "guidet" && (
              <div
                className={`mt-3 rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700 space-y-1`}
              >
                <p className="font-medium text-slate-800">Hvad skal du gøre:</p>
                <ol className="mt-2 list-decimal list-inside space-y-1">
                  <li>Kig på simulationen herunder.</li>
                  <li>Træk i skyderen for massen og observér, hvad der sker med forlængelsen.</li>
                  <li>Prøv også at ændre fjederkonstanten k.</li>
                  <li>Skriv din forudsigelse i feltet nedenfor, inden I går i gang med det fysiske forsøg.</li>
                </ol>
              </div>
            )}
            {mode === "semi" && (
              <div className="mt-3 text-sm text-slate-600">
                <p>Brug simulationen til at danne dig et overblik over sammenhængen.</p>
                <HintBox
                  id="p1-h1"
                  label="Hvad sker der med forlængelsen?"
                  content="Øg massen og se, om forlængelsen vokser lineært eller ej. Prøv at doble massen – hvad sker der med forlængelsen?"
                  openHints={openHints}
                  toggle={toggleHint}
                />
              </div>
            )}
          </div>

          <HookesLovSim />

          {mode !== "open" && (
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Hvad tror du sker med forlængelsen, når du øger massen?
              </label>
              <textarea
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                rows={3}
                placeholder="Skriv din forudsigelse her…"
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setMode(null);
                setPhase("choose");
              }}
              className="text-sm text-slate-500 hover:underline"
            >
              ← Skift undersøgelsesform
            </button>
            <button
              onClick={() => setPhase(2)}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg}`}
            >
              Fortsæt →
            </button>
          </div>
        </div>
      )}

      {/* Phase 2 */}
      {phase === 2 && (
        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Fase 2 — Mål
            </h3>
            {mode === "guidet" && (
              <div
                className={`mt-3 rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700`}
              >
                <p className="font-medium text-slate-800">Fremgangsmåde:</p>
                <ol className="mt-2 list-decimal list-inside space-y-1.5">
                  <li>Hæng fjederen op i stativet.</li>
                  <li>Mål fjederens naturlige længde uden nogen masse (nulpunktet).</li>
                  <li>Tilsæt en masse og vent, til systemet er i ro.</li>
                  <li>Mål forlængelsen fra nulpunktet og notér den i tabellen.</li>
                  <li>Gentag med mindst 6 forskellige masser fordelt over fjederens arbejdsområde.</li>
                  <li>Kraft F beregnes automatisk som F = m·g.</li>
                </ol>
              </div>
            )}
            {mode === "semi" && (
              <div className="mt-3 text-sm text-slate-600 space-y-1">
                <p>Mål forlængelsen for mindst 6 masser og udfyld tabellen.</p>
                <HintBox
                  id="p2-h1"
                  label="Hvad er nulpunktet?"
                  content="Mål fjederens naturlige længde uden nogen masse. Al forlængelse måles relativt hertil, dvs. ny længde minus naturlig længde."
                  openHints={openHints}
                  toggle={toggleHint}
                />
                <HintBox
                  id="p2-h2"
                  label="Hvad hvis fjederen svinger?"
                  content="Vent til systemet er kommet i ro (ligevægt), inden du aflæser forlængelsen. Du kan dæmpe svingningerne ved forsigtigt at holde massen stille."
                  openHints={openHints}
                  toggle={toggleHint}
                />
              </div>
            )}
          </div>

          {/* Data table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Masse tilsat (g)</th>
                  <th className="px-4 py-3 text-left">Forlængelse (mm)</th>
                  <th className="px-4 py-3 text-right">Kraft F (N)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, i) => {
                  const m = parseFloat(row.massG);
                  const f =
                    Number.isFinite(m) && m > 0
                      ? ((m / 1000) * 9.82).toFixed(4)
                      : null;
                  return (
                    <tr key={i} className="bg-white">
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={row.massG}
                          onChange={(e) =>
                            updateRow(i, "massG", e.target.value)
                          }
                          placeholder="0"
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-400"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={row.extensionMm}
                          onChange={(e) =>
                            updateRow(i, "extensionMm", e.target.value)
                          }
                          placeholder="0"
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-400"
                        />
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-slate-500">
                        {f !== null ? (
                          <span className={accent.text}>{f} N</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => setRows((r) => [...r, EMPTY_ROW()])}
            className={`text-sm ${accent.text} hover:underline`}
          >
            + Tilføj række
          </button>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {canProceedToPhase3
                ? `${validRows.length} gyldige målepunkter`
                : `Udfyld mindst 4 rækker for at fortsætte (${validRows.length}/4)`}
            </span>
            <button
              disabled={!canProceedToPhase3}
              onClick={() => setPhase(3)}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-opacity ${accent.bg} disabled:cursor-not-allowed disabled:opacity-40`}
            >
              Fortsæt →
            </button>
          </div>
        </div>
      )}

      {/* Phase 3 */}
      {phase === 3 && (
        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Fase 3 — Analysér
            </h3>
            {mode === "guidet" && (
              <div
                className={`mt-3 rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700 space-y-1`}
              >
                <p className="font-medium text-slate-800">Sådan læser du grafen:</p>
                <ol className="mt-2 list-decimal list-inside space-y-1.5">
                  <li>Grafen viser dine målinger (punkter) og en bedste rette linje beregnet fra dem.</li>
                  <li>Hookes lov siger F = k·x, så hældningen af linjen er fjederkonstanten k.</li>
                  <li>
                    Vælg to punkter på linjen og beregn: k = ΔF/Δx
                  </li>
                  <li>Skriv din aflæste k nedenfor og sammenlign med simulationen.</li>
                </ol>
              </div>
            )}
            {mode === "semi" && (
              <div className="mt-3 text-sm text-slate-600 space-y-1">
                <p>Grafen viser dine data og en bedste-tilpasset linje.</p>
                <HintBox
                  id="p3-h1"
                  label="Hvordan finder jeg k fra grafen?"
                  content="Hældningen af F-x-grafen er k. Find to punkter på linjen og beregn ΔF / Δx. Enheden er N/m."
                  openHints={openHints}
                  toggle={toggleHint}
                />
                <HintBox
                  id="p3-h2"
                  label="Hvad betyder afvigelsen?"
                  content="En afvigelse under 10 % er typisk acceptabel for håndmålinger med en lineal. Større afvigelse kan skyldes unøjagtig aflæsning af forlængelsen eller at fjederen blev trukket ud over det elastiske område."
                  openHints={openHints}
                  toggle={toggleHint}
                />
              </div>
            )}
          </div>

          {kFit !== null ? (
            <ForceExtensionChart measurements={rows} kFit={kFit} />
          ) : (
            <p className="text-sm text-slate-500">
              Ikke nok gyldige datapunkter til at tegne grafen.
            </p>
          )}

          {/* Student k input */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Din aflæste fjederkonstant:
            </label>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-serif italic text-slate-600">k =</span>
              <input
                type="number"
                min="0"
                step="any"
                value={studentK}
                onChange={(e) => setStudentK(e.target.value)}
                placeholder="0.00"
                className="w-28 rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <span className="text-slate-600">N/m</span>
            </div>
          </div>

          {/* Comparison panel */}
          {percentDiff !== null && (
            <div
              className={`rounded-xl border ${accent.border} ${accent.bgSoft} p-4`}
            >
              <p className="text-sm font-medium text-slate-700">
                Sammenligning med simulationens fjeder (k = {SIM_K} N/m):
              </p>
              <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-slate-500">Din målte k</div>
                  <div
                    className={`mt-1 font-mono text-lg font-semibold ${accent.text}`}
                  >
                    {studentKNum.toFixed(2)} N/m
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Simulationens k</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-slate-700">
                    {SIM_K}.00 N/m
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Afvigelse</div>
                  <div
                    className={`mt-1 font-mono text-lg font-semibold ${
                      percentDiff < 10
                        ? "text-emerald-600"
                        : percentDiff < 20
                          ? "text-amber-600"
                          : "text-rose-600"
                    }`}
                  >
                    {percentDiff.toFixed(1)} %
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setPhase("conclusion")}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg}`}
            >
              Fortsæt →
            </button>
          </div>
        </div>
      )}

      {/* Conclusion */}
      {phase === "conclusion" && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Konklusion</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Hvad opdagede du i dette forsøg?
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={5}
              placeholder="Beskriv dine observationer, resultater og hvad du lærte…"
              className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div>
            {!showFacit ? (
              <button
                onClick={() => setShowFacit(true)}
                className={`text-sm ${accent.text} hover:underline`}
              >
                Vis forventet konklusion
              </button>
            ) : (
              <div
                className={`rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700 space-y-2`}
              >
                <p className="font-semibold text-slate-800">
                  Forventet konklusion:
                </p>
                <p>
                  Forsøget bekræfter Hookes lov: fjederkraften er proportional
                  med forlængelsen. Grafen af F mod x er en ret linje, og
                  hældningen er fjederkonstanten k.
                </p>
                <p>
                  Din målte k bør ligge tæt på 5 N/m for
                  simulationens fjeder — afvigelser skyldes typisk
                  måleusikkerhed i aflæsning af forlængelsen med lineal, eller
                  at fjederen er trukket lidt ud over sit elastiske område.
                </p>
                <p>
                  Sammenhængen F = k·x gælder kun i det lineære (elastiske)
                  område. Grafen bør gå tæt på origo, da der ingen fjederkraft
                  er ved nul forlængelse.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function HintBox({
  id,
  label,
  content,
  openHints,
  toggle,
}: {
  id: string;
  label: string;
  content: string;
  openHints: Set<string>;
  toggle: (id: string) => void;
}) {
  const open = openHints.has(id);
  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-white">
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-slate-700"
        onClick={() => toggle(id)}
        aria-expanded={open}
      >
        <span>💡 {label}</span>
        <span className="text-slate-400">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
          {content}
        </div>
      )}
    </div>
  );
}
