import type { LabGuide } from "@/content/types";
import type { PersistedLabGuideState } from "@/hooks/useLabGuidePersistence";
import type { Mode, Phase, Row, VarField, ValidationErrors, VariableInput } from "../types";
import { buildInitialState } from "./initialState";

export type PersistedSlice = Omit<PersistedLabGuideState, "mode"> & {
  mode: Mode | null;
};

export type GuideState = PersistedSlice & {
  phase: Phase;
  hoveredMaterialIdx: number | null;
  openHints: Set<string>;
  showFacit: boolean;
  showRestoreNotification: boolean;
  showClearConfirm: boolean;
};

export type Action =
  | { type: "restore"; payload: Partial<PersistedLabGuideState> }
  | { type: "reset"; guide: LabGuide }
  | { type: "setMode"; mode: Mode | null }
  | { type: "setPhase"; phase: Phase }
  | { type: "setHypothesis"; value: string }
  | { type: "setVariableField"; variable: string; field: VarField; value: string }
  | { type: "setFieldValidation"; variable: string; field: VarField; isError: boolean }
  | { type: "markFieldValidated"; variable: string; field: VarField }
  | { type: "clearFieldValidated"; variable: string; field: VarField }
  | {
      type: "validateAll";
      errors: ValidationErrors;
      validated: Record<string, Set<VarField>>;
    }
  | { type: "clearValidatedFields" }
  | { type: "toggleMaterial"; index: number }
  | { type: "toggleSetup"; index: number }
  | { type: "setHoveredMaterial"; index: number | null }
  | { type: "updateRow"; index: number; field: string; value: string }
  | { type: "addRow"; row: Row }
  | { type: "removeRow"; index: number }
  | { type: "updateConstant"; variable: string; value: string }
  | { type: "setStudentValue"; value: string }
  | { type: "updateReflection"; index: number; value: string }
  | { type: "toggleHint"; id: string }
  | { type: "setShowFacit"; value: boolean }
  | { type: "setShowRestoreNotification"; value: boolean }
  | { type: "setShowClearConfirm"; value: boolean };

const EMPTY_VAR_INPUT: VariableInput = { fysiskStorrelse: "", symbol: "", enhed: "" };

export function reducer(state: GuideState, action: Action): GuideState {
  switch (action.type) {
    case "restore": {
      const p = action.payload;
      return {
        ...state,
        ...(p.hypothesis !== undefined && { hypothesis: p.hypothesis }),
        ...(p.varInputs !== undefined && { varInputs: p.varInputs }),
        ...(p.validationErrors !== undefined && { validationErrors: p.validationErrors }),
        ...(p.validatedFields !== undefined && { validatedFields: p.validatedFields }),
        ...(p.materialsChecked !== undefined && { materialsChecked: p.materialsChecked }),
        ...(p.setupChecked !== undefined && { setupChecked: p.setupChecked }),
        ...(p.rows !== undefined && { rows: p.rows }),
        ...(p.constants !== undefined && { constants: p.constants }),
        ...(p.studentValue !== undefined && { studentValue: p.studentValue }),
        ...(p.reflections !== undefined && { reflections: p.reflections }),
        ...(p.mode !== undefined && { mode: p.mode }),
      };
    }

    case "reset":
      return buildInitialState(action.guide);

    case "setMode":
      return { ...state, mode: action.mode };

    case "setPhase":
      return { ...state, phase: action.phase };

    case "setHypothesis":
      return { ...state, hypothesis: action.value };

    case "setVariableField": {
      const existing = state.varInputs[action.variable] ?? EMPTY_VAR_INPUT;
      return {
        ...state,
        varInputs: {
          ...state.varInputs,
          [action.variable]: { ...existing, [action.field]: action.value },
        },
      };
    }

    case "setFieldValidation": {
      const existing = state.validationErrors[action.variable] ?? {
        fysiskStorrelse: false,
        symbol: false,
        enhed: false,
      };
      return {
        ...state,
        validationErrors: {
          ...state.validationErrors,
          [action.variable]: { ...existing, [action.field]: action.isError },
        },
      };
    }

    case "markFieldValidated": {
      const next = new Set(state.validatedFields[action.variable] ?? []);
      next.add(action.field);
      return {
        ...state,
        validatedFields: { ...state.validatedFields, [action.variable]: next },
      };
    }

    case "clearFieldValidated": {
      const next = new Set(state.validatedFields[action.variable] ?? []);
      next.delete(action.field);
      return {
        ...state,
        validatedFields: { ...state.validatedFields, [action.variable]: next },
      };
    }

    case "validateAll":
      return {
        ...state,
        validationErrors: action.errors,
        validatedFields: action.validated,
      };

    case "clearValidatedFields":
      return { ...state, validatedFields: {} };

    case "toggleMaterial": {
      const updated = [...state.materialsChecked];
      updated[action.index] = !updated[action.index];
      return { ...state, materialsChecked: updated };
    }

    case "toggleSetup":
      return {
        ...state,
        setupChecked: state.setupChecked.map((v, i) =>
          i === action.index ? !v : v,
        ),
      };

    case "setHoveredMaterial":
      return { ...state, hoveredMaterialIdx: action.index };

    case "updateRow":
      return {
        ...state,
        rows: state.rows.map((r, i) =>
          i === action.index ? { ...r, [action.field]: action.value } : r,
        ),
      };

    case "addRow":
      return { ...state, rows: [...state.rows, action.row] };

    case "removeRow":
      return {
        ...state,
        rows: state.rows.filter((_, i) => i !== action.index),
      };

    case "updateConstant":
      return {
        ...state,
        constants: { ...state.constants, [action.variable]: action.value },
      };

    case "setStudentValue":
      return { ...state, studentValue: action.value };

    case "updateReflection":
      return {
        ...state,
        reflections: state.reflections.map((v, i) =>
          i === action.index ? action.value : v,
        ),
      };

    case "toggleHint": {
      const next = new Set(state.openHints);
      if (next.has(action.id)) next.delete(action.id);
      else next.add(action.id);
      return { ...state, openHints: next };
    }

    case "setShowFacit":
      return { ...state, showFacit: action.value };

    case "setShowRestoreNotification":
      return { ...state, showRestoreNotification: action.value };

    case "setShowClearConfirm":
      return { ...state, showClearConfirm: action.value };

    default:
      return state;
  }
}

export function extractPersistedSlice(state: GuideState): PersistedLabGuideState {
  return {
    hypothesis: state.hypothesis,
    varInputs: state.varInputs,
    validationErrors: state.validationErrors,
    validatedFields: state.validatedFields,
    materialsChecked: state.materialsChecked,
    setupChecked: state.setupChecked,
    rows: state.rows,
    constants: state.constants,
    studentValue: state.studentValue,
    reflections: state.reflections,
    mode: state.mode || "guidet",
  };
}
