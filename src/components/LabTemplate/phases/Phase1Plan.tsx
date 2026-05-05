import { useEffect, useRef } from "react";
import type { PhaseProps, RealPhase } from "../types";
import { usePhase1State } from "../hooks/usePhase1State";
import VariableInputRow from "../components/VariableInputRow";
import ResetWorkButton from "../components/ResetWorkButton";
import TjekFeedback from "../components/TjekFeedback";
import ActionButton from "../components/ActionButton";

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

  const totalHypKeywords = guide.hypothesisKeywords?.length ?? 0;
  const matchedHypKeywords = totalHypKeywords - phase1.hypothesisMissingKeywords.length;

  const canAdvance = canAdvanceVars && canAdvanceHyp;

  const handleSwitchMode = () => {
    dispatch({ type: "setMode", mode: null });
    dispatch({ type: "setPhase", phase: "choose" });
    dispatch({ type: "clearValidatedFields" });
  };

  const advanceHandlerRef = useRef<((t?: RealPhase) => void) | null>(null);
  advanceHandlerRef.current = (targetPhase?: RealPhase) => {
    if (!canAdvance) return;
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

      <TjekFeedback
        status={
          guide.blockOnWrongVariableInputs && phase1.varAttempts > 0 && hasAnyError
            ? "wrong"
            : phase1.varCheckPressed && !hasAnyError
            ? "correct"
            : null
        }
        message={
          hasAnyError
            ? (guide.variableHints?.[phase1.varAttempts - 1] ?? "Prøv igen.")
            : "Alle variable er korrekte."
        }
        counter={{ current: correctCount, total: totalFields, label: "Korrekte variable" }}
        attemptsLeft={hasAnyError && !phase1.isAttemptsExhausted ? phase1.attemptsLeft : undefined}
      />

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
        <div className="mt-2">
          <TjekFeedback
            status={
              phase1.hypothesisChecked
                ? hypHasError ? "wrong" : "correct"
                : null
            }
            message={
              hypHasError
                ? (guide.hypothesisHints?.[phase1.hypAttempts - 1] ?? "Hypotesen mangler centrale begreber — prøv igen.")
                : "Hypotesen indeholder de forventede nøgleord."
            }
            counter={
              totalHypKeywords > 0
                ? { current: matchedHypKeywords, total: totalHypKeywords, label: "Nøgleord fundet" }
                : undefined
            }
            attemptsLeft={hypHasError && !phase1.isHypAttemptsExhausted ? phase1.hypAttemptsLeft : undefined}
          />
        </div>

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
            <ActionButton
              accent={accent}
              dimmed={canAdvanceVars}
              onClick={() => phase1.checkVariables()}
            >
              Tjek variable
            </ActionButton>
          )}
          {mode !== "open" && guide.validateHypothesis && !!guide.hypothesisKeywords?.length && (
            <ActionButton
              accent={accent}
              dimmed={canAdvanceHyp}
              onClick={() => phase1.checkHypothesis()}
            >
              Tjek hypotese
            </ActionButton>
          )}
          <ActionButton accent={accent} dimmed={!canAdvance} onClick={handleNext}>
            Næste fase →
          </ActionButton>
        </div>
      </div>

      <ResetWorkButton onClick={onRequestReset} />
    </div>
  );
}
