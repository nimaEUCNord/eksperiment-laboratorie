import type { AccentClasses } from "@/lib/accent";
import type { Mode } from "../types";

interface PhaseChooserProps {
  accent: AccentClasses;
  onChoose: (mode: Mode) => void;
}

const MODE_OPTIONS: ReadonlyArray<{ key: Mode; title: string; desc: string }> = [
  { key: "guidet", title: "Guidet", desc: "Trin-for-trin vejledning og instruktioner ved hver fase." },
  { key: "semi", title: "Semi-guidet", desc: "Korte overblik med hints, som du kan åbne efter behov." },
  { key: "open", title: "Åben undersøgelse", desc: "Kun værktøjerne – du bestemmer selv fremgangsmåden." },
];

export default function PhaseChooser({ accent, onChoose }: PhaseChooserProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Laboratorieguide</h2>
      <p className="mt-2 text-slate-600">
        Vælg den undersøgelsesform, der passer til jeres time.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {MODE_OPTIONS.map(({ key, title, desc }) => (
          <button
            key={key}
            onClick={() => onChoose(key)}
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
