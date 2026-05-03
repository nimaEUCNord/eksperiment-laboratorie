"use client";

import { useEffect, useReducer, useState } from "react";
import type { LabConfig, LabGuide } from "@/content/types";
import type { AccentClasses } from "@/lib/accent";
import { useLabGuidePersistence } from "@/hooks/useLabGuidePersistence";
import { reducer, extractPersistedSlice } from "./state/reducer";
import { buildInitialState } from "./state/initialState";
import { PHASES, type Mode, type PhaseProps, type RealPhase } from "./types";
import { PHASE_REGISTRY } from "./phases";
import PhaseChooser from "./phases/PhaseChooser";
import PhaseProgressBar from "./phases/PhaseProgressBar";
import ResetWorkModal from "./components/ResetWorkModal";

const styles = `
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
`;

interface LabTemplateProps {
  lab: LabConfig;
  guide: LabGuide;
  accent: AccentClasses;
}

export default function LabTemplate({ lab, guide, accent }: LabTemplateProps) {
  const persistence = useLabGuidePersistence(lab.slug);
  const [hasRestored, setHasRestored] = useState(false);
  const [state, dispatch] = useReducer(reducer, guide, buildInitialState);

  // Restore on mount
  useEffect(() => {
    if (hasRestored) return;
    const restored = persistence.restoreState();
    if (restored) {
      dispatch({ type: "restore", payload: restored });
      dispatch({ type: "setPhase", phase: "plan" });
      dispatch({ type: "setShowRestoreNotification", value: true });
    }
    setHasRestored(true);
  }, [hasRestored, persistence]);

  // Save on every change (after initial restore, never while at chooser)
  useEffect(() => {
    if (!hasRestored || state.phase === "choose") return;
    persistence.saveState(extractPersistedSlice(state));
  }, [hasRestored, state, persistence]);

  const goToPhase = (phase: RealPhase) => dispatch({ type: "setPhase", phase });

  const isPhaseCompleted = (phase: RealPhase): boolean => {
    switch (phase) {
      case "plan":
        if (!state.hypothesis.trim()) return false;
        if (!guide.validateVariableInputs) return true;
        if (!guide.blockOnWrongVariableInputs) return true;
        return (
          Object.keys(state.validationErrors).length === 0 ||
          !Object.values(state.validationErrors).some((e) =>
            Object.values(e).some((v) => v),
          )
        );
      case "setup": {
        if (guide.requireAllMaterialsChecked) {
          const allMaterialsChecked =
            state.materialsChecked.length > 0 &&
            state.materialsChecked.every((c) => c);
          const allSetupChecked = state.setupChecked.every((c) => c);
          return allMaterialsChecked && allSetupChecked;
        }
        return (
          state.materialsChecked.some((c) => c) ||
          state.setupChecked.some((c) => c)
        );
      }
      case "measure": {
        const filledRows = state.rows.filter((row) =>
          Object.values(row).every((v) => v.trim() !== ""),
        );
        const constantsFilled = Object.values(state.constants).every(
          (c) => c.trim() !== "",
        );
        const minMeasurements = guide.minMeasurements || 4;
        return (
          filledRows.length >= minMeasurements &&
          (guide.blockOnMissingConstants !== false ? constantsFilled : true)
        );
      }
      case "analyse":
        return state.studentValue.trim() !== "";
      case "conclude":
      default:
        return false;
    }
  };

  const handleClearWork = () => {
    persistence.clearState();
    dispatch({ type: "reset", guide });
    dispatch({ type: "setPhase", phase: "plan" });
    dispatch({ type: "setShowClearConfirm", value: false });
  };

  if (state.phase === "choose") {
    return (
      <PhaseChooser
        accent={accent}
        onChoose={(mode: Mode) => {
          dispatch({ type: "setMode", mode });
          dispatch({ type: "setPhase", phase: "plan" });
        }}
      />
    );
  }

  const currentIndex = PHASES.findIndex((p) => p.id === state.phase);
  const advanceTarget = PHASES[currentIndex + 1]?.id;
  const retreatTarget = PHASES[currentIndex - 1]?.id;

  const PhaseComponent = PHASE_REGISTRY[state.phase];

  const phaseProps: PhaseProps = {
    state,
    dispatch,
    lab,
    guide,
    accent,
    onAdvance: () => {
      if (advanceTarget) goToPhase(advanceTarget);
    },
    onRetreat: () => {
      if (retreatTarget) goToPhase(retreatTarget);
    },
    onRequestReset: () => dispatch({ type: "setShowClearConfirm", value: true }),
  };

  return (
    <div>
      <style>{styles}</style>
      <h2 className="text-xl font-semibold text-slate-900">Laboratorieguide</h2>

      {state.showRestoreNotification && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800 flex items-center justify-between">
          <span>✓ Dit tidligere arbejde er gendannet</span>
          <button
            onClick={() =>
              dispatch({ type: "setShowRestoreNotification", value: false })
            }
            className="text-green-600 hover:text-green-700"
          >
            ✕
          </button>
        </div>
      )}

      <PhaseProgressBar
        accent={accent}
        currentPhase={state.phase}
        isPhaseCompleted={isPhaseCompleted}
        onSelectPhase={goToPhase}
      />

      <PhaseComponent {...phaseProps} />

      <ResetWorkModal
        open={state.showClearConfirm}
        onCancel={() => dispatch({ type: "setShowClearConfirm", value: false })}
        onConfirm={handleClearWork}
      />
    </div>
  );
}
