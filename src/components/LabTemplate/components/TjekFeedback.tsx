import PhaseLockHint from "./PhaseLockHint";

interface TjekFeedbackProps {
  status: "wrong" | "correct" | null;
  message: string;
  attemptsLeft?: number;
  counter?: { current: number; total: number; label: string };
}

export default function TjekFeedback({ status, message, attemptsLeft, counter }: TjekFeedbackProps) {
  if (!status) return null;

  if (status === "correct") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
        <p className="text-sm text-emerald-700">✓ {message}</p>
      </div>
    );
  }

  return (
    <PhaseLockHint
      counter={counter}
      messages={[message]}
      attemptsLeft={attemptsLeft}
    />
  );
}
