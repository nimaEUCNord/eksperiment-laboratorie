"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import type { LabConfig, LabGuide, PhaseId } from "@/content/types";
import type { AccentClasses } from "@/lib/accent";
import HintBox from "./HintBox";
import { Equation } from "./Equation";
import { Simulation } from "./Simulation";
import MeasurementChart, { fitFromRows } from "./MeasurementChart";
import { useLabGuidePersistence } from "@/hooks/useLabGuidePersistence";

const styles = `
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
`;

type Mode = "guidet" | "semi" | "open";
type Phase = "choose" | 1 | 2 | 3 | 4 | 5;
type Row = Record<string, string>;
type VariableInput = {
  fysiskStorrelse: string;
  symbol: string;
  enhed: string;
};
type ValidationErrors = Record<string, Record<string, boolean>>;

const PHASES = [
  { key: 1, label: "Planlæg", id: undefined },
  { key: 2, label: "Opstil", id: "opstil" as PhaseId },
  { key: 3, label: "Mål", id: "maal" as PhaseId },
  { key: 4, label: "Analysér", id: "analyser" as PhaseId },
  { key: 5, label: "Konkludér", id: undefined },
] as const;

const DEFAULT_SETUP_ITEMS = [
  "Jeg har fundet alle materialer frem",
  "Jeg har opstillet mit forsøg, som vist på skitsen",
  "Jeg har sikret mig, at udstyret virker",
  "Jeg ved, hvordan jeg måler de variable jeg har planlagt",
  "Jeg har taget et billede af forsøgsopstillingen",
];

interface LabTemplateProps {
  lab: LabConfig;
  guide: LabGuide;
  accent: AccentClasses;
}

