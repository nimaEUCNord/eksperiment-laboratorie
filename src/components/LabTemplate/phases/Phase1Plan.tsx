import { useEffect, useRef } from "react";
import type { PhaseProps, RealPhase } from "../types";
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
  onRegisterAdvanceHandler,
}: PhaseProps) {
  const phase1 = usePhase1State(state, dispatch, guide);
  const mode = phase1.mode;

  const hasAnyError = Object.values(phase1.validationErrors).some((e) =>
    Object.values(e).some((v) => v),
  );

  const VAR_FIELDS = [
    { field: "fysiskStorrelse" as const, expectedKey: "expectedPhysicalQuantity" as const },
    { field: "symbol" as const, expectedKey: "expectedSymbol" as const },
    { field: "enhed" as const, expectedKey: "expectedUnit" as const },
  ];
  let totalFields = 0;
  let correctCount = 0;
  if (guide.variables) {
    for (const v of guide.variables) {
      const errs = phase1.validationErrors[v.name];
      for (const { field, expectedKey } of VAR_FIELDS) {
        if (!v[expectedKey]) continue;
        totalFields += 1;
        if (errs && errs[field] === false) correctCount += 1;
      }
    }
  }

  const needsValidation =
    mode !== "open" &&
    !!guide.variables &&
    !!guide.validateVariableInputs &&
    !!guide.blockOnWrongVariableInputs &&
    !guide.bypassLocks;
  const validationHasRun = Object.keys(phase1.validationErrors).length > 0;
  const canAdvanceVars = !needsValidation || (validationHasRun && !hasAnyError);

  const needsHypValidation =
    mode !== "open" &&
    !!guide.hypothesisKeywords?.length &&
    !!guide.validateHypothesis &&
    !!guide.blockOnWrongHypothesis &&
    !guide.bypassLocks;
  const hypHasError = phase1.hypothesisMissingKeywords.length > 0;
  const canAdvanceHyp =
    !needsHypValidation || (phase1.hypothesisChecked && !hypHasError);

  const canAdvance = canAdvanceVars && canAdvanceHyp;

  const showHypKeywords =
    !!guide.hypothesisKeywords?.length &&
    (phase1.isHypAttemptsExhausted ||
      (mode === "guidet" && phase1.hypothesisChecked && hypHasError));

  const handleSwitchMode = () => {
    dispatch({ type: "setMode", mode: null });
    dispatch({ type: "setPhase", phase: "choose" });
    dispatch({ type: "clearValidatedFields" });
  };

  const advanceHandlerRef = useRef<((t: RealPhase) => void) | null>(null);
  advanceHandlerRef.current = (targetPhase?: RealPhase) => {
    const varsOk = phase1.validateAll();
    const hypOk = phase1.checkHypothesis();
    if (!varsOk && guide.blockOnWrongVariableInputs && !guide.bypassLocks) return;
    if (!hypOk && guide.blockOnWrongHypothesis && !guide.bypassLocks) return;
    onAdvance(targetPhase);
  };

  useEffect(() => {
    onRegisterAdvanceHandler((t) => advanceHandlerRef.current?.(t));
    return () => onRegisterAdvanceHandler(null);
  }, [onRegisterAdvanceHandler]);

  const handleNext = () => advanceHandlerRef.current?.();

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
                  validatedSet={phase1.varCheckPressed ? phase1.validatedFields[v.name] : undefined}
                  validateInputs={!!guide.validateVariableInputs}
                  mode={mode ?? "guidet"}
                  showAnswers={phase1.isAttemptsExhausted}
                  onChange={(field, value) => phase1.setVariableField(v.name, field, value)}
                  onBlur={() => {}}
                />
              );
            })}
          </div>
        </div>
      )}

      {guide.blockOnWrongVariableInputs && phase1.varAttempts > 0 && hasAnyError && !phase1.isAttemptsExhausted && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-base font-semibold text-slate-800">
          Du har <span className="text-emerald-600">{correctCount}</span> af {totalFields} rigtige — prøv igen ({phase1.attemptsLeft} forsøg tilbage).
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
        {phase1.hypothesisChecked && hypHasError && phase1.hypAttempts > 0 && (
          <p className="mt-2 text-sm text-red-600">
            💡 {guide.hypothesisHints?.[phase1.hypAttempts - 1] ?? "Hypotesen mangler centrale begreber — prøv igen."}
            {!phase1.isHypAttemptsExhausted && (
              <> — du har {phase1.hypAttemptsLeft} forsøg tilbage.</>
            )}
          </p>
        )}
        {phase1.hypothesisChecked && !hypHasError && (
          <p className="mt-2 text-sm text-green-600">
            ✓ Hypotesen indeholder de forventede nøgleord.
          </p>
        )}
        {showHypKeywords && (
          <p className="mt-2 text-xs text-red-500">
            Forventede nøgleord: {guide.hypothesisKeywords!.map((k) => `"${k}"`).join(", ")}
          </p>
        )}
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
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-opacity ${accent.bg} ${canAdvanceVars ? "opacity-40" : ""}`}
            >
              Tjek variable
            </button>
          )}
          {mode !== "open" && guide.validateHypothesis && !!guide.hypothesisKeywords?.length && (
            <button
              onClick={() => phase1.checkHypothesis()}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-opacity ${accent.bg} ${canAdvanceHyp ? "opacity-40" : ""}`}
            >
              Tjek hypotese
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
