"use client";

import { useState, useMemo } from "react";
import type { Lab, LabGuideConfig } from "@/content/types";
import type { AccentClasses } from "@/lib/accent";
import HintBox from "./HintBox";

type Mode = "guidet" | "semi" | "open";
type Phase = "choose" | 1 | 2 | 3 | 4 | 5;
type Row = Record<string, string>;

const PHASES = [
  { key: 1, label: "Planlæg" },
  { key: 2, label: "Opstil" },
  { key: 3, label: "Mål" },
  { key: 4, label: "Analysér" },
  { key: 5, label: "Konkludér" },
] as const;

interface GenericLabGuideProps {
  lab: Lab;
  config: LabGuideConfig;
  accent: AccentClasses;
}

export default function GenericLabGuide({ lab, config, accent }: GenericLabGuideProps) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [phase, setPhase] = useState<Phase>("choose");

  // Phase 1 state
  const [hypothesis, setHypothesis] = useState("");
  const [varInputs, setVarInputs] = useState<Record<string, string>>({});

  // Phase 2 state
  const [setupChecked, setSetupChecked] = useState<boolean[]>([]);

  // Phase 3 state (data collection)
  const [rows, setRows] = useState<Row[]>(() =>
    Array.from({ length: 6 }, () =>
      (config.measurementFields || []).reduce((acc, field) => ({ ...acc, [field.label]: "" }), {})
    )
  );

  // Phase 4 state
  const [studentValue, setStudentValue] = useState("");

  // Phase 5 state
  const [reflections, setReflections] = useState<string[]>(
    Array.from({ length: config.reflectionQuestions?.length || 0 }, () => "")
  );
  const [showFacit, setShowFacit] = useState(false);

  // Shared
  const [openHints, setOpenHints] = useState<Set<string>>(new Set());

  const phaseIndex = (p: Phase) => (p === "choose" ? -1 : (p as number) - 1);

  const validRows = useMemo(() => {
    return rows.filter((row) => {
      const measurementFields = config.measurementFields || [];
      return measurementFields.some((field) => {
        const val = parseFloat(row[field.label]);
        return Number.isFinite(val) && val > 0;
      });
    });
  }, [rows, config.measurementFields]);

  const canProceedToPhase4 = validRows.length >= 4;

  const updateRow = (i: number, field: string, value: string) => {
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r))
    );
  };

  const toggleHint = (id: string) => {
    setOpenHints((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSetup = (i: number) => {
    setSetupChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  const updateReflection = (i: number, value: string) => {
    setReflections((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  };

  // Mode selection screen
  if (phase === "choose") {
    return (
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Laboratorieguide</h2>
        <p className="mt-2 text-slate-600">
          Vælg den undersøgelsesform, der passer til jeres time.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(
            [
              {
                key: "guidet" as Mode,
                title: "Guidet",
                desc: "Trin-for-trin vejledning og instruktioner ved hver fase.",
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
              className={`rounded-xl border-2 border-slate-200 bg-white p-5 text-left transition-colors hover:${accent.bgSoft} hover:${accent.border}`}
            >
              <div className={`text-base font-semibold ${accent.text}`}>{title}</div>
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
      <h2 className="text-xl font-semibold text-slate-900">Laboratorieguide</h2>

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
                    active || done ? `${accent.bg} text-white` : "bg-slate-200 text-slate-500"
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
                  className={`mb-4 h-0.5 w-6 sm:w-12 ${currentIdx > i ? accent.bg : "bg-slate-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Phase 1: Planlæg */}
      {phase === 1 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Fase 1 — Planlæg</h3>

          {mode === "semi" && (
            <div className="mt-3 space-y-3 text-sm text-slate-600" />
          )}

          {mode !== "open" && config.variables && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Identificér dine variable:</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {config.variables.map((v) => {
                  const typeLabel = {
                    independent: "Uafhængig variabel",
                    dependent: "Afhængig variabel",
                    control: "Konstanter",
                    derived: "Beregnet værdi",
                  }[v.type] || v.type;

                  const typeHelpText = {
                    independent: "Det du ændrer",
                    dependent: "Det du måler",
                    control: "Det der holder samme",
                    derived: "Beregnet fra andre variable",
                  }[v.type] || "";

                  return (
                    <div key={v.name}>
                      <label className="block text-xs font-medium text-slate-600">
                        {typeLabel}
                        {typeHelpText && <span className="font-normal text-slate-500"> — {typeHelpText}</span>}
                      </label>
                      <input
                        type="text"
                        value={varInputs[v.name] || ""}
                        onChange={(e) => setVarInputs((prev) => ({ ...prev, [v.name]: e.target.value }))}
                        placeholder={v.name}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                      {v.description && <p className="mt-1.5 text-xs text-slate-500">{v.description}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">
              {mode === "guidet" ? "Min hypotese:" : "Skriv din hypotese:"}
            </label>
            <textarea
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              rows={3}
              placeholder="Skriv din hypotese her…"
              className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div className="flex items-center justify-between">
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
              Næste fase →
            </button>
          </div>
        </div>
      )}

      {/* Phase 2: Opstil */}
      {phase === 2 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Fase 2 — Opstil</h3>

          {mode === "guidet" && (
            <div className={`rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700`}>
              <p className="font-medium text-slate-800">Forberedelsestrin:</p>
              <ol className="mt-3 list-decimal list-inside space-y-2 text-slate-600">
                <li>Saml dine materialer og tjek, at alt er klar.</li>
                <li>Gør dig selv bekendt med måleudstyr og målemetoder.</li>
                <li>Planlæg hvordan du registrerer data systematisk.</li>
              </ol>
            </div>
          )}

          {mode === "semi" && (
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>Forbered dit forsøgsudstyr og sørg for at det virker.</p>
              <HintBox
                id="p2-h1"
                label="Hvad skal jeg checke?"
                content="Tjek at all equipment virker. Verificer at måleudstyr er kalibreret. Planlæg din dataindsamling systematisk."
                openHints={openHints}
                toggle={toggleHint}
              />
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Tjekliste:</p>
            {["Jeg har saml alle materialer", "Jeg har verificeret at udstyr virker", "Jeg er klar til at starte måling"].map((item, i) => (
              <div key={i} className="flex items-center">
                <input
                  type="checkbox"
                  checked={setupChecked[i] || false}
                  onChange={() => toggleSetup(i)}
                  className="h-4 w-4 rounded-lg"
                />
                <label className="ml-3 text-sm text-slate-700">{item}</label>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setPhase(1)}
              className="text-sm text-slate-500 hover:underline"
            >
              ← Forrige fase
            </button>
            <button
              onClick={() => setPhase(3)}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg}`}
            >
              Næste fase →
            </button>
          </div>
        </div>
      )}

      {/* Phase 3: Mål */}
      {phase === 3 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Fase 3 — Mål</h3>

          {mode === "guidet" && (
            <div className={`rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700`}>
              <p className="font-medium text-slate-800">Dataindsamling:</p>
              <p className="mt-2 text-slate-600">
                Indsaml mindst 4-6 målinger. Hvis et felt kan beregnes automatisk, udfyldes det af sig selv.
              </p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className={`${accent.bgSoft}`}>
                  {config.measurementFields?.map((field) => (
                    <th key={field.label} className="border border-slate-200 px-3 py-2 text-left font-medium text-slate-700">
                      {field.label} ({field.unit})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {config.measurementFields?.map((field) => {
                      const isAuto = field.autoCalculate;
                      const value = row[field.label];
                      return (
                        <td key={field.label} className="border border-slate-200 px-3 py-2">
                          {isAuto ? (
                            <span className="text-slate-500">{value || "–"}</span>
                          ) : (
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => updateRow(i, field.label, e.target.value)}
                              placeholder="–"
                              className="w-full border-none bg-transparent p-0 text-slate-800 placeholder:text-slate-400 focus:outline-none"
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-sm text-slate-600">
            <p>
              Gyldige målinger: <strong>{validRows.length}</strong> / {rows.length}
            </p>
            {!canProceedToPhase4 && (
              <p className="mt-1 text-amber-600">Indsaml mindst 4 gyldige målinger før næste fase.</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => setPhase(2)} className="text-sm text-slate-500 hover:underline">
              ← Forrige fase
            </button>
            <button
              onClick={() => setPhase(4)}
              disabled={!canProceedToPhase4}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg} disabled:opacity-50`}
            >
              Næste fase →
            </button>
          </div>
        </div>
      )}

      {/* Phase 4: Analysér */}
      {phase === 4 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Fase 4 — Analysér</h3>

          <div className={`rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700`}>
            <p className="font-medium text-slate-800">Analysér dine resultater:</p>
            <p className="mt-2 text-slate-600">Sammenlign dine målinger med den teoretiske værdi.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Teoretisk værdi: {config.theoreticalValue || "–"}
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Din målt værdi:</label>
              <input
                type="number"
                value={studentValue}
                onChange={(e) => setStudentValue(e.target.value)}
                placeholder="Indtast din beregnede værdi"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            {config.theoreticalValue && studentValue && (
              <div className={`rounded-xl border-2 ${accent.border} ${accent.bgSoft} p-4`}>
                <p className="text-sm font-medium text-slate-700">Resultat:</p>
                <p className="mt-2 text-slate-600">
                  Afvigelse:{" "}
                  <strong>
                    {(Math.abs((parseFloat(studentValue) - config.theoreticalValue) / config.theoreticalValue) * 100).toFixed(1)}%
                  </strong>
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => setPhase(3)} className="text-sm text-slate-500 hover:underline">
              ← Forrige fase
            </button>
            <button
              onClick={() => setPhase(5)}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg}`}
            >
              Næste fase →
            </button>
          </div>
        </div>
      )}

      {/* Phase 5: Konkludér */}
      {phase === 5 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Fase 5 — Konkludér</h3>

          {config.reflectionQuestions && config.reflectionQuestions.length > 0 && (
            <div className="space-y-6">
              {config.reflectionQuestions.map((q, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-slate-700">{q}</label>
                  <textarea
                    value={reflections[i] || ""}
                    onChange={(e) => updateReflection(i, e.target.value)}
                    rows={3}
                    placeholder="Skriv dit svar her…"
                    className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              ))}
            </div>
          )}

          {config.facit && (
            <div>
              <button
                onClick={() => setShowFacit(!showFacit)}
                className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${accent.bg}`}
              >
                {showFacit ? "Skjul" : "Vis"} facit
              </button>
              {showFacit && (
                <div className={`mt-4 rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700`}>
                  <p className="font-medium text-slate-800 mb-2">Facit:</p>
                  <p>{config.facit}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button onClick={() => setPhase(4)} className="text-sm text-slate-500 hover:underline">
              ← Forrige fase
            </button>
            <button
              onClick={() => {
                setMode(null);
                setPhase("choose");
              }}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg}`}
            >
              Afslut guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
