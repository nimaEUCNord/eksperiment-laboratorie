export type Variable = {
  name: string;
  type: "independent" | "dependent" | "control" | "derived";
  unit?: string;
  description?: string;
  expectedPhysicalQuantity?: string;
  expectedSymbol?: string | string[];
  expectedUnit?: string | string[];
};

export type MeasurementField = {
  label: string;
  unit: string;
  autoCalculate: boolean;
  formula?: string;
};

export type LabGuideConfig = {
  type: "generic" | "custom";
  hypothesis?: string;
  hypothesisPlaceholder?: string;
  variables?: Variable[];
  measurementFields?: MeasurementField[];
  theoreticalValue?: number;
  deviationThreshold?: number;
  reflectionQuestions?: string[];
  facit?: string;
  validateVariableInputs?: boolean;
  blockOnWrongVariableInputs?: boolean;
};

export type Lab = {
  slug: string;
  title: string;
  shortDescription: string;
  goal?: string;
  keyConcepts?: string[];
  keyEquation?: string;
  theory?: string[];
  observations?: string[];
  simulationId?: string;
  inquiry?: boolean;
  labGuide?: boolean;
  labGuideConfig?: LabGuideConfig;
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
  labs: Lab[];
};
