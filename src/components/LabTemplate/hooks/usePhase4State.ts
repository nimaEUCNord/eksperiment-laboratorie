import { useMemo, type Dispatch } from "react";
import type { LabGuide } from "@/content/types";
import type { Action, GuideState } from "../state/reducer";
import { fitFromRows } from "@/components/MeasurementChart";

export function usePhase4State(
  state: GuideState,
  dispatch: Dispatch<Action>,
  guide: LabGuide,
) {
  const setStudentValue = (value: string) => dispatch({ type: "setStudentValue", value });

  const fit = useMemo(
    () => (guide.chart ? fitFromRows(state.rows, guide.chart) : null),
    [state.rows, guide.chart],
  );

  const studentNum = parseFloat(state.studentValue);
  const theoretical = guide.theoreticalValue;
  const percentDiff =
    theoretical !== undefined && Number.isFinite(studentNum) && studentNum > 0
      ? Math.abs((studentNum - theoretical) / theoretical) * 100
      : null;
  const threshold = guide.deviationThreshold ?? 10;
  const unit = guide.theoreticalValueUnit ?? "";

  const checkConditions = (): boolean => state.studentValue.trim() !== "";

  return {
    studentValue: state.studentValue,
    rows: state.rows,
    setStudentValue,
    fit,
    studentNum,
    theoretical,
    percentDiff,
    threshold,
    unit,
    checkConditions,
  };
}
