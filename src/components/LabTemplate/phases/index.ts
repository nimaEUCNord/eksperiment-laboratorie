import type { ComponentType } from "react";
import type { PhaseProps, RealPhase } from "../types";
import Phase1Plan from "./Phase1Plan";
import Phase2Setup from "./Phase2Setup";
import Phase3Measure from "./Phase3Measure";
import Phase4Analyse from "./Phase4Analyse";
import Phase5Conclude from "./Phase5Conclude";

export const PHASE_REGISTRY: Record<RealPhase, ComponentType<PhaseProps>> = {
  plan: Phase1Plan,
  setup: Phase2Setup,
  measure: Phase3Measure,
  analyse: Phase4Analyse,
  conclude: Phase5Conclude,
};
