import MeasurementChart from "@/components/MeasurementChart";
import type { PhaseProps } from "../types";
import { usePhase4State } from "../hooks/usePhase4State";
import EmbeddedSim from "../components/EmbeddedSim";
import PhaseNav from "../components/PhaseNav";
import ResetWorkButton from "../components/ResetWorkButton";
import PhaseIntroBox from "../components/PhaseIntroBox";
import { DEFAULT_PHASE_INTROS } from "../constants/defaultPhaseIntros";

export default function Phase4Analyse({
  state,
  dispatch,
  lab,
  guide,
  accent,
  simKey,
  onAdvance,
  onRetreat,
  onRequestReset,
}: PhaseProps) {
  const phase4 = usePhase4State(state, dispatch, guide);
  const mode = phase4.mode;

  return (
    <div className="mt-8 space-y-6">
      {mode === "guidet" && (
        <PhaseIntroBox accent={accent} content={guide.phase4Intro ?? DEFAULT_PHASE_INTROS[4]} />
      )}

      <EmbeddedSim
        phaseId="analyser"
        simulationId={lab.simulationId}
        embedIn={guide.embedSimulationInPhases ?? []}
        simKey={simKey}
      />

      {guide.chart && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4">
            <label className="flex-1 min-w-[160px]">
              <span className="block text-xs font-medium text-slate-600 mb-1">X-akse</span>
              <select
                value={phase4.chartXAxis}
                onChange={(e) => phase4.setChartXAxis(e.target.value || undefined)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">Vælg variabel</option>
                {phase4.axisOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1 min-w-[160px]">
              <span className="block text-xs font-medium text-slate-600 mb-1">Y-akse</span>
              <select
                value={phase4.chartYAxis}
                onChange={(e) => phase4.setChartYAxis(e.target.value || undefined)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">Vælg variabel</option>
                {phase4.axisOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-700">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={phase4.showFit}
                onChange={(e) => phase4.setShowFit(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Vis lineær regression
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={phase4.showR2}
                onChange={(e) => phase4.setShowR2(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Vis R²-værdi
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={phase4.forceThroughOrigin}
                onChange={(e) => phase4.setForceThroughOrigin(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Tving gennem nul
            </label>
          </div>
          <MeasurementChart
            rows={phase4.rows}
            chart={phase4.effectiveChart}
            showFit={phase4.showFit}
            showR2={phase4.showR2}
            xAxisInput={phase4.xAxisInput}
            yAxisInput={phase4.yAxisInput}
          />
        </div>
      )}

      <div className="space-y-4">
        {phase4.theoretical !== undefined && (
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Teoretisk værdi: {phase4.theoretical}
              {phase4.unit ? ` ${phase4.unit}` : ""}
            </label>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700">Din målt værdi:</label>
          <input
            type="number"
            value={phase4.studentValue}
            onChange={(e) => phase4.setStudentValue(e.target.value)}
            placeholder="Indtast din beregnede værdi"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {phase4.theoretical !== undefined &&
          phase4.studentValue &&
          Number.isFinite(phase4.studentNum) && (
            <div className={`rounded-xl border-2 ${accent.border} ${accent.bgSoft} p-4`}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-slate-500">Din målte værdi</div>
                  <div className={`mt-1 font-mono text-lg font-semibold ${accent.text}`}>
                    {phase4.studentNum.toFixed(2)}
                    {phase4.unit ? ` ${phase4.unit}` : ""}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Teoretisk</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-slate-700">
                    {phase4.theoretical.toFixed(2)}
                    {phase4.unit ? ` ${phase4.unit}` : ""}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Afvigelse</div>
                  <div
                    className={`mt-1 font-mono text-lg font-semibold ${
                      phase4.percentDiff !== null && phase4.percentDiff < phase4.threshold
                        ? "text-emerald-600"
                        : phase4.percentDiff !== null && phase4.percentDiff < phase4.threshold * 2
                          ? "text-amber-600"
                          : "text-rose-600"
                    }`}
                  >
                    {phase4.percentDiff !== null ? `${phase4.percentDiff.toFixed(1)} %` : "–"}
                  </div>
                </div>
              </div>
              {phase4.showFit && phase4.fit && (
                <p className="mt-3 text-center text-xs text-slate-500">
                  Hældning fra bedste rette linje: <strong>{phase4.fit.slope.toFixed(3)}</strong>
                  {phase4.fit.intercept !== 0 && ` · skæring: ${phase4.fit.intercept.toFixed(3)}`}
                </p>
              )}
            </div>
          )}
      </div>

      <PhaseNav accent={accent} onPrev={onRetreat} onNext={onAdvance} />

      <ResetWorkButton onClick={onRequestReset} />
    </div>
  );
}
