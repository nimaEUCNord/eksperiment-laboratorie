import type { StaticImageData } from "next/image";

export type Variable = {
  name: string;
  type: "independent" | "dependent" | "control" | "derived";
  unit?: string;
  description?: string;
  expectedPhysicalQuantity?: string | string[];
  expectedSymbol?: string | string[];
  expectedUnit?: string | string[];
};

export type PhaseId = "opstil" | "maal" | "analyser";

export type ChartFitMode = "through-origin" | "free" | "none";

export type ChartConfig = {
  xField: string;
  yField: string;
  xLabel: string;
  yLabel: string;
  xScale?: number;
  yScale?: number;
  fitMode: ChartFitMode;
  slopeSymbol?: string;
  slopeUnit?: string;
  minPoints?: number;
};

export type LabGuide = {
  // Phase 1 — Planlæg
  hypothesis?: string;
  hypothesisPlaceholder?: string;
  variables?: Variable[];
  validateVariableInputs?: boolean;
  blockOnWrongVariableInputs?: boolean;

  // Phase 2 — Opstil
  materials?: string[];
  materialImages?: Record<string, StaticImageData>;
  setupItems?: string[];
  requireAllMaterialsChecked?: boolean;

  // Phase 3 — Mål
  minMeasurements?: number;
  suggestedMeasurements?: number;
  dataCollectionGuidance?: string;
  blockOnMissingConstants?: boolean;

  // Phase 4 — Analysér
  chart?: ChartConfig;
  theoreticalValue?: number;
  theoreticalValueUnit?: string;
  deviationThreshold?: number;

  // Phase 5 — Konkludér
  reflectionQuestions?: string[];
  facit?: string;

  // Cross-cutting
  embedSimulationInPhases?: PhaseId[];
  bypassLocks?: boolean;
};

export type LabConfig = {
  slug: string;
  title: string;
  shortDescription: string;
  goal?: string;
  keyConcepts?: string[];
  keyEquation?: string;
  theory?: string[];
  observations?: string[];
  simulationId?: string;
  guide?: LabGuide;
};

export type AccentColor =
  | "sky"
  | "amber"
  | "emerald"
  | "rose"
  | "violet"
  | "orange";

export type Topic = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  accentColor: AccentColor;
  labs: LabConfig[];
};
