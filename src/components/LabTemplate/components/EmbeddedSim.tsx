import type { PhaseId } from "@/content/types";
import { Simulation } from "@/components/Simulation";

interface EmbeddedSimProps {
  phaseId: PhaseId;
  simulationId?: string;
  embedIn: PhaseId[];
  simKey?: number;
}

export default function EmbeddedSim({ phaseId, simulationId, embedIn, simKey }: EmbeddedSimProps) {
  if (!simulationId || !embedIn.includes(phaseId)) return null;
  return (
    <div className="mt-2">
      <Simulation key={simKey} simulationId={simulationId} resetKey={simKey} />
    </div>
  );
}