export default function LabTemplate({ lab, guide, accent }: LabTemplateProps) {
  const persistence = useLabGuidePersistence(lab.slug);
  const [showRestoreNotification, setShowRestoreNotification] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [hasRestored, setHasRestored] = useState(false);

  const [mode, setMode] = useState<Mode | null>(null);
  const [phase, setPhase] = useState<Phase>("choose");

  const setupItems = guide.setupItems ?? DEFAULT_SETUP_ITEMS;
  const embedSimIn = guide.embedSimulationInPhases ?? [];
  const canEmbedSim = Boolean(lab.simulationId);

  // Phase 1
  const [hypothesis, setHypothesis] = useState("");
  const [varInputs, setVarInputs] = useState<Record<string, VariableInput>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [validatedFields, setValidatedFields] = useState<Record<string, Set<'fysiskStorrelse' | 'symbol' | 'enhed'>>>({});

  // Phase 2
  const [materialsChecked, setMaterialsChecked] = useState<boolean[]>(() =>
    Array.from({ length: guide.materials?.length || 0 }, () => false),
  );
  const [setupChecked, setSetupChecked] = useState<boolean[]>(() =>
    Array.from({ length: setupItems.length }, () => false),
  );
  const [hoveredMaterialIdx, setHoveredMaterialIdx] = useState<number | null>(null);

  // Phase 3
  const [rows, setRows] = useState<Row[]>(() =>
    Array.from({ length: guide.suggestedMeasurements || 6 }, () => {
      const measVars = guide.variables?.filter(v => v.type === "independent" || v.type === "dependent") || [];
      return measVars.reduce((acc, v) => ({ ...acc, [v.name]: "" }), {});
    }),
  );
  const [constants, setConstants] = useState<Record<string, string>>(() => {
    const controlVars = guide.variables?.filter(v => v.type === "control") || [];
    return controlVars.reduce((acc, v) => ({ ...acc, [v.name]: "" }), {});
  });

  // Phase 4
  const [studentValue, setStudentValue] = useState("");

  // Phase 5
  const [reflections, setReflections] = useState<string[]>(
    Array.from({ length: guide.reflectionQuestions?.length || 0 }, () => ""),
  );
  const [showFacit, setShowFacit] = useState(false);

  const [openHints, setOpenHints] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (hasRestored) return;
    const restored = persistence.restoreState();
    if (restored) {
      if (restored.mode) setMode(restored.mode);
      if (restored.hypothesis) setHypothesis(restored.hypothesis);
      if (restored.varInputs) setVarInputs(restored.varInputs);
      if (restored.validationErrors) setValidationErrors(restored.validationErrors);
      if (restored.validatedFields) {
        const validatedFieldsMap: Record<string, Set<'fysiskStorrelse' | 'symbol' | 'enhed'>> = {};
        Object.entries(restored.validatedFields).forEach(([key, value]) => {
          validatedFieldsMap[key] = new Set(value as Iterable<'fysiskStorrelse' | 'symbol' | 'enhed'>);
        });
        setValidatedFields(validatedFieldsMap);
      }
      if (restored.materialsChecked) setMaterialsChecked(restored.materialsChecked);
      if (restored.setupChecked) setSetupChecked(restored.setupChecked);
      if (restored.rows) setRows(restored.rows);
      if (restored.constants) setConstants(restored.constants);
      if (restored.studentValue) setStudentValue(restored.studentValue);
      if (restored.reflections) setReflections(restored.reflections);
      setShowRestoreNotification(true);
      setPhase(1);
    }
    setHasRestored(true);
  }, [hasRestored, persistence]);

  useEffect(() => {
    if (!hasRestored || phase === "choose") return;
    persistence.saveState({
      hypothesis,
      varInputs,
      validationErrors,
      validatedFields,
      materialsChecked,
      setupChecked,
      rows,
      constants,
      studentValue,
      reflections,
      mode: mode || 'guidet',
    });
  }, [hasRestored, hypothesis, varInputs, validationErrors, validatedFields, materialsChecked, setupChecked, rows, constants, studentValue, reflections, mode, phase, persistence]);

  const phaseIndex = (p: Phase) => (p === "choose" ? -1 : (p as number) - 1);
  const isPhaseChoosing = (p: Phase): p is "choose" => p === "choose";

  const checkAnswer = (studentAnswer: string, expectedValue: string | string[] | undefined, isCaseSensitive: boolean): boolean => {
    if (!expectedValue || studentAnswer.trim() === "") return false;
    const normalize = isCaseSensitive ? (s: string) => s : (s: string) => s.toLowerCase();
    const studentNorm = normalize(studentAnswer.trim());
    if (Array.isArray(expectedValue)) {
      return expectedValue.some((exp) => normalize(exp) === studentNorm);
    }
    return normalize(expectedValue) === studentNorm;
  };

  const validateSingleField = (variableName: string, fieldType: 'fysiskStorrelse' | 'symbol' | 'enhed') => {
    if (!guide.validateVariableInputs || !guide.variables) return;
    const variable = guide.variables.find((v) => v.name === variableName);
    if (!variable) return;
    const input = varInputs[variableName] || { fysiskStorrelse: "", symbol: "", enhed: "" };
    const value = input[fieldType];

    if (value.trim() === "") {
      setValidatedFields((prev) => {
        const next = new Set(prev[variableName] ?? []);
        next.delete(fieldType);
        return { ...prev, [variableName]: next };
      });
      return;
    }

    let isError = false;
    if (fieldType === 'fysiskStorrelse') {
      isError = !checkAnswer(value, variable.expectedPhysicalQuantity, false);
    } else if (fieldType === 'symbol') {
      isError = !checkAnswer(value, variable.expectedSymbol, true);
    } else if (fieldType === 'enhed') {
      isError = !checkAnswer(value, variable.expectedUnit, true);
    }

    setValidationErrors((prev) => ({
      ...prev,
      [variableName]: {
        ...(prev[variableName] || { fysiskStorrelse: false, symbol: false, enhed: false }),
        [fieldType]: isError,
      },
    }));
    setValidatedFields((prev) => ({
      ...prev,
      [variableName]: new Set([...(prev[variableName] ?? []), fieldType]),
    }));
  };

  const validateAllVariableInputs = (): boolean => {
    if (!guide.validateVariableInputs || !guide.variables) return true;
    const errors: ValidationErrors = {};
    let hasErrors = false;
    guide.variables.forEach((variable) => {
      const input = varInputs[variable.name] || { fysiskStorrelse: "", symbol: "", enhed: "" };
      const varErrors: Record<string, boolean> = {
        fysiskStorrelse: !checkAnswer(input.fysiskStorrelse, variable.expectedPhysicalQuantity, false),
        symbol: !checkAnswer(input.symbol, variable.expectedSymbol, true),
        enhed: !checkAnswer(input.enhed, variable.expectedUnit, true),
      };
      errors[variable.name] = varErrors;
      if (Object.values(varErrors).some((err) => err)) hasErrors = true;
    });
    setValidationErrors(errors);
    const allValidated: Record<string, Set<'fysiskStorrelse' | 'symbol' | 'enhed'>> = {};
    guide.variables.forEach((variable) => {
      allValidated[variable.name] = new Set(['fysiskStorrelse', 'symbol', 'enhed']);
    });
    setValidatedFields(allValidated);
    return !hasErrors;
  };

  const handleFieldBlur = (variableName: string, fieldType: 'fysiskStorrelse' | 'symbol' | 'enhed') => {
    if (guide.validateVariableInputs) validateSingleField(variableName, fieldType);
  };

  const controlVars = useMemo(
    () => guide.variables?.filter((v) => v.type === "control") || [],
    [guide.variables],
  );

  const allConstantsFilled = useMemo(() => {
    return controlVars.every((v) => {
      const val = constants[v.name];
      return val !== undefined && val !== "";
    });
  }, [constants, controlVars]);

  const validRows = useMemo(() => {
    const measVars = guide.variables?.filter((v) => v.type === "independent" || v.type === "dependent") || [];
    return rows.filter((row) => {
      return measVars.every((v) => {
        const val = parseFloat(row[v.name]);
        return Number.isFinite(val) && val > 0;
      });
    });
  }, [rows, guide.variables]);

  const checkPhase1Conditions = () => {
    if (!hypothesis.trim()) return false;
    if (!guide.validateVariableInputs) return true;
    if (!guide.blockOnWrongVariableInputs) return true;
    return Object.keys(validationErrors).length === 0 || !Object.values(validationErrors).some((e) => Object.values(e).some((v) => v));
  };

  const checkPhase2Conditions = () => {
    if (guide.requireAllMaterialsChecked) {
      const allMaterialsChecked = materialsChecked.length > 0 && materialsChecked.every((checked) => checked);
      const allSetupChecked = setupChecked.every((checked) => checked);
      return allMaterialsChecked && allSetupChecked;
    }
    return materialsChecked.some((checked) => checked) || setupChecked.some((checked) => checked);
  };

  const checkPhase3Conditions = () => {
    const filledRows = rows.filter((row) => Object.values(row).every((v) => v.trim() !== ""));
    const constantsFilled = Object.values(constants).every((c) => c.trim() !== "");
    return filledRows.length >= (guide.minMeasurements || 4) && (guide.blockOnMissingConstants !== false ? constantsFilled : true);
  };

  const checkPhase4Conditions = () => studentValue.trim() !== "";

  const isPhaseCompleted = (phaseNum: number): boolean => {
    switch (phaseNum) {
      case 1: return checkPhase1Conditions();
      case 2: return checkPhase2Conditions();
      case 3: return checkPhase3Conditions();
      case 4: return checkPhase4Conditions();
      default: return false;
    }
  };

  const canProceedToPhase4 = guide.bypassLocks || (validRows.length >= (guide.minMeasurements || 4) && (guide.blockOnMissingConstants !== false ? allConstantsFilled : true));

  const updateRow = (i: number, field: string, value: string) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  };

  const addRow = () => {
    const measVars = guide.variables?.filter(v => v.type === "independent" || v.type === "dependent") || [];
    const newRow = measVars.reduce((acc, v) => ({ ...acc, [v.name]: "" }), {});
    setRows((prev) => [...prev, newRow]);
  };

  const handleNumberInputWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  const removeRow = (i: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateConstant = (variableName: string, value: string) => {
    setConstants((prev) => ({ ...prev, [variableName]: value }));
  };

  const toggleHint = (id: string) => {
    setOpenHints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleMaterial = (i: number) => {
    setMaterialsChecked((prev) => {
      const updated = [...prev];
      updated[i] = !updated[i];
      return updated;
    });
  };

  const toggleSetup = (i: number) => {
    setSetupChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  const updateReflection = (i: number, value: string) => {
    setReflections((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  };

  const handleClearWork = () => {
    persistence.clearState();
    setHypothesis("");
    setVarInputs({});
    setValidationErrors({});
    setValidatedFields({});
    setMaterialsChecked(Array.from({ length: guide.materials?.length || 0 }, () => false));
    setSetupChecked(Array.from({ length: setupItems.length }, () => false));
    setRows(Array.from({ length: guide.suggestedMeasurements || 6 }, () => {
      const measVars = guide.variables?.filter(v => v.type === "independent" || v.type === "dependent") || [];
      return measVars.reduce((acc, v) => ({ ...acc, [v.name]: "" }), {});
    }));
    setConstants(
      (guide.variables?.filter(v => v.type === "control") || []).reduce((acc, v) => ({ ...acc, [v.name]: "" }), {}),
    );
    setStudentValue("");
    setReflections(Array.from({ length: guide.reflectionQuestions?.length || 0 }, () => ""));
    setShowFacit(false);
    setPhase(1);
    setShowClearConfirm(false);
  };

  const renderEmbeddedSim = (phaseId: PhaseId) => {
    if (!canEmbedSim || !embedSimIn.includes(phaseId)) return null;
    return (
      <div className="mt-2">
        <Simulation simulationId={lab.simulationId} />
      </div>
    );
  };

  if (phase === "choose") {
    return (
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Laboratorieguide</h2>
        <p className="mt-2 text-slate-600">
          Vælg den undersøgelsesform, der passer til jeres time.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(
            [
              { key: "guidet" as Mode, title: "Guidet", desc: "Trin-for-trin vejledning og instruktioner ved hver fase." },
              { key: "semi" as Mode, title: "Semi-guidet", desc: "Korte overblik med hints, som du kan åbne efter behov." },
              { key: "open" as Mode, title: "Åben undersøgelse", desc: "Kun værktøjerne – du bestemmer selv fremgangsmåden." },
            ] as const
          ).map(({ key, title, desc }) => (
            <button
              key={key}
              onClick={() => { setMode(key); setPhase(1); }}
              className={`rounded-xl border-2 border-slate-200 bg-white p-5 text-left transition-colors hover:${accent.bgSoft} hover:${accent.border}`}
            >
              <div className={`text-base font-semibold ${accent.text}`}>{title}</div>
              <div className="mt-1.5 text-sm text-slate-600">{desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{styles}</style>
      <h2 className="text-xl font-semibold text-slate-900">Laboratorieguide</h2>

      {showRestoreNotification && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800 flex items-center justify-between">
          <span>✓ Dit tidligere arbejde er gendannet</span>
          <button
            onClick={() => setShowRestoreNotification(false)}
            className="text-green-600 hover:text-green-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-4 flex items-center gap-0">
        {PHASES.map((p, i) => {
          const active = phaseIndex(phase) === i;
          const shouldDisableButton = isPhaseChoosing(phase) && i > 0;
          const done = isPhaseCompleted(i + 1);
          return (
            <div key={String(p.key)} className="flex items-center">
              <button
                onClick={() => setPhase(p.key)}
                className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                disabled={shouldDisableButton}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    active || done ? `${accent.bg} text-white` : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span
                  className={`mt-1 whitespace-nowrap text-xs ${active ? accent.text : "text-slate-400"}`}
                >
                  {p.label}
                </span>
              </button>
              {i < PHASES.length - 1 && (
                <div className={`mb-4 h-0.5 w-6 sm:w-12 ${done ? accent.bg : "bg-slate-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Phase 1: Planlæg */}
      {phase === 1 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Fase 1 — Planlæg</h3>

          {mode !== "open" && guide.variables && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Identificér dine variable:</p>
              <div className="space-y-6">
                {guide.variables.map((v) => {
                  const typeLabel = {
                    independent: "Uafhængig variabel",
                    dependent: "Afhængig variabel",
                    control: "Konstanter",
                    derived: "Beregnet værdi",
                  }[v.type] || v.type;

                  const varInput = varInputs[v.name] || { fysiskStorrelse: "", symbol: "", enhed: "" };
                  const varError = validationErrors[v.name] || { fysiskStorrelse: false, symbol: false, enhed: false };

                  return (
                    <div key={v.name} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <label className="block text-xs font-medium text-slate-600">
                        {typeLabel}
                      </label>
                      {v.description && <p className="mt-1 text-xs text-slate-500">{v.description}</p>}

                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700">Fysisk størrelse</label>
                          <input
                            type="text"
                            value={varInput.fysiskStorrelse}
                            onChange={(e) =>
                              setVarInputs((prev) => ({
                                ...prev,
                                [v.name]: { ...varInput, fysiskStorrelse: e.target.value },
                              }))
                            }
                            onBlur={() => handleFieldBlur(v.name, 'fysiskStorrelse')}
                            placeholder="fx Kraft"
                            className={`mt-1 w-full rounded-lg border px-2 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                              varError.fysiskStorrelse
                                ? "border-red-300 focus:ring-red-400"
                                : "border-slate-200 focus:ring-sky-400"
                            }`}
                          />
                          {validatedFields[v.name]?.has('fysiskStorrelse') && guide.validateVariableInputs && v.expectedPhysicalQuantity && (
                            <div className="mt-1 flex items-center gap-1">
                              {varError.fysiskStorrelse ? (
                                <>
                                  <span className="text-sm text-red-500">✗</span>
                                  {mode === "guidet" && (
                                    <span className="text-xs text-red-500">
                                      Forventet: {Array.isArray(v.expectedPhysicalQuantity) ? v.expectedPhysicalQuantity.join(" eller ") : v.expectedPhysicalQuantity}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-sm text-green-500">✓</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700">Symbol</label>
                          <input
                            type="text"
                            value={varInput.symbol}
                            onChange={(e) =>
                              setVarInputs((prev) => ({
                                ...prev,
                                [v.name]: { ...varInput, symbol: e.target.value },
                              }))
                            }
                            onBlur={() => handleFieldBlur(v.name, 'symbol')}
                            placeholder="fx F"
                            className={`mt-1 w-full rounded-lg border px-2 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                              varError.symbol
                                ? "border-red-300 focus:ring-red-400"
                                : "border-slate-200 focus:ring-sky-400"
                            }`}
                          />
                          {validatedFields[v.name]?.has('symbol') && guide.validateVariableInputs && v.expectedSymbol && (
                            <div className="mt-1 flex items-center gap-1">
                              {varError.symbol ? (
                                <>
                                  <span className="text-sm text-red-500">✗</span>
                                  {mode === "guidet" && (
                                    <span className="text-xs text-red-500">
                                      Forventet: {Array.isArray(v.expectedSymbol) ? v.expectedSymbol.join(" eller ") : v.expectedSymbol}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-sm text-green-500">✓</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700">Enhed</label>
                          <input
                            type="text"
                            value={varInput.enhed}
                            onChange={(e) =>
                              setVarInputs((prev) => ({
                                ...prev,
                                [v.name]: { ...varInput, enhed: e.target.value },
                              }))
                            }
                            onBlur={() => handleFieldBlur(v.name, 'enhed')}
                            placeholder="fx N"
                            className={`mt-1 w-full rounded-lg border px-2 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                              varError.enhed
                                ? "border-red-300 focus:ring-red-400"
                                : "border-slate-200 focus:ring-sky-400"
                            }`}
                          />
                          {validatedFields[v.name]?.has('enhed') && guide.validateVariableInputs && v.expectedUnit && (
                            <div className="mt-1 flex items-center gap-1">
                              {varError.enhed ? (
                                <>
                                  <span className="text-sm text-red-500">✗</span>
                                  {mode === "guidet" && (
                                    <span className="text-xs text-red-500">
                                      Forventet: {Array.isArray(v.expectedUnit) ? v.expectedUnit.join(" eller ") : v.expectedUnit}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-sm text-green-500">✓</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">
              {mode === "guidet" ? "Min hypotese:" : "Skriv din hypotese:"}
            </label>
            <textarea
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              rows={3}
              placeholder={guide.hypothesisPlaceholder || "Skriv din hypotese her…"}
              className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => { setMode(null); setPhase("choose"); setValidatedFields({}); }}
              className="text-sm text-slate-500 hover:underline"
            >
              ← Skift undersøgelsesform
            </button>
            <button
              onClick={() => {
                const isValid = validateAllVariableInputs();
                if (!isValid && guide.blockOnWrongVariableInputs && !guide.bypassLocks) return;
                setPhase(2);
              }}
              disabled={!guide.bypassLocks && guide.validateVariableInputs && guide.blockOnWrongVariableInputs && Object.keys(validationErrors).length > 0 && Object.values(validationErrors).some((e) => Object.values(e).some((v) => v))}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Næste fase →
            </button>
          </div>

          <ResetWorkButton onClick={() => setShowClearConfirm(true)} />
        </div>
      )}

      {/* Phase 2: Opstil */}
      {phase === 2 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Fase 2 — Opstil</h3>

          {mode === "guidet" && (
            <div className={`rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700`}>
              <p className="font-medium text-slate-800">Forberedelsestrin:</p>
              <ol className="mt-3 list-decimal list-inside space-y-2 text-slate-600">
                <li>Saml dine materialer og tjek, at alt er klar.</li>
                <li>Gør dig selv bekendt med måleudstyr og målemetoder.</li>
                <li>Planlæg hvordan du registrerer data systematisk.</li>
              </ol>
            </div>
          )}

          {mode === "semi" && (
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>Forbered dit forsøgsudstyr og sørg for at det virker.</p>
              <HintBox
                id="p2-h1"
                label="Hvad skal jeg checke?"
                content="Tjek at all equipment virker. Verificer at måleudstyr er kalibreret. Planlæg din dataindsamling systematisk."
                openHints={openHints}
                toggle={toggleHint}
              />
            </div>
          )}

          {renderEmbeddedSim("opstil")}

          {mode === "guidet" && guide.materials && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Materialer:</p>
              <div className="flex gap-6">
                <div className="flex-1">
                  <ul className="space-y-2 text-sm text-slate-600">
                    {guide.materials.map((material, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3"
                        onMouseEnter={() => setHoveredMaterialIdx(i)}
                        onMouseLeave={() => setHoveredMaterialIdx(null)}
                      >
                        <input
                          type="checkbox"
                          id={`material-${i}`}
                          checked={materialsChecked[i] || false}
                          onChange={() => toggleMaterial(i)}
                          className="mt-0.5 h-4 w-4 rounded-lg"
                        />
                        <label
                          htmlFor={`material-${i}`}
                          className="cursor-pointer hover:text-slate-900 transition-colors"
                        >
                          {material}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 h-64 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 flex flex-col items-center justify-center">
                  {hoveredMaterialIdx !== null && guide.materials && guide.materialImages && guide.materials[hoveredMaterialIdx] && guide.materialImages[guide.materials[hoveredMaterialIdx]] ? (
                    <div className="text-center flex flex-col items-center justify-center flex-1">
                      <Image
                        src={guide.materialImages[guide.materials[hoveredMaterialIdx]]}
                        alt={guide.materials[hoveredMaterialIdx]}
                        className="max-h-48 max-w-full object-contain"
                        width={300}
                        height={300}
                        priority
                      />
                      <p className="mt-3 text-xs font-medium text-slate-600">
                        {guide.materials[hoveredMaterialIdx]}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-slate-500">Skitse af forsøgsopstilling</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Tjekliste:</p>
            {setupItems.map((item, i) => (
              <div key={i} className="flex items-center">
                <input
                  type="checkbox"
                  checked={setupChecked[i] || false}
                  onChange={() => toggleSetup(i)}
                  className="h-4 w-4 rounded-lg"
                />
                <label className="ml-3 text-sm text-slate-700">{item}</label>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => setPhase(1)} className="text-sm text-slate-500 hover:underline">
              ← Forrige fase
            </button>
            <button
              onClick={() => setPhase(3)}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg}`}
            >
              Næste fase →
            </button>
          </div>

          <ResetWorkButton onClick={() => setShowClearConfirm(true)} />
        </div>
      )}

      {/* Phase 3: Mål */}
      {phase === 3 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Fase 3 — Mål</h3>

          {mode === "guidet" && (
            <div className={`rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700`}>
              <p className="font-medium text-slate-800">Dataindsamling:</p>
              <p className="mt-2 text-slate-600">
                {guide.dataCollectionGuidance || `Indsaml mindst ${guide.minMeasurements || 4}${guide.suggestedMeasurements ? `-${guide.suggestedMeasurements}` : ""} målinger. Hvis et felt kan beregnes automatisk, udfyldes det af sig selv.`}
              </p>
            </div>
          )}

          {renderEmbeddedSim("maal")}

          {controlVars.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Konstanter:</p>
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {controlVars.map((variable) => {
                    const varInput = varInputs[variable.name];
                    const physicalQuantity = varInput?.fysiskStorrelse || "Fysisk størrelse";
                    const symbol = varInput?.symbol || "Symbol";
                    const unit = varInput?.enhed || "enhed";
                    return (
                      <tr key={variable.name}>
                        <td className={`bg-slate-50 border border-slate-200 px-3 py-2 text-slate-700 font-medium`}>
                          <div className="flex flex-col gap-y-0.5">
                            <div>{physicalQuantity}</div>
                            <div className="text-slate-600 text-sm">
                              <Equation latex={symbol} fallback={<span className="italic">{symbol}</span>} /> (
                              <Equation latex={`\\mathrm{${unit}}`} fallback={<span>{unit}</span>} />)
                            </div>
                          </div>
                        </td>
                        <td className="border border-slate-200 px-3 py-2">
                          <input
                            type="number"
                            value={constants[variable.name] || ""}
                            onChange={(e) => updateConstant(variable.name, e.target.value)}
                            onWheel={handleNumberInputWheel}
                            placeholder="–"
                            className="w-full border-none bg-transparent p-0 text-slate-800 placeholder:text-slate-400 focus:outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Målinger:</p>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {guide.variables
                    ?.filter((v) => v.type === "independent" || v.type === "dependent")
                    .map((variable) => {
                      const varInput = varInputs[variable.name];
                      const physicalQuantity = varInput?.fysiskStorrelse || "Fysisk størrelse";
                      const symbol = varInput?.symbol || "Symbol";
                      const unit = varInput?.enhed || "enhed";
                      return (
                        <th
                          key={variable.name}
                          className="border border-slate-200 px-3 py-2 text-center font-medium text-slate-700"
                        >
                          <div className="flex flex-col gap-y-0.5">
                            <div>{physicalQuantity}</div>
                            <div className="text-slate-600 text-sm">
                              <Equation latex={symbol} fallback={<span className="italic">{symbol}</span>} /> (
                              <Equation latex={`\\mathrm{${unit}}`} fallback={<span>{unit}</span>} />)
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  <th className="border border-slate-200 px-3 py-2 text-center font-medium text-slate-700 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {guide.variables
                      ?.filter((v) => v.type === "independent" || v.type === "dependent")
                      .map((variable) => {
                        const value = row[variable.name];
                        return (
                          <td key={variable.name} className="border border-slate-200 px-3 py-2">
                            <input
                              type="number"
                              value={value || ""}
                              onChange={(e) => updateRow(i, variable.name, e.target.value)}
                              onWheel={handleNumberInputWheel}
                              placeholder="–"
                              className="w-full border-none bg-transparent p-0 text-slate-800 placeholder:text-slate-400 focus:outline-none"
                            />
                          </td>
                        );
                      })}
                    <td className="border border-slate-200 px-3 py-2 text-center">
                      <button
                        onClick={() => removeRow(i)}
                        className="text-slate-400 hover:text-red-500 transition-colors text-sm"
                        title="Fjern måling"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={addRow} className="mt-2 text-sm text-slate-500 hover:text-slate-700 underline">
            + Tilføj måling
          </button>

          <div className="text-sm text-slate-600">
            <p>
              Gyldige målinger: <strong>{validRows.length}</strong> / {guide.suggestedMeasurements || rows.length}
            </p>
            {!guide.bypassLocks && !canProceedToPhase4 && (
              <div className="mt-1 space-y-1 text-amber-600">
                {validRows.length < (guide.minMeasurements || 4) && (
                  <p>Indsaml mindst {guide.minMeasurements || 4} gyldige målinger før næste fase.</p>
                )}
                {controlVars.length > 0 && !allConstantsFilled && guide.blockOnMissingConstants !== false && (
                  <p>Udfyld alle konstanter før næste fase.</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => setPhase(2)} className="text-sm text-slate-500 hover:underline">
              ← Forrige fase
            </button>
            <button
              onClick={() => setPhase(4)}
              disabled={!canProceedToPhase4}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg} disabled:opacity-50`}
            >
              Næste fase →
            </button>
          </div>

          <ResetWorkButton onClick={() => setShowClearConfirm(true)} />
        </div>
      )}

      {/* Phase 4: Analysér */}
      {phase === 4 && (
        <Phase4Analyse
          accent={accent}
          guide={guide}
          rows={rows}
          studentValue={studentValue}
          setStudentValue={setStudentValue}
          renderEmbeddedSim={renderEmbeddedSim}
          onPrev={() => setPhase(3)}
          onNext={() => setPhase(5)}
          onReset={() => setShowClearConfirm(true)}
        />
      )}

      {/* Phase 5: Konkludér */}
      {phase === 5 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Fase 5 — Konkludér</h3>

          {guide.reflectionQuestions && guide.reflectionQuestions.length > 0 && (
            <div className="space-y-6">
              {guide.reflectionQuestions.map((q, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-slate-700">{q}</label>
                  <textarea
                    value={reflections[i] || ""}
                    onChange={(e) => updateReflection(i, e.target.value)}
                    rows={3}
                    placeholder="Skriv dit svar her…"
                    className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              ))}
            </div>
          )}

          {guide.facit && (
            <div>
              <button
                onClick={() => setShowFacit(!showFacit)}
                className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${accent.bg}`}
              >
                {showFacit ? "Skjul" : "Vis"} facit
              </button>
              {showFacit && (
                <div className={`mt-4 rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700`}>
                  <p className="font-medium text-slate-800 mb-2">Facit:</p>
                  <p className="whitespace-pre-wrap">{guide.facit}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button onClick={() => setPhase(4)} className="text-sm text-slate-500 hover:underline">
              ← Forrige fase
            </button>
            <button
              onClick={() => { setMode(null); setPhase("choose"); }}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg}`}
            >
              Afslut guide
            </button>
          </div>

          <ResetWorkButton onClick={() => setShowClearConfirm(true)} />
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Nulstil arbejde?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Er du sikker på, at du vil slette alt dit arbejde? Dette kan ikke fortrydes.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Annuller
              </button>
              <button
                onClick={handleClearWork}
                className="rounded-xl px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600"
              >
                Nulstil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResetWorkButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-6 border-t border-slate-200 pt-4">
      <button
        onClick={onClick}
        className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
      >
        Nulstil arbejde
      </button>
    </div>
  );
}

interface Phase4Props {
  accent: AccentClasses;
  guide: LabGuide;
  rows: Row[];
  studentValue: string;
  setStudentValue: (v: string) => void;
  renderEmbeddedSim: (phaseId: PhaseId) => React.ReactNode;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}

function Phase4Analyse({ accent, guide, rows, studentValue, setStudentValue, renderEmbeddedSim, onPrev, onNext, onReset }: Phase4Props) {
  const fit = useMemo(() => (guide.chart ? fitFromRows(rows, guide.chart) : null), [rows, guide.chart]);
  const studentNum = parseFloat(studentValue);
  const theoretical = guide.theoreticalValue;
  const percentDiff =
    theoretical && Number.isFinite(studentNum) && studentNum > 0
      ? Math.abs((studentNum - theoretical) / theoretical) * 100
      : null;
  const threshold = guide.deviationThreshold ?? 10;
  const unit = guide.theoreticalValueUnit ?? "";

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Fase 4 — Analysér</h3>

      <div className={`rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700`}>
        <p className="font-medium text-slate-800">Analysér dine resultater:</p>
        <p className="mt-2 text-slate-600">Sammenlign dine målinger med den teoretiske værdi.</p>
      </div>

      {renderEmbeddedSim("analyser")}

      {guide.chart && (
        <MeasurementChart rows={rows} chart={guide.chart} />
      )}

      <div className="space-y-4">
        {theoretical !== undefined && (
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Teoretisk værdi: {theoretical}{unit ? ` ${unit}` : ""}
            </label>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700">Din målt værdi:</label>
          <input
            type="number"
            value={studentValue}
            onChange={(e) => setStudentValue(e.target.value)}
            placeholder="Indtast din beregnede værdi"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {theoretical !== undefined && studentValue && Number.isFinite(studentNum) && (
          <div className={`rounded-xl border-2 ${accent.border} ${accent.bgSoft} p-4`}>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-slate-500">Din målte værdi</div>
                <div className={`mt-1 font-mono text-lg font-semibold ${accent.text}`}>
                  {studentNum.toFixed(2)}{unit ? ` ${unit}` : ""}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Teoretisk</div>
                <div className="mt-1 font-mono text-lg font-semibold text-slate-700">
                  {theoretical.toFixed(2)}{unit ? ` ${unit}` : ""}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Afvigelse</div>
                <div
                  className={`mt-1 font-mono text-lg font-semibold ${
                    percentDiff !== null && percentDiff < threshold
                      ? "text-emerald-600"
                      : percentDiff !== null && percentDiff < threshold * 2
                        ? "text-amber-600"
                        : "text-rose-600"
                  }`}
                >
                  {percentDiff !== null ? `${percentDiff.toFixed(1)} %` : "–"}
                </div>
              </div>
            </div>
            {fit && (
              <p className="mt-3 text-center text-xs text-slate-500">
                Hældning fra bedste rette linje: <strong>{fit.slope.toFixed(3)}</strong>
                {fit.intercept !== 0 && ` · skæring: ${fit.intercept.toFixed(3)}`}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onPrev} className="text-sm text-slate-500 hover:underline">
          ← Forrige fase
        </button>
        <button
          onClick={onNext}
          className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg}`}
        >
          Næste fase →
        </button>
      </div>

      <ResetWorkButton onClick={onReset} />
    </div>
  );
}
