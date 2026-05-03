import type { PhaseProps } from "../types";
import { usePhase3State } from "../hooks/usePhase3State";
import EmbeddedSim from "../components/EmbeddedSim";
import VariableHeaderCell from "../components/VariableHeaderCell";
import PhaseNav from "../components/PhaseNav";
import ResetWorkButton from "../components/ResetWorkButton";

const handleNumberInputWheel = (e: React.WheelEvent<HTMLInputElement>) => {
  e.currentTarget.blur();
};

export default function Phase3Measure({
  state,
  dispatch,
  lab,
  guide,
  accent,
  onAdvance,
  onRetreat,
  onRequestReset,
}: PhaseProps) {
  const phase3 = usePhase3State(state, dispatch, guide);
  const mode = phase3.mode;

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Fase 3 — Mål</h3>

      {mode === "guidet" && (
        <div className={`rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700`}>
          <p className="font-medium text-slate-800">Dataindsamling:</p>
          <p className="mt-2 text-slate-600">
            {guide.dataCollectionGuidance ||
              `Indsaml mindst ${phase3.minMeasurements}${
                phase3.suggestedMeasurements ? `-${phase3.suggestedMeasurements}` : ""
              } målinger. Hvis et felt kan beregnes automatisk, udfyldes det af sig selv.`}
          </p>
        </div>
      )}

      <EmbeddedSim
        phaseId="maal"
        simulationId={lab.simulationId}
        embedIn={guide.embedSimulationInPhases ?? []}
      />

      {phase3.controlVars.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Konstanter:</p>
          <table className="w-full border-collapse text-sm">
            <tbody>
              {phase3.controlVars.map((variable) => (
                <tr key={variable.name}>
                  <td className="bg-slate-50 border border-slate-200 px-3 py-2 text-slate-700 font-medium">
                    <VariableHeaderCell input={phase3.varInputs[variable.name]} />
                  </td>
                  <td className="border border-slate-200 px-3 py-2">
                    <input
                      type="number"
                      value={phase3.constants[variable.name] || ""}
                      onChange={(e) => phase3.updateConstant(variable.name, e.target.value)}
                      onWheel={handleNumberInputWheel}
                      placeholder="–"
                      className="w-full border-none bg-transparent p-0 text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Målinger:</p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50">
              {phase3.measVars.map((variable) => (
                <th
                  key={variable.name}
                  className="border border-slate-200 px-3 py-2 text-center font-medium text-slate-700"
                >
                  <VariableHeaderCell input={phase3.varInputs[variable.name]} />
                </th>
              ))}
              <th className="border border-slate-200 px-3 py-2 text-center font-medium text-slate-700 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {phase3.rows.map((row, i) => (
              <tr key={i}>
                {phase3.measVars.map((variable) => (
                  <td key={variable.name} className="border border-slate-200 px-3 py-2">
                    <input
                      type="number"
                      value={row[variable.name] || ""}
                      onChange={(e) => phase3.updateRow(i, variable.name, e.target.value)}
                      onWheel={handleNumberInputWheel}
                      placeholder="–"
                      className="w-full border-none bg-transparent p-0 text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </td>
                ))}
                <td className="border border-slate-200 px-3 py-2 text-center">
                  <button
                    onClick={() => phase3.removeRow(i)}
                    className="text-slate-400 hover:text-red-500 transition-colors text-sm"
                    title="Fjern måling"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={phase3.addRow}
        className="mt-2 text-sm text-slate-500 hover:text-slate-700 underline"
      >
        + Tilføj måling
      </button>

      <div className="text-sm text-slate-600">
        <p>
          Gyldige målinger: <strong>{phase3.validRows.length}</strong> /{" "}
          {phase3.suggestedMeasurements || phase3.rows.length}
        </p>
        {!guide.bypassLocks && !phase3.canProceedToPhase4 && (
          <div className="mt-1 space-y-1 text-amber-600">
            {phase3.validRows.length < phase3.minMeasurements && (
              <p>Indsaml mindst {phase3.minMeasurements} gyldige målinger før næste fase.</p>
            )}
            {phase3.controlVars.length > 0 &&
              !phase3.allConstantsFilled &&
              guide.blockOnMissingConstants !== false && (
                <p>Udfyld alle konstanter før næste fase.</p>
              )}
          </div>
        )}
      </div>

      <PhaseNav
        accent={accent}
        onPrev={onRetreat}
        onNext={onAdvance}
        nextDisabled={!phase3.canProceedToPhase4}
      />

      <ResetWorkButton onClick={onRequestReset} />
    </div>
  );
}
