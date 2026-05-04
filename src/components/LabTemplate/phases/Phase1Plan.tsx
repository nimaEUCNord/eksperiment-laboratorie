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

  const hasAnyError = Object.values(phase1.validationErrors).some((e) =>
    Object.values(e).some((v) => v),
  );

  const needsValidation =
    mode !== "open" &&
    !!guide.variables &&
    !!guide.validateVariableInputs &&
    !!guide.blockOnWrongVariableInputs &&
    !guide.bypassLocks;
  const validationHasRun = Object.keys(phase1.validationErrors).length > 0;
  const canAdvance = !needsValidation || (validationHasRun && !hasAnyError);

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
                  showAnswers={phase1.isAttemptsExhausted}
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

      {guide.blockOnWrongVariableInputs && phase1.varAttempts > 0 && hasAnyError && !phase1.isAttemptsExhausted && (
        <p className="text-sm text-red-600">
          Forkerte svar — du har {phase1.attemptsLeft} {phase1.attemptsLeft === 1 ? "forsøg" : "forsøg"} tilbage.
        </p>
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
        <div className="flex gap-2">
          {mode !== "open" && guide.validateVariableInputs && guide.variables && (
            <button
              onClick={() => phase1.checkVariables()}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-opacity ${accent.bg} ${canAdvance ? "opacity-40" : ""}`}
            >
              Tjek variable
            </button>
          )}
          <button
            onClick={handleNext}
            className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-opacity ${accent.bg} ${canAdvance ? "" : "opacity-40"}`}
          >
            Næste fase →
          </button>
        </div>
      </div>

      <ResetWorkButton onClick={onRequestReset} />
    </div>
  );
}
