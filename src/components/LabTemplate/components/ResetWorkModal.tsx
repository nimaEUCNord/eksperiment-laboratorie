interface ResetWorkModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ResetWorkModal({ open, onCancel, onConfirm }: ResetWorkModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-sm mx-4 p-6">
        <h3 className="text-lg font-semibold text-slate-900">Nulstil arbejde?</h3>
        <p className="mt-2 text-sm text-slate-600">
          Er du sikker på, at du vil slette alt dit arbejde? Dette kan ikke fortrydes.
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Annuller
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600"
          >
            Nulstil
          </button>
        </div>
      </div>
    </div>
  );
}
