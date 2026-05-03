import type { PhaseProps } from "../types";
import { usePhase5State } from "../hooks/usePhase5State";
import ResetWorkButton from "../components/ResetWorkButton";

export default function Phase5Conclude({
  state,
  dispatch,
  guide,
  accent,
  onRetreat,
  onRequestReset,
}: PhaseProps) {
  const phase5 = usePhase5State(state, dispatch);

  const handleFinish = () => {
    dispatch({ type: "setMode", mode: null });
    dispatch({ type: "setPhase", phase: "choose" });
  };

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Fase 5 — Konkludér</h3>

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
          <button
            onClick={() => phase5.setShowFacit(!phase5.showFacit)}
            className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${accent.bg}`}
          >
            {phase5.showFacit ? "Skjul" : "Vis"} facit
          </button>
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
        <button
          onClick={handleFinish}
          className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg}`}
        >
          Afslut guide
        </button>
      </div>

      <ResetWorkButton onClick={onRequestReset} />
    </div>
  );
}
