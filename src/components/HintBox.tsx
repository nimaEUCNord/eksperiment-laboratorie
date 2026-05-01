interface HintBoxProps {
  id: string;
  label: string;
  content: string;
  openHints: Set<string>;
  toggle: (id: string) => void;
}

export default function HintBox({ id, label, content, openHints, toggle }: HintBoxProps) {
  const open = openHints.has(id);
  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-white">
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-slate-700"
        onClick={() => toggle(id)}
        aria-expanded={open}
      >
        <span>💡 {label}</span>
        <span className="text-slate-400">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
          {content}
        </div>
      )}
    </div>
  );
}
