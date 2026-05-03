import type { Dispatch } from "react";
import type { LabGuide } from "@/content/types";
import type { Action, GuideState } from "../state/reducer";
import { DEFAULT_SETUP_ITEMS } from "../types";

export function usePhase2State(
  state: GuideState,
  dispatch: Dispatch<Action>,
  guide: LabGuide,
) {
  const setupItems = guide.setupItems ?? DEFAULT_SETUP_ITEMS;

  const toggleMaterial = (index: number) => dispatch({ type: "toggleMaterial", index });
  const toggleSetup = (index: number) => dispatch({ type: "toggleSetup", index });
  const setHoveredMaterial = (index: number | null) =>
    dispatch({ type: "setHoveredMaterial", index });
  const toggleHint = (id: string) => dispatch({ type: "toggleHint", id });

  const checkConditions = (): boolean => {
    const allMaterialsChecked =
      state.materialsChecked.length > 0 &&
      state.materialsChecked.every((checked) => checked);
    const allSetupChecked =
      state.setupChecked.length > 0 &&
      state.setupChecked.every((checked) => checked);
    return allMaterialsChecked && allSetupChecked;
  };

  return {
    mode: state.mode,
    materialsChecked: state.materialsChecked,
    setupChecked: state.setupChecked,
    hoveredMaterialIdx: state.hoveredMaterialIdx,
    openHints: state.openHints,
    setupItems,
    toggleMaterial,
    toggleSetup,
    setHoveredMaterial,
    toggleHint,
    checkConditions,
  };
}
