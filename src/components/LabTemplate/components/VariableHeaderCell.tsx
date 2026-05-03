import type { VariableInput } from "../types";
import { Equation } from "@/components/Equation";

interface VariableHeaderCellProps {
  input?: VariableInput;
}

export default function VariableHeaderCell({ input }: VariableHeaderCellProps) {
  const physicalQuantity = input?.fysiskStorrelse || "Fysisk størrelse";
  const symbol = input?.symbol || "Symbol";
  const unit = input?.enhed || "enhed";
  return (
    <div className="flex flex-col gap-y-0.5">
      <div>{physicalQuantity}</div>
      <div className="text-slate-600 text-sm">
        <Equation latex={symbol} fallback={<span className="italic">{symbol}</span>} /> (
        <Equation latex={`\\mathrm{${unit}}`} fallback={<span>{unit}</span>} />)
      </div>
    </div>
  );
}
