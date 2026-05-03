import type { PhaseProps } from "../types";
import { usePhase1State } from "../hooks/usePhase1State";
import VariableInputRow from "../components/VariableInputRow";
import ResetWorkButton from "../components/ResetWorkButton";

export default function Phase1Plan({
  state,
  dispatch,
  guide,
  accent,
  onAdvance,
  onRequestReset,
}: PhaseProps) {
  const phase1 = usePhase1State(state, dispatch, guide);
  const mode = phase1.mode;

  const handleSwitchMode = () => {
    dispatch({ type: "setMode", mode: null });
    dispatch({ type: "setPhase", phase: "choose" });
    dispatch({ type: "clearValidatedFields" });
  };

  const handleNext = () => {
    const isValid = phase1.validateAll();
    if (!isValid && guide.blockOnWrongVariableInputs && !guide.bypassLocks) return;
    onAdvance();
  };

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Fase 1 — Planlæg</h3>

      {mode !== "open" && guide.variables && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Identificér dine variable:</p>
          <div className="space-y-6">
            {guide.variables.map((v) => {
              const varInput = phase1.varInputs[v.name] || {
                fysiskStorrelse: "",
                symbol: "",
                enhed: "",
              };
              const varError = phase1.validationErrors[v.name] || {
                fysiskStorrelse: false,
                symbol: false,
                enhed: false,
              };
              return (
                <VariableInputRow
                  key={v.name}
                  variable={v}
                  input={varInput}
                  errors={{
                    fysiskStorrelse: !!varError.fysiskStorrelse,
                    symbol: !!varError.symbol,
                    enhed: !!varError.enhed,
                  }}
                  validatedSet={phase1.validatedFields[v.name]}
                  validateInputs={!!guide.validateVariableInputs}
                  mode={mode ?? "guidet"}
                  onChange={(field, value) => phase1.setVariableField(v.name, field, value)}
                  onBlur={(field) => {
                    if (guide.validateVariableInputs) phase1.validateField(v.name, field);
                  }}
                />
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
          value={phase1.hypothesis}
          onChange={(e) => phase1.setHypothesis(e.target.value)}
          rows={3}
          placeholder={guide.hypothesisPlaceholder || "Skriv din hypotese her…"}
          className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handleSwitchMode}
          className="text-sm text-slate-500 hover:underline"
        >
          ← Skift undersøgelsesform
        </button>
        <button
          onClick={handleNext}
          disabled={phase1.isAdvanceBlockedByValidation()}
          className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Næste fase →
        </button>
      </div>

      <ResetWorkButton onClick={onRequestReset} />
    </div>
  );
}
