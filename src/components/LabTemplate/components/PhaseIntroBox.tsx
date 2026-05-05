import type { AccentClasses } from "@/lib/accent";

export type PhaseIntroContent = {
  heading: string;
  body: string | string[];
};

type Props = {
  accent: AccentClasses;
  content: PhaseIntroContent;
};

export default function PhaseIntroBox({ accent, content }: Props) {
  return (
    <div className={`rounded-xl border ${accent.border} ${accent.bgSoft} p-4 text-sm text-slate-700`}>
      <p className="font-medium text-slate-800">{content.heading}</p>
      {Array.isArray(content.body) ? (
        <ol className="mt-3 list-decimal list-inside space-y-2 text-slate-600">
          {content.body.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-slate-600">{content.body}</p>
      )}
    </div>
  );
}
