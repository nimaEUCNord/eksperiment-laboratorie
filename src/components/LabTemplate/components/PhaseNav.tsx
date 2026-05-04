import type { AccentClasses } from "@/lib/accent";

interface PhaseNavProps {
  accent: AccentClasses;
  onPrev: () => void;
  prevLabel?: string;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export default function PhaseNav({
  accent,
  onPrev,
  prevLabel = "← Forrige fase",
  onNext,
  nextLabel = "Næste fase →",
  nextDisabled = false,
}: PhaseNavProps) {
  return (
    <div className="flex items-center justify-between">
      <button onClick={onPrev} className="text-sm text-slate-500 hover:underline">
        {prevLabel}
      </button>
      <button
        onClick={() => onNext()}
        disabled={nextDisabled}
        className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {nextLabel}
      </button>
    </div>
  );
}
