"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type { Lab, LabGuideConfig } from "@/content/types";
import type { AccentClasses } from "@/lib/accent";
import HintBox from "./HintBox";

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
  { key: 1, label: "Planlæg" },
  { key: 2, label: "Opstil" },
  { key: 3, label: "Mål" },
  { key: 4, label: "Analysér" },
  { key: 5, label: "Konkludér" },
] as const;

interface GenericLabGuideProps {
  lab: Lab;
  config: LabGuideConfig;
  accent: AccentClasses;
}

export default function GenericLabGuide({ lab, config, accent }: GenericLabGuideProps) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [phase, setPhase] = useState<Phase>("choose");

  // Phase 1 state
  const [hypothesis, setHypothesis] = useState("");
  const [varInputs, setVarInputs] = useState<Record<string, VariableInput>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  // Tracks which specific fields have been validated (to avoid showing feedback on untouched fields)
  const [validatedFields, setValidatedFields] = useState<Record<string, Set<'fysiskStorrelse' | 'symbol' | 'enhed'>>>({});

  // Phase 2 state
  const [materialsChecked, setMaterialsChecked] = useState<boolean[]>([]);
  const [setupChecked, setSetupChecked] = useState<boolean[]>([false, false, false, false, false]);
  const [hoveredMaterialIdx, setHoveredMaterialIdx] = useState<number | null>(null);

  // Phase 3 state (data collection)
  const [rows, setRows] = useState<Row[]>(() =>
    Array.from({ length: 6 }, () =>
      (config.measurementFields || []).reduce((acc, field) => ({ ...acc, [field.label]: "" }), {})
    )
  );

  // Phase 4 state
  const [studentValue, setStudentValue] = useState("");

  // Phase 5 state
  const [reflections, setReflections] = useState<string[]>(
    Array.from({ length: config.reflectionQuestions?.length || 0 }, () => "")
  );
  const [showFacit, setShowFacit] = useState(false);

  // Shared
  const [openHints, setOpenHints] = useState<Set<string>>(new Set());

  const phaseIndex = (p: Phase) => (p === "choose" ? -1 : (p as number) - 1);

  // Validation helper: check if student answer matches expected value(s)
  const checkAnswer = (studentAnswer: string, expectedValue: string | string[] | undefined, isCaseSensitive: boolean): boolean => {
    if (!expectedValue || studentAnswer.trim() === "") return false;

    const normalize = isCaseSensitive ? (s: string) => s : (s: string) => s.toLowerCase();
    const studentNorm = normalize(studentAnswer.trim());

    if (Array.isArray(expectedValue)) {
      return expectedValue.some((exp) => normalize(exp) === studentNorm);
    }
    return normalize(expectedValue) === studentNorm;
  };

  // Validate a single field on blur for instant feedback
  const validateSingleField = (variableName: string, fieldType: 'fysiskStorrelse' | 'symbol' | 'enhed') => {
    if (!config.validateVariableInputs || !config.variables) return;

    const variable = config.variables.find((v) => v.name === variableName);
    if (!variable) return;

    const input = varInputs[variableName] || { fysiskStorrelse: "", symbol: "", enhed: "" };
    const value = input[fieldType];

    // Don't validate empty fields — remove feedback if the field was cleared
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

  // Validate all variable inputs (called on Next button)
  const validateVariableInputs = (): boolean => {
    if (!config.validateVariableInputs || !config.variables) return true;

    const errors: ValidationErrors = {};
    let hasErrors = false;

    config.variables.forEach((variable) => {
      const input = varInputs[variable.name] || { fysiskStorrelse: "", symbol: "", enhed: "" };
      const varErrors: Record<string, boolean> = {
        fysiskStorrelse: !checkAnswer(input.fysiskStorrelse, variable.expectedPhysicalQuantity, false),
        symbol: !checkAnswer(input.symbol, variable.expectedSymbol, true),
        enhed: !checkAnswer(input.enhed, variable.expectedUnit, true),
      };

      errors[variable.name] = varErrors;
      if (Object.values(varErrors).some((err) => err)) {
        hasErrors = true;
      }
    });

    setValidationErrors(errors);
    // Mark all fields as validated so Next-button validation shows all feedback
    const allValidated: Record<string, Set<'fysiskStorrelse' | 'symbol' | 'enhed'>> = {};
    config.variables.forEach((variable) => {
      allValidated[variable.name] = new Set(['fysiskStorrelse', 'symbol', 'enhed']);
    });
    setValidatedFields(allValidated);
    return !hasErrors;
  };

  // Validate on blur for instant feedback
  const handleFieldBlur = (variableName: string, fieldType: 'fysiskStorrelse' | 'symbol' | 'enhed') => {
    if (config.validateVariableInputs) {
      validateSingleField(variableName, fieldType);
    }
  };

  const validRows = useMemo(() => {
    return rows.filter((row) => {
      const measurementFields = config.measurementFields || [];
      return measurementFields.some((field) => {
        const val = parseFloat(row[field.label]);
        return Number.isFinite(val) && val > 0;
      });
    });
  }, [rows, config.measurementFields]);

  const canProceedToPhase4 = validRows.length >= 4;

  const updateRow = (i: number, field: string, value: string) => {
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r))
    );
  };

  const toggleHint = (id: string) => {
    setOpenHints((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
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

  // Mode selection screen
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
              {
                key: "guidet" as Mode,
                title: "Guidet",
                desc: "Trin-for-trin vejledning og instruktioner ved hver fase.",
              },
              {
                key: "semi" as Mode,
                title: "Semi-guidet",
                desc: "Korte overblik med hints, som du kan åbne efter behov.",
              },
              {
                key: "open" as Mode,
                title: "Åben undersøgelse",
                desc: "Kun værktøjerne – du bestemmer selv fremgangsmåden.",
              },
            ] as const
          ).map(({ key, title, desc }) => (
            <button
              key={key}
              onClick={() => {
                setMode(key);
                setPhase(1);
              }}
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

  const currentIdx = phaseIndex(phase);

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Laboratorieguide</h2>

      {/* Progress bar */}
      <div className="mt-4 flex items-center gap-0">
        {PHASES.map((p, i) => {
          const active = phaseIndex(phase) === i;
          const done = phaseIndex(phase) > i;
          return (
            <div key={String(p.key)} className="flex items-center">
              <div className="flex flex-col items-center">
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
              </div>
              {i < PHASES.length - 1 && (
                <div
                  className={`mb-4 h-0.5 w-6 sm:w-12 ${currentIdx > i ? accent.bg : "bg-slate-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Phase 1: Planlæg */}
      {phase === 1 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Fase 1 — Planlæg</h3>

          {mode === "semi" && (
            <div className="mt-3 space-y-3 text-sm text-slate-600" />
          )}

          {mode !== "open" && config.variables && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Identificér dine variable:</p>
              <div className="space-y-6">
                {config.variables.map((v) => {
                  const typeLabel = {
                    independent: "Uafhængig variabel",
                    dependent: "Afhængig variabel",
                    control: "Konstanter",
                    derived: "Beregnet værdi",
                  }[v.type] || v.type;

                  const typeHelpText = {
                    independent: "",
                    dependent: "",
                    control: "",
                    derived: "",
                  }[v.type] || "";

                  const varInput = varInputs[v.name] || { fysiskStorrelse: "", symbol: "", enhed: "" };
                  const varError = validationErrors[v.name] || { fysiskStorrelse: false, symbol: false, enhed: false };

                  return (
                    <div key={v.name} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <label className="block text-xs font-medium text-slate-600">
                        {typeLabel}
                        {typeHelpText && <span className="font-normal text-slate-500"> — {typeHelpText}</span>}
                      </label>
                      {v.description && <p className="mt-1 text-xs text-slate-500">{v.description}</p>}

                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        {/* Fysisk størrelse */}
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
                          {validatedFields[v.name]?.has('fysiskStorrelse') && config.validateVariableInputs && v.expectedPhysicalQuantity && (
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

                        {/* Symbol */}
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
                          {validatedFields[v.name]?.has('symbol') && config.validateVariableInputs && v.expectedSymbol && (
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

                        {/* Enhed */}
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
                          {validatedFields[v.name]?.has('enhed') && config.validateVariableInputs && v.expectedUnit && (
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
              placeholder={config.hypothesisPlaceholder || "Skriv din hypotese her…"}
              className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setMode(null);
                setPhase("choose");
                setValidatedFields({});
              }}
              className="text-sm text-slate-500 hover:underline"
            >
              ← Skift undersøgelsesform
            </button>
            <button
              onClick={() => {
                const isValid = validateVariableInputs();
                if (!isValid && config.blockOnWrongVariableInputs) return;
                setPhase(2);
              }}
              disabled={config.validateVariableInputs && config.blockOnWrongVariableInputs && Object.keys(validationErrors).length > 0 && Object.values(validationErrors).some((e) => Object.values(e).some((v) => v))}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Næste fase →
            </button>
          </div>
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

          {mode === "guidet" && config.materials && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Materialer:</p>
              <div className="flex gap-6">
                <div className="flex-1">
                  <ul className="space-y-2 text-sm text-slate-600">
                    {config.materials.map((material, i) => (
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
                  {hoveredMaterialIdx !== null && config.materials && config.materialImages && config.materials[hoveredMaterialIdx] && config.materialImages[config.materials[hoveredMaterialIdx]] ? (
                    <div className="text-center flex flex-col items-center justify-center flex-1">
                      <Image
                        src={config.materialImages[config.materials[hoveredMaterialIdx]] as any}
                        alt={config.materials[hoveredMaterialIdx]}
                        className="max-h-48 max-w-full object-contain"
                        width={300}
                        height={300}
                        priority
                      />
                      <p className="mt-3 text-xs font-medium text-slate-600">
                        {config.materials[hoveredMaterialIdx]}
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
            {["Jeg har fundet alle materialer frem", "Jeg har opstillet mit forsøg, som vist på skitsen", "Jeg har sikret mig, at udstyret virker", "Jeg ved, hvordan jeg måler de variable jeg har planlagt", "Jeg har taget et billede af forsøgsopstillingen"].map((item, i) => (
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
            <button
              onClick={() => setPhase(1)}
              className="text-sm text-slate-500 hover:underline"
            >
              ← Forrige fase
            </button>
            <button
              onClick={() => setPhase(3)}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg}`}
            >
              Næste fase →
            </button>
          </div>
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
                Indsaml mindst 4-6 målinger. Hvis et felt kan beregnes automatisk, udfyldes det af sig selv.
              </p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className={`${accent.bgSoft}`}>
                  {config.measurementFields?.map((field, idx) => {
                    // Try to use student-entered symbol and unit for measurement columns
                    let headerLabel = field.label;
                    let headerUnit = field.unit;

                    if (config.variables && idx < config.variables.length) {
                      const variable = config.variables[idx];
                      const varInput = varInputs[variable.name];
                      if (varInput?.symbol) {
                        headerLabel = varInput.symbol;
                        if (varInput.enhed) {
                          headerUnit = varInput.enhed;
                        }
                      }
                    }

                    return (
                      <th key={field.label} className="border border-slate-200 px-3 py-2 text-left font-medium text-slate-700">
                        {headerLabel} ({headerUnit})
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {config.measurementFields?.map((field) => {
                      const isAuto = field.autoCalculate;
                      const value = row[field.label];
                      return (
                        <td key={field.label} className="border border-slate-200 px-3 py-2">
                          {isAuto ? (
                            <span className="text-slate-500">{value || "–"}</span>
                          ) : (
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => updateRow(i, field.label, e.target.value)}
                              placeholder="–"
                              className="w-full border-none bg-transparent p-0 text-slate-800 placeholder:text-slate-400 focus:outline-none"
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-sm text-slate-600">
            <p>
              Gyldige målinger: <strong>{validRows.length}</strong> / {rows.length}
            </p>
            {!canProceedToPhase4 && (
              <p className="mt-1 text-amber-600">Indsaml mindst 4 gyldige målinger før næste fase.</p>
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
        </div>
      )}

      {/* Phase 4: Analysér */}
      {phase === 4 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Fase 4 — Analysér</h3>

          <div className={`rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700`}>
            <p className="font-medium text-slate-800">Analysér dine resultater:</p>
            <p className="mt-2 text-slate-600">Sammenlign dine målinger med den teoretiske værdi.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Teoretisk værdi: {config.theoreticalValue || "–"}
              </label>
            </div>

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

            {config.theoreticalValue && studentValue && (
              <div className={`rounded-xl border-2 ${accent.border} ${accent.bgSoft} p-4`}>
                <p className="text-sm font-medium text-slate-700">Resultat:</p>
                <p className="mt-2 text-slate-600">
                  Afvigelse:{" "}
                  <strong>
                    {(Math.abs((parseFloat(studentValue) - config.theoreticalValue) / config.theoreticalValue) * 100).toFixed(1)}%
                  </strong>
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => setPhase(3)} className="text-sm text-slate-500 hover:underline">
              ← Forrige fase
            </button>
            <button
              onClick={() => setPhase(5)}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg}`}
            >
              Næste fase →
            </button>
          </div>
        </div>
      )}

      {/* Phase 5: Konkludér */}
      {phase === 5 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Fase 5 — Konkludér</h3>

          {config.reflectionQuestions && config.reflectionQuestions.length > 0 && (
            <div className="space-y-6">
              {config.reflectionQuestions.map((q, i) => (
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

          {config.facit && (
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
                  <p>{config.facit}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button onClick={() => setPhase(4)} className="text-sm text-slate-500 hover:underline">
              ← Forrige fase
            </button>
            <button
              onClick={() => {
                setMode(null);
                setPhase("choose");
              }}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${accent.bg}`}
            >
              Afslut guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
