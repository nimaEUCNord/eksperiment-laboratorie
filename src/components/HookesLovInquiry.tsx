"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { getAccent } from "@/lib/accent";

type AccentBundle = ReturnType<typeof getAccent>;
type Mode = "guided" | "semi-guided" | "open";

const HookesLovSim = dynamic(() => import("./sims/HookesLov"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-400">
      Indlæser simulation…
    </div>
  ),
});

const GUIDED_STEPS = [
  {
    title: "Trin 1 – Nulpunktet",
    instruction:
      "Sæt massen til 0 kg ved hjælp af skyderen (helt til venstre). Hvad viser simuleringen? Aflæs forlængelsen x og fjederkraften F i statfelterne under simuleringen.",
    prompt:
      "Hvad sker der med fjederen, når der ikke hænger nogen masse på den?",
  },
  {
    title: "Trin 2 – Første måling",
    instruction:
      "Sæt massen til 0,02 kg. Vent til simuleringen er i ro. Aflæs forlængelsen x (i cm) og fjederkraften F (i N).",
    prompt:
      "Hvad tror du sker med x og F, hvis du fordobler massen til 0,04 kg?",
  },
  {
    title: "Trin 3 – Fordobling",
    instruction:
      "Sæt nu massen til 0,04 kg — det dobbelte af trin 2. Vent til ro, og aflæs x og F igen.",
    prompt:
      "Hvad skete der med forlængelsen, da du fordoblede massen? Hvad skete der med fjederkraften?",
  },
  {
    title: "Trin 4 – Find mønsteret",
    instruction:
      "Prøv med masserne 0,06, 0,08 og 0,10 kg. For hver masse: aflæs F og x, og beregn forholdet F ÷ x.",
    prompt: "Hvad bemærker du ved forholdet F ÷ x for de forskellige masser?",
  },
  {
    title: "Trin 5 – Din opdagelse",
    instruction:
      "Du har nu lavet flere målinger og opdaget, at forholdet F ÷ x er konstant — det ændrer sig ikke, uanset hvilken masse du bruger.",
    prompt:
      "Hvad er den matematiske sammenhæng mellem fjederkraften F og forlængelsen x? Forsøg at skriv formlen.",
  },
] as const;

const HINTS = [
  "Prøv at ændre massen og observer, hvad der sker med forlængelsen og fjederkraften.",
  "Lav mindst 4 målinger med forskellige masser. Aflæs F og x for hver.",
  "Beregn forholdet F ÷ x for hver af dine målinger. Er forholdet konstant?",
  "Den konstante F/x-værdi er fjederkonstanten k. Hvad er ligningen der forbinder F, k og x?",
];

export function HookesLovInquiry({ accent }: { accent: AccentBundle }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [guidedStep, setGuidedStep] = useState(0);
  const [hintsShown, setHintsShown] = useState(0);
  const [showConclusion, setShowConclusion] = useState(false);
  const [conclusionText, setConclusionText] = useState("");
  const [equationRevealed, setEquationRevealed] = useState(false);

  function reset() {
    setMode(null);
    setGuidedStep(0);
    setHintsShown(0);
    setShowConclusion(false);
    setConclusionText("");
    setEquationRevealed(false);
  }

  if (!mode) {
    return <ModePicker accent={accent} onSelect={setMode} />;
  }

  return (
    <div>
      <div className="mt-6 flex items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${accent.bgSoft} ${accent.text}`}
        >
          {mode === "guided"
            ? "Guidet"
            : mode === "semi-guided"
              ? "Semi-guidet"
              : "Åben undersøgelse"}
        </span>
        <button
          onClick={reset}
          className="text-sm text-slate-500 hover:text-slate-700 hover:underline"
        >
          Skift tilstand
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-8 lg:grid lg:grid-cols-2">
        <div>
          {mode === "guided" && (
            <GuidedPanel
              accent={accent}
              step={guidedStep}
              onNext={() => {
                if (guidedStep < GUIDED_STEPS.length - 1) {
                  setGuidedStep((s) => s + 1);
                } else {
                  setShowConclusion(true);
                }
              }}
            />
          )}
          {mode === "semi-guided" && (
            <SemiGuidedPanel
              accent={accent}
              hintsShown={hintsShown}
              onShowHint={() =>
                setHintsShown((n) => Math.min(n + 1, HINTS.length))
              }
              onConclude={() => setShowConclusion(true)}
            />
          )}
          {mode === "open" && (
            <OpenPanel accent={accent} onConclude={() => setShowConclusion(true)} />
          )}
        </div>

        <div>
          <HookesLovSim />
        </div>
      </div>

      {showConclusion && (
        <ConclusionSection
          accent={accent}
          conclusionText={conclusionText}
          onChange={setConclusionText}
          revealed={equationRevealed}
          onReveal={() => setEquationRevealed(true)}
        />
      )}
    </div>
  );
}

