import { useMemo, type Dispatch } from "react";
import type { ChartConfig, LabGuide, Variable } from "@/content/types";
import type { Action, GuideState } from "../state/reducer";
import { fitFromRows } from "@/components/MeasurementChart";

type StudentVarInput = { fysiskStorrelse: string; symbol: string; enhed: string };

function defaultLabel(variable: Variable): string {
  return variable.unit ? `${variable.name} (${variable.unit})` : variable.name;
}

function studentLabel(input: StudentVarInput | undefined): string | null {
  if (!input) return null;
  const fs = input.fysiskStorrelse?.trim() ?? "";
  const sym = input.symbol?.trim() ?? "";
  const unit = input.enhed?.trim() ?? "";
  if (!fs && !sym && !unit) return null;
  const left = [fs, sym].filter(Boolean).join(" ");
  return unit ? `${left} (${unit})` : left;
}

function resolveAxisLabel(
  field: string,
  matchesBase: boolean,
  baseLabel: string,
  variable: Variable | undefined,
  studentInput: StudentVarInput | undefined,
): string {
  const fromStudent = studentLabel(studentInput);
  if (fromStudent) return fromStudent;
  if (matchesBase) return baseLabel;
  if (variable) return defaultLabel(variable);
  return field;
}

function buildEffectiveChart(
  base: ChartConfig,
  xField: string,
  yField: string,
  measurementVars: Variable[],
  varInputs: Record<string, StudentVarInput>,
  forceThroughOrigin: boolean,
): ChartConfig {
  const xVar = measurementVars.find((v) => v.name === xField);
  const yVar = measurementVars.find((v) => v.name === yField);

  const xMatchesBaseX = xField === base.xField;
  const yMatchesBaseY = yField === base.yField;
  const isExactDefaultPair = xMatchesBaseX && yMatchesBaseY;

  return {
    xField,
    yField,
    xLabel: resolveAxisLabel(xField, xMatchesBaseX, base.xLabel, xVar, varInputs[xField]),
    yLabel: resolveAxisLabel(yField, yMatchesBaseY, base.yLabel, yVar, varInputs[yField]),
    xScale: xMatchesBaseX ? base.xScale : 1,
    yScale: yMatchesBaseY ? base.yScale : 1,
    fitMode: forceThroughOrigin ? "through-origin" : "free",
    slopeSymbol: isExactDefaultPair ? base.slopeSymbol : undefined,
    slopeUnit: isExactDefaultPair ? base.slopeUnit : undefined,
    minPoints: base.minPoints,
  };
}

export function usePhase4State(
  state: GuideState,
  dispatch: Dispatch<Action>,
  guide: LabGuide,
) {
  const setStudentValue = (value: string) => dispatch({ type: "setStudentValue", value });
  const setChartXAxis = (field: string | undefined) =>
    dispatch({ type: "setChartXAxis", field });
  const setChartYAxis = (field: string | undefined) =>
    dispatch({ type: "setChartYAxis", field });
  const setShowFit = (value: boolean) => dispatch({ type: "setShowFit", value });
  const setShowR2 = (value: boolean) => dispatch({ type: "setShowR2", value });
  const setForceThroughOrigin = (value: boolean) =>
    dispatch({ type: "setForceThroughOrigin", value });

  const measurementVars = useMemo(
    () =>
      (guide.variables ?? []).filter(
        (v) => v.type === "independent" || v.type === "dependent",
      ),
    [guide.variables],
  );

  const axisOptions = useMemo(
    () =>
      measurementVars.map((v) => {
        const studentName = state.varInputs[v.name]?.fysiskStorrelse?.trim();
        return { value: v.name, label: studentName || v.name };
      }),
    [measurementVars, state.varInputs],
  );

  const axisOptionValues = useMemo(
    () => axisOptions.map((o) => o.value),
    [axisOptions],
  );

  const showFit = state.showFit ?? false;
  const showR2 = state.showR2 ?? false;
  const forceThroughOrigin = state.forceThroughOrigin ?? false;

  const effectiveChart = useMemo<ChartConfig | null>(() => {
    if (!guide.chart) return null;
    const xField = state.chartXAxis;
    const yField = state.chartYAxis;
    if (!xField || !yField) return null;
    if (!axisOptionValues.includes(xField) || !axisOptionValues.includes(yField)) return null;
    return buildEffectiveChart(
      guide.chart,
      xField,
      yField,
      measurementVars,
      state.varInputs,
      forceThroughOrigin,
    );
  }, [
    guide.chart,
    state.chartXAxis,
    state.chartYAxis,
    axisOptionValues,
    measurementVars,
    state.varInputs,
    forceThroughOrigin,
  ]);

  const fit = useMemo(
    () => (effectiveChart ? fitFromRows(state.rows, effectiveChart) : null),
    [state.rows, effectiveChart],
  );

  const xAxisInput = effectiveChart
    ? state.varInputs[effectiveChart.xField]
    : undefined;
  const yAxisInput = effectiveChart
    ? state.varInputs[effectiveChart.yField]
    : undefined;

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
    effectiveChart,
    axisOptions,
    chartXAxis: state.chartXAxis ?? "",
    chartYAxis: state.chartYAxis ?? "",
    setChartXAxis,
    setChartYAxis,
    showFit,
    showR2,
    forceThroughOrigin,
    setShowFit,
    setShowR2,
    setForceThroughOrigin,
    xAxisInput,
    yAxisInput,
  };
}
