import type { Dispatch } from "react";
import type { LabGuide, Variable } from "@/content/types";
import type { Action, GuideState } from "../state/reducer";
import type { ValidationErrors, VarField } from "../types";

function checkAnswer(
  studentAnswer: string,
  expectedValue: string | string[] | undefined,
  isCaseSensitive: boolean,
): boolean {
  if (!expectedValue || studentAnswer.trim() === "") return false;
  const normalize = isCaseSensitive ? (s: string) => s : (s: string) => s.toLowerCase();
  const studentNorm = normalize(studentAnswer.trim());
  if (Array.isArray(expectedValue)) {
    return expectedValue.some((exp) => normalize(exp) === studentNorm);
  }
  return normalize(expectedValue) === studentNorm;
}

function isFieldError(value: string, field: VarField, variable: Variable): boolean {
  switch (field) {
    case "fysiskStorrelse":
      return !checkAnswer(value, variable.expectedPhysicalQuantity, false);
    case "symbol":
      return !checkAnswer(value, variable.expectedSymbol, true);
    case "enhed":
      return !checkAnswer(value, variable.expectedUnit, true);
  }
}

export function usePhase1State(
  state: GuideState,
  dispatch: Dispatch<Action>,
  guide: LabGuide,
) {
  const setHypothesis = (value: string) => dispatch({ type: "setHypothesis", value });

  const setVariableField = (variable: string, field: VarField, value: string) =>
    dispatch({ type: "setVariableField", variable, field, value });

  const validateField = (variableName: string, field: VarField) => {
    if (!guide.validateVariableInputs || !guide.variables) return;
    const variable = guide.variables.find((v) => v.name === variableName);
    if (!variable) return;
    const input = state.varInputs[variableName] || {
      fysiskStorrelse: "",
      symbol: "",
      enhed: "",
    };
    const value = input[field];

    if (value.trim() === "") {
      dispatch({ type: "clearFieldValidated", variable: variableName, field });
      return;
    }

    const isError = isFieldError(value, field, variable);
    dispatch({ type: "setFieldValidation", variable: variableName, field, isError });
    dispatch({ type: "markFieldValidated", variable: variableName, field });
  };

  const validateAll = (): boolean => {
    if (!guide.validateVariableInputs || !guide.variables) return true;
    const errors: ValidationErrors = {};
    let hasErrors = false;
    guide.variables.forEach((variable) => {
      const input = state.varInputs[variable.name] || {
        fysiskStorrelse: "",
        symbol: "",
        enhed: "",
      };
      const varErrors: Record<string, boolean> = {
        fysiskStorrelse: !checkAnswer(input.fysiskStorrelse, variable.expectedPhysicalQuantity, false),
        symbol: !checkAnswer(input.symbol, variable.expectedSymbol, true),
        enhed: !checkAnswer(input.enhed, variable.expectedUnit, true),
      };
      errors[variable.name] = varErrors;
      if (Object.values(varErrors).some((err) => err)) hasErrors = true;
    });
    const allValidated: Record<string, Set<VarField>> = {};
    guide.variables.forEach((variable) => {
      allValidated[variable.name] = new Set<VarField>(["fysiskStorrelse", "symbol", "enhed"]);
    });
    dispatch({ type: "validateAll", errors, validated: allValidated });
    return !hasErrors;
  };

  const checkConditions = (): boolean => {
    if (!state.hypothesis.trim()) return false;
    if (!guide.validateVariableInputs) return true;
    if (!guide.blockOnWrongVariableInputs) return true;
    return (
      Object.keys(state.validationErrors).length === 0 ||
      !Object.values(state.validationErrors).some((e) =>
        Object.values(e).some((v) => v),
      )
    );
  };

  const isAdvanceBlockedByValidation = (): boolean => {
    if (guide.bypassLocks) return false;
    if (!guide.validateVariableInputs) return false;
    if (!guide.blockOnWrongVariableInputs) return false;
    return (
      Object.keys(state.validationErrors).length > 0 &&
      Object.values(state.validationErrors).some((e) =>
        Object.values(e).some((v) => v),
      )
    );
  };

  return {
    hypothesis: state.hypothesis,
    varInputs: state.varInputs,
    validationErrors: state.validationErrors,
    validatedFields: state.validatedFields,
    mode: state.mode,
    setHypothesis,
    setVariableField,
    validateField,
    validateAll,
    checkConditions,
    isAdvanceBlockedByValidation,
  };
}
