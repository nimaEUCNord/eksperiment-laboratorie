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
