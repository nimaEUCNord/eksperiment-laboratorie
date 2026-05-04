import { useMemo, type Dispatch } from "react";
import type { ChartConfig, LabGuide, Variable } from "@/content/types";
import type { Action, GuideState } from "../state/reducer";
import { fitFromRows } from "@/components/MeasurementChart";

function defaultLabel(variable: Variable): string {
  return variable.unit ? `${variable.name} (${variable.unit})` : variable.name;
}

function buildEffectiveChart(
  base: ChartConfig,
  xField: string,
  yField: string,
  measurementVars: Variable[],
): ChartConfig {
  const xVar = measurementVars.find((v) => v.name === xField);
  const yVar = measurementVars.find((v) => v.name === yField);

  const xMatchesBaseX = xField === base.xField;
  const yMatchesBaseY = yField === base.yField;
  const isExactDefaultPair = xMatchesBaseX && yMatchesBaseY;

  return {
    xField,
    yField,
    xLabel: xMatchesBaseX
      ? base.xLabel
      : xVar
        ? defaultLabel(xVar)
        : xField,
    yLabel: yMatchesBaseY
      ? base.yLabel
      : yVar
        ? defaultLabel(yVar)
        : yField,
    xScale: xMatchesBaseX ? base.xScale : 1,
    yScale: yMatchesBaseY ? base.yScale : 1,
    fitMode: base.fitMode,
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
  const setChartXAxis = (field: string) => dispatch({ type: "setChartXAxis", field });
  const setChartYAxis = (field: string) => dispatch({ type: "setChartYAxis", field });

  const measurementVars = useMemo(
    () =>
      (guide.variables ?? []).filter(
        (v) => v.type === "independent" || v.type === "dependent",
      ),
    [guide.variables],
  );

  const axisOptions = useMemo(
    () => measurementVars.map((v) => v.name),
    [measurementVars],
  );

  const effectiveChart = useMemo<ChartConfig | null>(() => {
    if (!guide.chart) return null;
    const xField =
      state.chartXAxis && axisOptions.includes(state.chartXAxis)
        ? state.chartXAxis
        : guide.chart.xField;
    const yField =
      state.chartYAxis && axisOptions.includes(state.chartYAxis)
        ? state.chartYAxis
        : guide.chart.yField;
    return buildEffectiveChart(guide.chart, xField, yField, measurementVars);
  }, [guide.chart, state.chartXAxis, state.chartYAxis, axisOptions, measurementVars]);

  const fit = useMemo(
    () => (effectiveChart ? fitFromRows(state.rows, effectiveChart) : null),
    [state.rows, effectiveChart],
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
    effectiveChart,
    axisOptions,
    chartXAxis: effectiveChart?.xField ?? "",
    chartYAxis: effectiveChart?.yField ?? "",
    setChartXAxis,
    setChartYAxis,
  };
}
