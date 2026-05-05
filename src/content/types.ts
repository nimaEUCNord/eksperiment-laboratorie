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
  hypothesisKeywords?: string[];
  hypothesisHints?: string[];
  validateHypothesis?: boolean;
  blockOnWrongHypothesis?: boolean;
  variables?: Variable[];
  validateVariableInputs?: boolean;
  blockOnWrongVariableInputs?: boolean;
  variableHints?: string[];

  // Phase 2 — Opstil
  materials?: string[];
  materialImages?: Record<string, StaticImageData>;
  setupItems?: string[];

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

// Fields shared by every lab variant. Background sections (goal/keyConcepts/
// keyEquation/theory) are optional on every kind; missing goal+keyConcepts
// triggers the "Under udarbejdelse" placeholder regardless of kind.
type LabBase = {
  slug: string;
  title: string;
  shortDescription: string;
  goal?: string;
  keyConcepts?: string[];
  keyEquation?: string;
  theory?: string[];
};

export type StubLab = LabBase & { kind: "stub" };

export type SimulationLab = LabBase & {
  kind: "simulation";
  simulationId: string;
};

export type ObservationsLab = LabBase & {
  kind: "observations";
  observations: string[];
};

export type GuidedLab = LabBase & {
  kind: "guided";
  guide: LabGuide;
  simulationId?: string;
};

export type LabConfig = StubLab | SimulationLab | ObservationsLab | GuidedLab;

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
