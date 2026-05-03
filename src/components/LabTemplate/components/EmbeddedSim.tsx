import type { PhaseId } from "@/content/types";
import { Simulation } from "@/components/Simulation";

interface EmbeddedSimProps {
  phaseId: PhaseId;
  simulationId?: string;
  embedIn: PhaseId[];
}

export default function EmbeddedSim({ phaseId, simulationId, embedIn }: EmbeddedSimProps) {
  if (!simulationId || !embedIn.includes(phaseId)) return null;
  return (
    <div className="mt-2">
      <Simulation simulationId={simulationId} />
    </div>
  );
}
