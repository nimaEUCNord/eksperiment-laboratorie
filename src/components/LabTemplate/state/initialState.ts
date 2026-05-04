import type { LabGuide } from "@/content/types";
import type { GuideState, PersistedSlice } from "./reducer";
import { DEFAULT_SETUP_ITEMS } from "../types";

export function createEmptyMeasurementRow(guide: LabGuide): Record<string, string> {
  const measVars =
    guide.variables?.filter(
      (v) => v.type === "independent" || v.type === "dependent",
    ) || [];
  return measVars.reduce<Record<string, string>>(
    (acc, v) => ({ ...acc, [v.name]: "" }),
    {},
  );
}

export function createEmptyConstants(guide: LabGuide): Record<string, string> {
  const controlVars = guide.variables?.filter((v) => v.type === "control") || [];
  return controlVars.reduce<Record<string, string>>(
    (acc, v) => ({ ...acc, [v.name]: "" }),
    {},
  );
}

export function createEmptyMeasurementRows(guide: LabGuide): Record<string, string>[] {
  return Array.from(
    { length: guide.suggestedMeasurements || 6 },
    () => createEmptyMeasurementRow(guide),
  );
}

export function buildInitialPersistedSlice(guide: LabGuide): PersistedSlice {
  const setupItems = guide.setupItems ?? DEFAULT_SETUP_ITEMS;
  return {
    hypothesis: "",
    varInputs: {},
    validationErrors: {},
    validatedFields: {},
    varAttempts: 0,
    materialsChecked: Array.from(
      { length: guide.materials?.length || 0 },
      () => false,
    ),
    setupChecked: Array.from({ length: setupItems.length }, () => false),
    rows: createEmptyMeasurementRows(guide),
    constants: createEmptyConstants(guide),
    studentValue: "",
    reflections: Array.from(
      { length: guide.reflectionQuestions?.length || 0 },
      () => "",
    ),
    mode: null,
  };
}

export function buildInitialState(guide: LabGuide): GuideState {
  return {
    ...buildInitialPersistedSlice(guide),
    phase: "choose",
    hoveredMaterialIdx: null,
    openHints: new Set<string>(),
    showFacit: false,
    showRestoreNotification: false,
    showClearConfirm: false,
  };
}
