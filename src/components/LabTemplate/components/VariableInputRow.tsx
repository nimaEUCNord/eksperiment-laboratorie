import type { Variable } from "@/content/types";
import type { Mode, VarField, VariableInput } from "../types";

interface VariableInputRowProps {
  variable: Variable;
  input: VariableInput;
  errors: { fysiskStorrelse: boolean; symbol: boolean; enhed: boolean };
  validatedSet: Set<VarField> | undefined;
  validateInputs: boolean;
  mode: Mode;
  showAnswers?: boolean;
  onChange: (field: VarField, value: string) => void;
  onBlur: (field: VarField) => void;
}

const TYPE_LABELS: Record<Variable["type"], string> = {
  independent: "Uafhængig variabel",
  dependent: "Afhængig variabel",
  control: "Konstanter",
  derived: "Beregnet værdi",
};

export default function VariableInputRow({
  variable: v,
  input,
  errors,
  validatedSet,
  validateInputs,
  mode,
  showAnswers,
  onChange,
  onBlur,
}: VariableInputRowProps) {
  const typeLabel = TYPE_LABELS[v.type] || v.type;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <label className="block text-xs font-medium text-slate-600">{typeLabel}</label>
      {v.description && <p className="mt-1 text-xs text-slate-500">{v.description}</p>}

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Field
          label="Fysisk størrelse"
          value={input.fysiskStorrelse}
          onChange={(val) => onChange("fysiskStorrelse", val)}
          onBlur={() => onBlur("fysiskStorrelse")}
          isError={errors.fysiskStorrelse}
          validated={validatedSet?.has("fysiskStorrelse") && validateInputs && !!v.expectedPhysicalQuantity}
          mode={mode}
          showAnswers={showAnswers}
          expected={v.expectedPhysicalQuantity}
        />
        <Field
          label="Symbol"
          value={input.symbol}
          onChange={(val) => onChange("symbol", val)}
          onBlur={() => onBlur("symbol")}
          isError={errors.symbol}
          validated={validatedSet?.has("symbol") && validateInputs && !!v.expectedSymbol}
          mode={mode}
          showAnswers={showAnswers}
          expected={v.expectedSymbol}
        />
        <Field
          label="Enhed"
          value={input.enhed}
          onChange={(val) => onChange("enhed", val)}
          onBlur={() => onBlur("enhed")}
          isError={errors.enhed}
          validated={validatedSet?.has("enhed") && validateInputs && !!v.expectedUnit}
          mode={mode}
          showAnswers={showAnswers}
          expected={v.expectedUnit}
        />
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  isError: boolean;
  validated: boolean | undefined;
  mode: Mode;
  showAnswers?: boolean;
  expected: string | string[] | undefined;
}

function Field({ label, placeholder, value, onChange, onBlur, isError, validated, mode, showAnswers, expected }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`mt-1 w-full rounded-lg border px-2 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
          validated && !isError
            ? "border-emerald-300 focus:ring-emerald-400"
            : "border-slate-200 focus:ring-sky-400"
        }`}
      />
      {validated && isError && showAnswers && (mode === "guidet" || showAnswers) && expected && (
        <div className="mt-1 flex items-center gap-1">
          <span className="text-xs text-slate-500">
            Forventet: {Array.isArray(expected) ? expected.join(" eller ") : expected}
          </span>
        </div>
      )}
    </div>
  );
}
