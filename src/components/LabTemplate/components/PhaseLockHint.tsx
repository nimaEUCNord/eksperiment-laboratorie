interface PhaseLockHintProps {
  counter?: { current: number; total: number; label: string };
  messages?: string[];
  attemptsLeft?: number;
}

export default function PhaseLockHint({ counter, messages, attemptsLeft }: PhaseLockHintProps) {
  const showOrange = !!messages && messages.length > 0;
  if (!counter && !showOrange) return null;
  return (
    <div className="text-sm text-slate-600">
      {counter && (
        <p>
          {counter.label}: <strong>{counter.current}</strong> / {counter.total}
        </p>
      )}
      {showOrange && (
        <div className="mt-1 space-y-1 text-amber-600">
          {messages!.map((m, i) => (
            <p key={i}>{m}</p>
          ))}
        </div>
      )}
      {attemptsLeft !== undefined && attemptsLeft > 0 && (
        <p className="mt-1 text-xs text-slate-500">{attemptsLeft} forsøg tilbage</p>
      )}
    </div>
  );
}
