import Link from "next/link";
import { getAccent } from "@/lib/accent";
import type { AccentColor, Lab } from "@/content/types";

export function LabCard({
  lab,
  topicSlug,
  accentColor,
  index,
}: {
  lab: Lab;
  topicSlug: string;
  accentColor: AccentColor;
  index: number;
}) {
  const accent = getAccent(accentColor);
  return (
    <Link
      href={`/emner/${topicSlug}/${lab.slug}`}
      className={`group flex h-full flex-col gap-3 rounded-xl border ${accent.border} ${accent.hoverBorder} bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid h-8 w-8 place-items-center rounded-lg ${accent.bgSoft} ${accent.text} text-sm font-semibold`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Forsøg
        </span>
      </div>

      <h3 className="text-lg font-semibold text-slate-900">{lab.title}</h3>
      <p className="text-sm text-slate-600">{lab.shortDescription}</p>

      <span className={`mt-auto pt-2 text-sm font-medium ${accent.text} group-hover:underline`}>
        Åbn forsøget →
      </span>
    </Link>
  );
}
