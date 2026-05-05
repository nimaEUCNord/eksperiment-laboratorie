import type { PhaseProps } from "../types";
import { usePhase5State } from "../hooks/usePhase5State";
import ResetWorkButton from "../components/ResetWorkButton";
import ActionButton from "../components/ActionButton";
import PhaseIntroBox from "../components/PhaseIntroBox";
import { DEFAULT_PHASE_INTROS } from "../constants/defaultPhaseIntros";

export default function Phase5Conclude({
  state,
  dispatch,
  guide,
  accent,
  onRetreat,
  onRequestReset,
}: PhaseProps) {
  const phase5 = usePhase5State(state, dispatch);
  const mode = phase5.mode;

  const handleFinish = () => {
    dispatch({ type: "setMode", mode: null });
    dispatch({ type: "setPhase", phase: "choose" });
  };

  return (
    <div className="mt-8 space-y-6">
      {mode === "guidet" && (
        <PhaseIntroBox accent={accent} content={guide.phase5Intro ?? DEFAULT_PHASE_INTROS[5]} />
      )}

      {guide.reflectionQuestions && guide.reflectionQuestions.length > 0 && (
        <div className="space-y-6">
          {guide.reflectionQuestions.map((q, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-slate-700">{q}</label>
              <textarea
                value={phase5.reflections[i] || ""}
                onChange={(e) => phase5.updateReflection(i, e.target.value)}
                rows={3}
                placeholder="Skriv dit svar her…"
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          ))}
        </div>
      )}

      {guide.facit && (
        <div>
          <ActionButton accent={accent} onClick={() => phase5.setShowFacit(!phase5.showFacit)}>
            {phase5.showFacit ? "Skjul" : "Vis"} facit
          </ActionButton>
          {phase5.showFacit && (
            <div className={`mt-4 rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700`}>
              <p className="font-medium text-slate-800 mb-2">Facit:</p>
              <p className="whitespace-pre-wrap">{guide.facit}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={onRetreat} className="text-sm text-slate-500 hover:underline">
          ← Forrige fase
        </button>
        <ActionButton accent={accent} onClick={handleFinish}>
          Afslut guide
        </ActionButton>
      </div>

      <ResetWorkButton onClick={onRequestReset} />
    </div>
  );
}
