import type { Dispatch } from "react";
import type { LabConfig, LabGuide, PhaseId } from "@/content/types";
import type { AccentClasses } from "@/lib/accent";
import type { Action, GuideState } from "./state/reducer";

export type Mode = "guidet" | "semi" | "open";

export type RealPhase = "plan" | "setup" | "measure" | "analyse" | "conclude";
export type Phase = "choose" | RealPhase;

export type Row = Record<string, string>;

export type VariableInput = {
  fysiskStorrelse: string;
  symbol: string;
  enhed: string;
};

export type VarField = "fysiskStorrelse" | "symbol" | "enhed";

export type ValidationErrors = Record<string, Record<string, boolean>>;

export const PHASES: ReadonlyArray<{
  id: RealPhase;
  stepLabel: string;
  simPhaseId?: PhaseId;
}> = [
  { id: "plan", stepLabel: "Planlæg", simPhaseId: undefined },
  { id: "setup", stepLabel: "Opstil", simPhaseId: "opstil" },
  { id: "measure", stepLabel: "Mål", simPhaseId: "maal" },
  { id: "analyse", stepLabel: "Analysér", simPhaseId: "analyser" },
  { id: "conclude", stepLabel: "Konkludér", simPhaseId: undefined },
];

export interface PhaseProps {
  state: GuideState;
  dispatch: Dispatch<Action>;
  lab: LabConfig;
  guide: LabGuide;
  accent: AccentClasses;
  onAdvance: () => void;
  onRetreat: () => void;
  onRequestReset: () => void;
}

export const DEFAULT_SETUP_ITEMS = [
  "Jeg har fundet alle materialer frem",
  "Jeg har opstillet mit forsøg, som vist på skitsen",
  "Jeg har sikret mig, at udstyret virker",
  "Jeg ved, hvordan jeg måler de variable jeg har planlagt",
  "Jeg har taget et billede af forsøgsopstillingen",
];
