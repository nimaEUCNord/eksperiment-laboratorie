import { useEffect, useRef } from "react";
import Image from "next/image";
import HintBox from "@/components/HintBox";
import type { PhaseProps, RealPhase } from "../types";
import { usePhase2State } from "../hooks/usePhase2State";
import EmbeddedSim from "../components/EmbeddedSim";
import PhaseNav from "../components/PhaseNav";
import ResetWorkButton from "../components/ResetWorkButton";

export default function Phase2Setup({
  state,
  dispatch,
  lab,
  guide,
  accent,
  simKey,
  onAdvance,
  onRetreat,
  onRequestReset,
  onRegisterAdvanceHandler,
}: PhaseProps) {
  const phase2 = usePhase2State(state, dispatch, guide);
  const mode = phase2.mode;

  const advanceHandlerRef = useRef<((t?: RealPhase) => void) | null>(null);
  advanceHandlerRef.current = (targetPhase?: RealPhase) => {
    if (!guide.bypassLocks && !phase2.checkConditions()) return;
    onAdvance(targetPhase);
  };

  useEffect(() => {
    onRegisterAdvanceHandler((t) => advanceHandlerRef.current?.(t));
    return () => onRegisterAdvanceHandler(null);
  }, [onRegisterAdvanceHandler]);

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Fase 2 — Opstil</h3>

      {mode === "guidet" && (
        <div className={`rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700`}>
          <p className="font-medium text-slate-800">Forberedelsestrin:</p>
          <ol className="mt-3 list-decimal list-inside space-y-2 text-slate-600">
            <li>Saml dine materialer og tjek, at alt er klar.</li>
            <li>Gør dig selv bekendt med måleudstyr og målemetoder.</li>
            <li>Planlæg hvordan du registrerer data systematisk.</li>
          </ol>
        </div>
      )}

      {mode === "semi" && (
        <div className="mt-3 space-y-2 text-sm text-slate-600">
          <p>Forbered dit forsøgsudstyr og sørg for at det virker.</p>
          <HintBox
            id="p2-h1"
            label="Hvad skal jeg checke?"
            content="Tjek at all equipment virker. Verificer at måleudstyr er kalibreret. Planlæg din dataindsamling systematisk."
            openHints={phase2.openHints}
            toggle={phase2.toggleHint}
          />
        </div>
      )}

      <EmbeddedSim
        phaseId="opstil"
        simulationId={lab.simulationId}
        embedIn={guide.embedSimulationInPhases ?? []}
        simKey={simKey}
      />

      {guide.materials && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Materialer:</p>
          <div className="flex gap-6">
            <div className="flex-1">
              <ul className="space-y-2 text-sm text-slate-600">
                {guide.materials.map((material, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3"
                    onMouseEnter={() => phase2.setHoveredMaterial(i)}
                    onMouseLeave={() => phase2.setHoveredMaterial(null)}
                  >
                    <input
                      type="checkbox"
                      id={`material-${i}`}
                      checked={phase2.materialsChecked[i] || false}
                      onChange={() => phase2.toggleMaterial(i)}
                      className="mt-0.5 h-4 w-4 rounded-lg"
                    />
                    <label
                      htmlFor={`material-${i}`}
                      className="cursor-pointer hover:text-slate-900 transition-colors"
                    >
                      {material}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 h-64 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 flex flex-col items-center justify-center">
              {phase2.hoveredMaterialIdx !== null &&
              guide.materials &&
              guide.materialImages &&
              guide.materials[phase2.hoveredMaterialIdx] &&
              guide.materialImages[guide.materials[phase2.hoveredMaterialIdx]] ? (
                <div className="text-center flex flex-col items-center justify-center flex-1">
                  <Image
                    src={guide.materialImages[guide.materials[phase2.hoveredMaterialIdx]]}
                    alt={guide.materials[phase2.hoveredMaterialIdx]}
                    className="max-h-48 max-w-full object-contain"
                    width={300}
                    height={300}
                    priority
                  />
                  <p className="mt-3 text-xs font-medium text-slate-600">
                    {guide.materials[phase2.hoveredMaterialIdx]}
                  </p>
                </div>
              ) : (
                <p className="text-xs font-medium text-slate-500">Skitse af forsøgsopstilling</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Tjekliste:</p>
        {phase2.setupItems.map((item, i) => (
          <div key={i} className="flex items-center">
            <input
              type="checkbox"
              checked={phase2.setupChecked[i] || false}
              onChange={() => phase2.toggleSetup(i)}
              className="h-4 w-4 rounded-lg"
            />
            <label className="ml-3 text-sm text-slate-700">{item}</label>
          </div>
        ))}
      </div>

      <PhaseNav
        accent={accent}
        onPrev={onRetreat}
        onNext={() => advanceHandlerRef.current?.()}
        nextDisabled={!guide.bypassLocks && !phase2.checkConditions()}
      />

      <ResetWorkButton onClick={onRequestReset} />
    </div>
  );
}
