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
type Phase = "choose" | 1 | 2 | 3 | 4 | 5;
type Row = { massG: string; extensionMm: string };

const SIM_K = 5;
const EMPTY_ROW = (): Row => ({ massG: "", extensionMm: "" });

const PHASES = [
  { key: 1, label: "Planlæg" },
  { key: 2, label: "Opstil" },
  { key: 3, label: "Mål" },
  { key: 4, label: "Analysér" },
  { key: 5, label: "Konkludér" },
] as const;

const SETUP_ITEMS = [
  "Jeg har målt fjederens naturlige længde uden belastning (nulpunkt)",
  "Jeg har samlet de materialer, jeg skal bruge: kendt masse, lineal/målebånd, statif",
  "Jeg er klar til at mål forlængelsen ved mindst 5-6 forskellige masser",
];

const SETUP_ITEMS_SIM = [
  "Simulationen er nulstillet (forlængelse = 0 mm ved ingen masse)",
  "Jeg har valgt mindst 6 masseværdier jævnt fordelt over arbejdsområdet",
  "Jeg er klar til at aflæse forlængelsen, når systemet er i ro (ikke svinger)",
];

const CONCLUSION_QUESTIONS = [
  {
    q: "1. Beskriv den sammenhæng, du fandt mellem forlængelse og kraft i dine rigtige målinger. Stemmer den overens med Hookes lov (F = k · x)?",
    ph: "I min rigtige fjeder observerede jeg at… fordi…",
  },
  {
    q: "2. Hvad målte du som fjederkonstant k for din rigtige fjeder? Hvordan sammenligner det med simulationens ideelle værdi på 5,0 N/m?",
    ph: "Min målte k var… N/m. Simulationen viste 5,0 N/m. Afvigelsen kan skyldes…",
  },
  {
    q: "3. Nævn mindst to mulige fejlkilder i dit rigtige forsøg. Hvordan ville de påvirke din måling af k?",
    ph: "Fejlkilde 1: …påvirker k ved at…\nFejlkilde 2: …påvirker k ved at…",
  },
  {
    q: "4. Giv et eksempel fra hverdagen, hvor Hookes lov og fjederkonstanten k er vigtig.",
    ph: "F.eks. i bilaffjedringer (stiv k for stabil køreposition), præcisionsvægte (kendt k for nøjagtighed) eller…",
  },
];

type Props = { accent: AccentClasses };