function ModePicker({
  accent,
  onSelect,
}: {
  accent: AccentBundle;
  onSelect: (m: Mode) => void;
}) {
  const modes: { id: Mode; label: string; name: string; description: string }[] =
    [
      {
        id: "guided",
        label: "01",
        name: "Guidet",
        description:
          "Bliv guidet trin for trin gennem forsøget med spørgsmål og observationsopgaver.",
      },
      {
        id: "semi-guided",
        label: "02",
        name: "Semi-guidet",
        description:
          "Start med et åbent spørgsmål og udforsk selv — afslør hints, hvis du går i stå.",
      },
      {
        id: "open",
        label: "03",
        name: "Åben undersøgelse",
        description: "Kun simuleringen og ét spørgsmål. Opdagelsen er helt din.",
      },
    ];

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-slate-900">Vælg din tilgang</h2>
      <p className="mt-2 text-slate-600">
        Alle tre tilgange bruger den samme simulation. Vælg, hvor meget hjælp du
        vil have.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={`group rounded-2xl border-2 border-slate-200 bg-white p-6 text-left transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${accent.ring} ${accent.hoverBorder}`}
          >
            <span
              className={`text-xs font-semibold uppercase tracking-widest ${accent.textSoft}`}
            >
              {m.label}
            </span>
            <h3 className="mt-3 text-base font-semibold text-slate-900 group-hover:underline">
              {m.name}
            </h3>
            <p className="mt-1 text-sm text-slate-600">{m.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function GuidedPanel({
  accent,
  step,
  onNext,
}: {
  accent: AccentBundle;
  step: number;
  onNext: () => void;
}) {
  const current = GUIDED_STEPS[step];
  const isLast = step === GUIDED_STEPS.length - 1;
  const progress = ((step + 1) / GUIDED_STEPS.length) * 100;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${accent.textSoft}`}
        >
          Trin {step + 1} / {GUIDED_STEPS.length}
        </span>
      </div>
      <div className={`mt-2 h-1 w-full overflow-hidden rounded-full ${accent.bgSoft}`}>
        <div
          className={`h-1 rounded-full transition-all duration-500 ${accent.bg}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-900">{current.title}</h3>
      <p className="mt-2 text-slate-700">{current.instruction}</p>

      <div className={`mt-4 rounded-xl border ${accent.border} ${accent.bgSoft} px-4 py-3`}>
        <p className={`text-xs font-semibold uppercase tracking-wider ${accent.textSoft}`}>
          Overvej
        </p>
        <p className="mt-1 text-sm italic text-slate-700">{current.prompt}</p>
      </div>

      <button
        onClick={onNext}
        className={`mt-6 inline-flex items-center gap-1 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 ${accent.bg}`}
      >
        {isLast ? "Gå til konklusion" : "Næste trin"} →
      </button>
    </div>
  );
}

function SemiGuidedPanel({
  accent,
  hintsShown,
  onShowHint,
  onConclude,
}: {
  accent: AccentBundle;
  hintsShown: number;
  onShowHint: () => void;
  onConclude: () => void;
}) {
  const allHintsShown = hintsShown >= HINTS.length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-slate-900">Undersøgelsesspørgsmål</h3>
      <p className={`mt-3 font-serif text-xl font-medium italic ${accent.text}`}>
        "Hvordan afhænger fjederkraften af forlængelsen?"
      </p>
      <p className="mt-3 text-sm text-slate-600">
        Brug simuleringen til at udforske spørgsmålet. Lav observationer og se,
        om du kan finde et mønster.
      </p>

      {hintsShown > 0 && (
        <div className="mt-5 space-y-2">
          {HINTS.slice(0, hintsShown).map((hint, i) => (
            <div
              key={i}
              className={`rounded-xl border ${accent.border} ${accent.bgSoft} px-4 py-3`}
            >
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${accent.textSoft}`}
              >
                Hint {i + 1}
              </span>
              <p className="mt-1 text-sm text-slate-700">{hint}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {!allHintsShown && (
          <button
            onClick={onShowHint}
            className={`rounded-lg border-2 ${accent.border} ${accent.text} px-4 py-2 text-sm font-medium transition hover:opacity-80`}
          >
            Vis hint {hintsShown + 1} / {HINTS.length}
          </button>
        )}
        <button
          onClick={onConclude}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 ${accent.bg}`}
        >
          Gå til konklusion →
        </button>
      </div>
    </div>
  );
}

function OpenPanel({
  accent,
  onConclude,
}: {
  accent: AccentBundle;
  onConclude: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="font-serif text-3xl font-semibold leading-snug text-slate-900">
        Hvad kan du opdage om fjedre?
      </p>
      <p className="mt-4 text-slate-600">
        Brug simuleringen frit. Eksperimenter, noter hvad du ser, og se om du
        kan formulere en regel.
      </p>
      <button
        onClick={onConclude}
        className={`mt-8 text-sm ${accent.text} hover:underline`}
      >
        Klar til konklusion? →
      </button>
    </div>
  );
}

function ConclusionSection({
  accent,
  conclusionText,
  onChange,
  revealed,
  onReveal,
}: {
  accent: AccentBundle;
  conclusionText: string;
  onChange: (v: string) => void;
  revealed: boolean;
  onReveal: () => void;
}) {
  return (
    <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-slate-900">Konklusion</h2>
      <p className="mt-2 text-slate-600">
        Skriv din opdagelse med egne ord. Hvad er sammenhængen mellem
        fjederkraften og forlængelsen?
      </p>

      <textarea
        value={conclusionText}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Skriv din konklusion her…"
        rows={4}
        className={`mt-4 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 ${accent.ring}`}
      />

      {!revealed && (
        <button
          onClick={onReveal}
          className={`mt-4 inline-flex items-center gap-1 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 ${accent.bg}`}
        >
          Afslør Hookes lov
        </button>
      )}

      {revealed && (
        <div className="mt-6">
          <div
            className={`flex items-center justify-center rounded-2xl border ${accent.border} ${accent.bgSoft} px-6 py-8`}
          >
            <span className="font-serif text-4xl tracking-wide text-slate-900 sm:text-5xl">
              <span className="italic">F</span>
              {" = "}
              <span className="italic">k</span>
              {" · "}
              <span className="italic">x</span>
            </span>
          </div>
          <div className="mt-6 space-y-3 text-slate-700">
            <p>
              <strong>F</strong> er fjederkraften i Newton (N) — den kraft,
              fjederen trækker tilbage med.
            </p>
            <p>
              <strong>k</strong> er fjederkonstanten i N/m — et mål for, hvor
              stiv fjederen er. Jo større k, jo mere kraft kræves der for at
              forlænge fjederen.
            </p>
            <p>
              <strong>x</strong> er forlængelsen i meter (m) — hvor meget
              fjederen er trukket ud fra sin naturlige hvilelængde.
            </p>
            <p>
              Sammenhængen er <em>lineær</em>: fordobles forlængelsen,
              fordobles fjederkraften. Det er præcis det, du opdagede i
              simuleringen.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
