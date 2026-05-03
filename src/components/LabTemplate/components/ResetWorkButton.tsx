interface ResetWorkButtonProps {
  onClick: () => void;
}

export default function ResetWorkButton({ onClick }: ResetWorkButtonProps) {
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
