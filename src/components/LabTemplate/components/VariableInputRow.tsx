import type { Variable } from "@/content/types";
import type { Mode, VarField, VariableInput } from "../types";

interface VariableInputRowProps {
  variable: Variable;
  input: VariableInput;
  errors: { fysiskStorrelse: boolean; symbol: boolean; enhed: boolean };
  validatedSet: Set<VarField> | undefined;
  validateInputs: boolean;
  mode: Mode;
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
          placeholder="fx Kraft"
          value={input.fysiskStorrelse}
          onChange={(val) => onChange("fysiskStorrelse", val)}
          onBlur={() => onBlur("fysiskStorrelse")}
          isError={errors.fysiskStorrelse}
          validated={validatedSet?.has("fysiskStorrelse") && validateInputs && !!v.expectedPhysicalQuantity}
          mode={mode}
          expected={v.expectedPhysicalQuantity}
        />
        <Field
          label="Symbol"
          placeholder="fx F"
          value={input.symbol}
          onChange={(val) => onChange("symbol", val)}
          onBlur={() => onBlur("symbol")}
          isError={errors.symbol}
          validated={validatedSet?.has("symbol") && validateInputs && !!v.expectedSymbol}
          mode={mode}
          expected={v.expectedSymbol}
        />
        <Field
          label="Enhed"
          placeholder="fx N"
          value={input.enhed}
          onChange={(val) => onChange("enhed", val)}
          onBlur={() => onBlur("enhed")}
          isError={errors.enhed}
          validated={validatedSet?.has("enhed") && validateInputs && !!v.expectedUnit}
          mode={mode}
          expected={v.expectedUnit}
        />
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  isError: boolean;
  validated: boolean | undefined;
  mode: Mode;
  expected: string | string[] | undefined;
}

function Field({ label, placeholder, value, onChange, onBlur, isError, validated, mode, expected }: FieldProps) {
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
          isError ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-sky-400"
        }`}
      />
      {validated && (
        <div className="mt-1 flex items-center gap-1">
          {isError ? (
            <>
              <span className="text-sm text-red-500">✗</span>
              {mode === "guidet" && expected && (
                <span className="text-xs text-red-500">
                  Forventet: {Array.isArray(expected) ? expected.join(" eller ") : expected}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-green-500">✓</span>
          )}
        </div>
      )}
    </div>
  );
}
