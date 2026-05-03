import { useMemo, type Dispatch } from "react";
import type { LabGuide } from "@/content/types";
import type { Action, GuideState } from "../state/reducer";
import { createEmptyMeasurementRow } from "../state/initialState";

export function usePhase3State(
  state: GuideState,
  dispatch: Dispatch<Action>,
  guide: LabGuide,
) {
  const controlVars = useMemo(
    () => guide.variables?.filter((v) => v.type === "control") || [],
    [guide.variables],
  );

  const measVars = useMemo(
    () =>
      guide.variables?.filter(
        (v) => v.type === "independent" || v.type === "dependent",
      ) || [],
    [guide.variables],
  );

  const allConstantsFilled = useMemo(
    () =>
      controlVars.every((v) => {
        const val = state.constants[v.name];
        return val !== undefined && val !== "";
      }),
    [state.constants, controlVars],
  );

  const validRows = useMemo(
    () =>
      state.rows.filter((row) =>
        measVars.every((v) => {
          const val = parseFloat(row[v.name]);
          return Number.isFinite(val) && val > 0;
        }),
      ),
    [state.rows, measVars],
  );

  const updateRow = (index: number, field: string, value: string) =>
    dispatch({ type: "updateRow", index, field, value });

  const addRow = () =>
    dispatch({ type: "addRow", row: createEmptyMeasurementRow(guide) });

  const removeRow = (index: number) => dispatch({ type: "removeRow", index });

  const updateConstant = (variable: string, value: string) =>
    dispatch({ type: "updateConstant", variable, value });

  const minMeasurements = guide.minMeasurements || 4;

  const canProceedToPhase4 =
    guide.bypassLocks ||
    (validRows.length >= minMeasurements &&
      (guide.blockOnMissingConstants !== false ? allConstantsFilled : true));

  const checkConditions = (): boolean => {
    const filledRows = state.rows.filter((row) =>
      Object.values(row).every((v) => v.trim() !== ""),
    );
    const constantsFilled = Object.values(state.constants).every(
      (c) => c.trim() !== "",
    );
    return (
      filledRows.length >= minMeasurements &&
      (guide.blockOnMissingConstants !== false ? constantsFilled : true)
    );
  };

  return {
    rows: state.rows,
    constants: state.constants,
    varInputs: state.varInputs,
    mode: state.mode,
    controlVars,
    measVars,
    allConstantsFilled,
    validRows,
    canProceedToPhase4,
    minMeasurements,
    suggestedMeasurements: guide.suggestedMeasurements,
    updateRow,
    addRow,
    removeRow,
    updateConstant,
    checkConditions,
  };
}
