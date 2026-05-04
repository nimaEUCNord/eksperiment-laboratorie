interface TjekFeedbackProps {
  status: "wrong" | "correct" | null;
  message: string;
  attemptsLeft?: number;
}

export default function TjekFeedback({ status, message, attemptsLeft }: TjekFeedbackProps) {
  if (!status) return null;

  if (status === "correct") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
        <p className="text-sm text-emerald-700">✓ {message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="text-sm text-slate-800">💡 {message}</p>
      {attemptsLeft !== undefined && attemptsLeft > 0 && (
        <p className="mt-1 text-xs text-slate-500">{attemptsLeft} forsøg tilbage</p>
      )}
    </div>
  );
}