export default function HookesLovLabGuide({ accent }: Props) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [phase, setPhase] = useState<Phase>("choose");

  // Phase 1 state
  const [hypothesis, setHypothesis] = useState("");
  const [varIndependent, setVarIndependent] = useState("");
  const [varDependent, setVarDependent] = useState("");
  const [varControl, setVarControl] = useState("");

  // Phase 2 state
  const [setupChecked, setSetupChecked] = useState([false, false, false]);

  // Phase 3 state
  const [rows, setRows] = useState<Row[]>(() => Array.from({ length: 6 }, EMPTY_ROW));
  const [showSimComparison, setShowSimComparison] = useState(false);

  // Phase 4 state
  const [studentK, setStudentK] = useState("");

  // Phase 5 state
  const [reflections, setReflections] = useState(["", "", "", ""]);
  const [reflection, setReflection] = useState("");
  const [showFacit, setShowFacit] = useState(false);

  // Shared
  const [openHints, setOpenHints] = useState<Set<string>>(new Set());

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

  const canProceedToPhase4 = validRows.length >= 4;
  const studentKNum = parseFloat(studentK);
  const percentDiff =
    kFit !== null && Number.isFinite(studentKNum) && studentKNum > 0
      ? Math.abs((studentKNum - SIM_K) / SIM_K) * 100
      : null;

  const updateRow = (i: number, field: keyof Row, value: string) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  const toggleHint = (id: string) =>
    setOpenHints((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSetup = (i: number) =>
    setSetupChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const updateReflection = (i: number, value: string) =>
    setReflections((prev) => prev.map((v, idx) => (idx === i ? value : v)));

  const phaseIndex = (p: Phase) => (p === "choose" ? -1 : (p as number) - 1);

  // ── Mode selection ──────────────────────────────────────────────────────────

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
                  className={`mb-4 h-0.5 w-6 sm:w-12 ${currentIdx > i ? accent.bg : "bg-slate-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Phase 1: Planlæg ─────────────────────────────────────────────────── */}
      {phase === 1 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Fase 1 — Planlæg</h3>

          {mode === "guidet" && (
            <div
              className={`rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700 space-y-2`}
            >
              <p className="font-medium text-slate-800">Undersøgelsesspørgsmål:</p>
              <p className="italic text-slate-600">
                Hvordan afhænger en fjedres forlængelse af den påhængte masse?
              </p>
              <p className="font-medium text-slate-800 mt-3">Dit forsøgssetup:</p>
              <p className="text-slate-600">
                Du skal måle forlængelse på en <strong>rigtig fjeder</strong> ved at hænge kendte masser på den.
              </p>
              <p className="font-medium text-slate-800 mt-3">Fremgangsmåde:</p>
              <ol className="mt-1 list-decimal list-inside space-y-1.5">
                <li>
                  Før du begynder at måle, skal du forudsige: hvad tror du sker med forlængelsen, når du fordobler massen?
                </li>
                <li>
                  Kig på simulationen herunder for at få intuition — men husk at din rigtige fjeder kan opføre sig anderledes!
                </li>
                <li>Skriv din hypotese ved hjælp af sætningsstarteren nedenfor.</li>
                <li>Identificér dine variable inden du fortsætter.</li>
              </ol>
            </div>
          )}
          {mode === "semi" && (
            <div className="mt-3 text-sm text-slate-600 space-y-1">
              <p>
                Formulér en hypotese om sammenhængen mellem masse og forlængelse, og
                identificér dine variable.
              </p>
              <HintBox
                id="p1-h1"
                label="Hvad sker der med forlængelsen?"
                content="Øg massen og se, om forlængelsen vokser lineært. Prøv at doble massen – hvad sker der med forlængelsen?"
                openHints={openHints}
                toggle={toggleHint}
              />
              <HintBox
                id="p1-h2"
                label="Hvilke variable har du?"
                content="Den uafhængige variabel er det, du ændrer (massen). Den afhængige variabel er det, du måler (forlængelsen). Kontrolvariable holdes konstante – hvad skal du holde konstant her?"
                openHints={openHints}
                toggle={toggleHint}
              />
            </div>
          )}

          <HookesLovSim />

          <div>
            <label className="block text-sm font-medium text-slate-700">
              {mode === "guidet"
                ? "Min hypotese er, at forlængelsen x er ______ proportional med kraften F, fordi…"
                : mode === "semi"
                  ? "Skriv din hypotese:"
                  : "Skriv din hypotese og beskriv, hvilke variable du vil undersøge."}
            </label>
            <textarea
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              rows={3}
              placeholder={
                mode === "guidet"
                  ? "Min hypotese er, at forlængelsen er direkte proportional med kraften, fordi…"
                  : "Skriv din hypotese her…"
              }
              className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {mode !== "open" && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Identificér dine variable:</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Uafhængig variabel (det du ændrer)",
                    value: varIndependent,
                    set: setVarIndependent,
                    ph: "Massen",
                  },
                  {
                    label: "Afhængig variabel (det du måler)",
                    value: varDependent,
                    set: setVarDependent,
                    ph: "Forlængelsen",
                  },
                  {
                    label: "Kontrolvariable (holdes konstante)",
                    value: varControl,
                    set: setVarControl,
                    ph: "Fjederkonstanten, temperaturen",
                  },
                ].map(({ label, value, set, ph }) => (
                  <div key={label}>
                    <label className="block text-xs font-medium text-slate-600">{label}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder={ph}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

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
              Fortsæt →
            </button>
          </div>
        </div>
      )}

      {/* ── Phase 2: Opstil ──────────────────────────────────────────────────── */}
      {phase === 2 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Fase 2 — Opstil</h3>

          {mode === "guidet" && (
            <div
              className={`rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700 space-y-4`}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="font-medium text-slate-800 mb-2">📋 Dit rigtige forsøg:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs">
                    <li>Mål fjederens naturlige længde uden belastning — dette er dit nulpunkt.</li>
                    <li>Sæt fjederen op på en statif eller fast ophængning.</li>
                    <li>Hav en lineal eller målebånd klar ved siden af fjederen.</li>
                    <li>Forbered de masser, du skal bruge (mindst 5-6 forskellige værdier).</li>
                  </ol>
                </div>
                <div>
                  <p className="font-medium text-slate-800 mb-2">🖥️ Simulation til sammenligning:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs">
                    <li>Nulstil simulationen — sæt massen til 0 g.</li>
                    <li>Bekræft at forlængelsen viser 0 mm ved no load.</li>
                    <li>Notér dig hvordan grafen ser ud i simulationen.</li>
                    <li>Du sammenligner senere denne ideelle kurve med dine rigtige målinger.</li>
                  </ol>
                </div>
              </div>
              <p className="font-medium text-slate-800 mt-3">Tjekliste før du starter målingerne:</p>
              <div className="mt-1 space-y-2">
                {SETUP_ITEMS.map((item, i) => (
                  <label key={i} className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={setupChecked[i]}
                      onChange={() => toggleSetup(i)}
                      className="mt-0.5 rounded"
                    />
                    <span className={setupChecked[i] ? "text-slate-400 line-through" : ""}>
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {mode === "semi" && (
            <div className="mt-3 text-sm text-slate-600 space-y-1">
              <p>
                Initialisér simulationen og bekræft, at nulpunktet er korrekt, inden du begynder
                at registrere data.
              </p>
              <HintBox
                id="p2-h1"
                label="Hvad skal jeg kontrollere?"
                content="Sæt massen til 0 og tjek, at forlængelsen er 0 mm. Vent altid til systemet er i ro (ikke svinger), inden du aflæser forlængelsen ved en given masse."
                openHints={openHints}
                toggle={toggleHint}
              />
            </div>
          )}

          <HookesLovSim />

          <div className="flex items-center justify-between">
            <button
              onClick={() => setPhase(1)}
              className="text-sm text-slate-500 hover:underline"
            >
              ← Tilbage
            </button>
            <button
              onClick={() => setPhase(3)}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg}`}
            >
              Fortsæt →
            </button>
          </div>
        </div>
      )}

      {/* ── Phase 3: Mål ─────────────────────────────────────────────────────── */}
      {phase === 3 && (
        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Fase 3 — Mål</h3>
            {mode === "guidet" && (
              <div
                className={`mt-3 rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700 space-y-3`}
              >
                <p className="font-medium text-slate-800">📊 Mål på din rigtige fjeder:</p>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>Vælg din første masse (f.eks. 50 g) og hæng den på fjederen.</li>
                  <li>Vent til fjederen er helt stabil (ikke svinger længere).</li>
                  <li>Aflæs forlængelsen i mm (husk nulpunktet!) og notér den i tabellen.</li>
                  <li>Fjern massen og tilføj næste masse. Gentag trin 2-3.</li>
                  <li>
                    Tag mindst 5-6 målepunkter fordelt bredt — fra små masser til større, men
                    ikke så tunge at fjederen deformeres!
                  </li>
                </ol>
                <p className="font-medium text-slate-800 mt-2">Kraften F = m · g beregnes automatisk.</p>
              </div>
            )}
            {mode === "semi" && (
              <div className="mt-3 text-sm text-slate-600 space-y-1">
                <p>Mål forlængelsen for mindst 6 masser og udfyld tabellen. Kraften beregnes automatisk.</p>
                <HintBox
                  id="p3-h1"
                  label="Hvordan fordeler jeg mine masser?"
                  content="Brug en jævn fordeling af masseværdier – undgå at bruge 5 næsten identiske masser og ét udligger. En god fordeling giver en mere pålidelig hældning."
                  openHints={openHints}
                  toggle={toggleHint}
                />
                <HintBox
                  id="p3-h2"
                  label="Hvad hvis fjederen svinger?"
                  content="Vent til systemet er kommet i ro (ligevægt), inden du aflæser forlængelsen. Du kan dæmpe svingningerne ved forsigtigt at holde massen stille."
                  openHints={openHints}
                  toggle={toggleHint}
                />
              </div>
            )}
          </div>

          <HookesLovSim />

          {mode === "guidet" && (
            <div className="mb-4 flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSimComparison}
                  onChange={(e) => setShowSimComparison(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-slate-700">Vis simulationens værdier til sammenligning</span>
              </label>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Masse (g)</th>
                  <th className="px-4 py-3 text-left">Din måling: Forlængelse (mm)</th>
                  <th className="px-4 py-3 text-right">Kraft F (N)</th>
                  {showSimComparison && mode === "guidet" && (
                    <th className="px-4 py-3 text-left text-slate-400">Sim: Forlængelse (mm)</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, i) => {
                  const m = parseFloat(row.massG);
                  const f =
                    Number.isFinite(m) && m > 0 ? ((m / 1000) * 9.82).toFixed(4) : null;
                  const simX = m > 0 ? ((m / 1000) * 9.82) / SIM_K : 0;
                  return (
                    <tr key={i} className="bg-white">
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={row.massG}
                          onChange={(e) => updateRow(i, "massG", e.target.value)}
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
                          onChange={(e) => updateRow(i, "extensionMm", e.target.value)}
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
                      {showSimComparison && mode === "guidet" && (
                        <td className="px-4 py-2 text-left font-mono text-slate-400">
                          {m > 0 ? (simX * 1000).toFixed(1) : "—"} mm
                        </td>
                      )}
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
            <button
              onClick={() => setPhase(2)}
              className="text-sm text-slate-500 hover:underline"
            >
              ← Tilbage
            </button>
            <span className="text-sm text-slate-500">
              {canProceedToPhase4
                ? `${validRows.length} gyldige målepunkter`
                : `Udfyld mindst 4 rækker for at fortsætte (${validRows.length}/4)`}
            </span>
            <button
              disabled={!canProceedToPhase4}
              onClick={() => setPhase(4)}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-opacity ${accent.bg} disabled:cursor-not-allowed disabled:opacity-40`}
            >
              Fortsæt →
            </button>
          </div>
        </div>
      )}

      {/* ── Phase 4: Analysér ────────────────────────────────────────────────── */}
      {phase === 4 && (
        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Fase 4 — Analysér</h3>
            {mode === "guidet" && (
              <div
                className={`mt-3 rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700 space-y-3`}
              >
                <p className="font-medium text-slate-800">
                  📈 Analyse af dine rigtige målinger:
                </p>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>
                    Grafen viser <strong>dine målinger</strong> (punkter) og en bedste rette linje
                    beregnet fra dem.
                  </li>
                  <li>
                    Hookes lov siger F = k·x, så{" "}
                    <strong>hældningen af linjen er din fjederkonstant k</strong>.
                  </li>
                  <li>
                    Vælg to punkter på den røde linje (ikke dine datapunkter) og beregn: k = ΔF /
                    Δx.
                  </li>
                  <li>
                    Indtast din aflæste k nedenfor. Hvordan sammenligner den med simulationens
                    ideelle værdi på 5,0 N/m?
                  </li>
                </ol>
                <p className="text-xs text-slate-600 italic mt-2">
                  Husk: Din rigtige fjeder kan have andre egenskaber end simulationen — det er helt normalt!
                </p>
              </div>
            )}
            {mode === "semi" && (
              <div className="mt-3 text-sm text-slate-600 space-y-1">
                <p>
                  Aflæs fjederkonstanten k fra grafens hældning og sammenlign med
                  referencenværdien.
                </p>
                <HintBox
                  id="p4-h1"
                  label="Hvordan finder jeg k fra grafen?"
                  content="Hældningen af F-x-grafen er k. Find to punkter på den bedste rette linje – ikke dine datapunkter – og beregn ΔF / Δx. Enheden er N/m."
                  openHints={openHints}
                  toggle={toggleHint}
                />
                <HintBox
                  id="p4-h2"
                  label="Hvad betyder afvigelsen?"
                  content="En afvigelse under 10 % er meget godt for dette forsøg. 10–20 % er acceptabelt. Over 20 % tyder på en systematisk fejl – har du nulstillet korrekt?"
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

          {percentDiff !== null && (
            <div className={`rounded-xl border ${accent.border} ${accent.bgSoft} p-4`}>
              <p className="text-sm font-medium text-slate-700">
                Sammenligning med simulationens fjeder (k = {SIM_K} N/m):
              </p>
              <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-slate-500">Din målte k</div>
                  <div className={`mt-1 font-mono text-lg font-semibold ${accent.text}`}>
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

          <div className="flex items-center justify-between">
            <button
              onClick={() => setPhase(3)}
              className="text-sm text-slate-500 hover:underline"
            >
              ← Tilbage
            </button>
            <button
              onClick={() => setPhase(5)}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg}`}
            >
              Fortsæt →
            </button>
          </div>
        </div>
      )}

      {/* ── Phase 5: Konkludér ───────────────────────────────────────────────── */}
      {phase === 5 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Fase 5 — Konkludér</h3>

          {mode === "guidet" && (
            <div className="space-y-4">
              {CONCLUSION_QUESTIONS.map(({ q, ph }, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-slate-700">{q}</label>
                  <textarea
                    value={reflections[i]}
                    onChange={(e) => updateReflection(i, e.target.value)}
                    rows={2}
                    placeholder={ph}
                    className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              ))}
            </div>
          )}

          {mode === "semi" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Skriv en konklusion, der beskriver, hvad du fandt, og om det stemmer med
                  Hookes lov.
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={4}
                  placeholder="Beskriv dine fund og sammenlign med teorien…"
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <HintBox
                id="p5-h1"
                label="Hvad skal en god konklusion indeholde?"
                content="En god konklusion svarer på: Hvad fandt du? Stemmer det med Hookes lov (F = k·x)? Hvad kan forklare afvigelsen fra de 5 N/m?"
                openHints={openHints}
                toggle={toggleHint}
              />
              <HintBox
                id="p5-h2"
                label="Hvilke fejlkilder kan jeg nævne?"
                content="Tænk på: aflæsning af forlængelsen mens fjederen stadig svingede lidt, afrundingsfejl ved indlæsning af data, eller at fjederen blev trukket let ud over det elastiske område."
                openHints={openHints}
                toggle={toggleHint}
              />
            </div>
          )}

          {mode === "open" && (
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Skriv en kort konklusion om, hvad du fandt i dette forsøg.
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={5}
                placeholder="Din konklusion…"
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          )}

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
                <p className="font-semibold text-slate-800">✓ Forventet konklusion:</p>
                <p>
                  I vores rigtige forsøg fandt vi, at forlængelsen af fjæderen var direkte
                  proportional med den påhængte kraft — og dermed at Hookes lov F = k · x
                  gælder for vores fjeder. Grafen over vores målinger viste en næsten ret linje,
                  og hældningen gav vores fjederkonstant k.
                </p>
                <p>
                  Vores målte k var sandsynligt forskellig fra simulationens ideelle værdi på
                  5,0 N/m. Det skyldes blandt andet at vores rigtige fjeder har små
                  uregelmæssigheder, vi aflæste aflængelsen mens fjederen svingede lidt, og der
                  er variation i vores målinger. Simulationen er en idealiseret model — den
                  virkelige verden er mere kompleks!
                </p>
                <p>
                  Hookes lov er vigtig i praksis i bl.a. bilaffjedringer (hvor man vælger en
                  bestemt k for at få den ønskede køreegenskab), præcisionsvægte (hvor k må være
                  kendt for nøjagtig vejning) og mange andre tekniske anvendelser.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPhase(4)}
              className="text-sm text-slate-500 hover:underline"
            >
              ← Tilbage
            </button>
            <button
              onClick={() => {
                setMode(null);
                setPhase("choose");
              }}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg}`}
            >
              Færdig
            </button>
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
