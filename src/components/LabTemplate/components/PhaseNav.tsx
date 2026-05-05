import type { AccentClasses } from "@/lib/accent";
import ActionButton from "./ActionButton";

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
      <ActionButton accent={accent} disabled={nextDisabled} onClick={() => onNext()}>
        {nextLabel}
      </ActionButton>
    </div>
  );
}
