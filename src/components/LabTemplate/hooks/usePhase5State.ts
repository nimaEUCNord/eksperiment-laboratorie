import type { Dispatch } from "react";
import type { Action, GuideState } from "../state/reducer";

export function usePhase5State(state: GuideState, dispatch: Dispatch<Action>) {
  const updateReflection = (index: number, value: string) =>
    dispatch({ type: "updateReflection", index, value });

  const setShowFacit = (value: boolean) => dispatch({ type: "setShowFacit", value });

  return {
    mode: state.mode,
    reflections: state.reflections,
    showFacit: state.showFacit,
    updateReflection,
    setShowFacit,
  };
}
