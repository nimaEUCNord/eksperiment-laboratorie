import Link from "next/link";
import { getAccent } from "@/lib/accent";
import type { Topic } from "@/content/types";

export function TopicCard({ topic }: { topic: Topic }) {
  const accent = getAccent(topic.accentColor);
  return (
    <Link
      href={`/emner/${topic.slug}`}
      className={`group relative flex flex-col gap-4 rounded-2xl border-2 ${accent.border} ${accent.hoverBorder} bg-gradient-to-br ${accent.gradient} p-6 transition hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <div className="flex items-center gap-3">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${accent.bg}`} aria-hidden />
        <span className={`text-xs font-semibold uppercase tracking-wider ${accent.textSoft}`}>
          Emne
        </span>
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-slate-900">{topic.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{topic.tagline}</p>
      </div>

      <p className="text-slate-700">{topic.description}</p>

      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-slate-500">{topic.labs.length} forsøg</span>
        <span className={`font-medium ${accent.text} group-hover:underline`}>
          Udforsk emnet →
        </span>
      </div>
    </Link>
  );
}
