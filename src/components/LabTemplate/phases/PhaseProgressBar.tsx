import type { AccentClasses } from "@/lib/accent";
import type { Phase, RealPhase } from "../types";
import { PHASES } from "../types";

interface PhaseProgressBarProps {
  accent: AccentClasses;
  currentPhase: Phase;
  isPhaseCompleted: (phase: RealPhase) => boolean;
  onSelectPhase: (phase: RealPhase) => void;
}

export default function PhaseProgressBar({
  accent,
  currentPhase,
  isPhaseCompleted,
  onSelectPhase,
}: PhaseProgressBarProps) {
  const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);
  const isChoosing = currentPhase === "choose";

  return (
    <div className="mt-4 flex items-center gap-0">
      {PHASES.map((p, i) => {
        const active = currentIndex === i;
        const shouldDisableButton = isChoosing && i > 0;
        const done = isPhaseCompleted(p.id);
        return (
          <div key={p.id} className="flex items-center">
            <button
              onClick={() => onSelectPhase(p.id)}
              className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
              disabled={shouldDisableButton}
            >
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
                {p.stepLabel}
              </span>
            </button>
            {i < PHASES.length - 1 && (
              <div className={`mb-4 h-0.5 w-6 sm:w-12 ${done ? accent.bg : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
