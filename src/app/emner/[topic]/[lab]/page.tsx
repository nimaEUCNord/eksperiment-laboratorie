import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Simulation } from "@/components/Simulation";
import { getAccent } from "@/lib/accent";
import { getAllTopics, getLab } from "@/lib/content";
import type { Lab } from "@/content/types";

type Params = { topic: string; lab: string };

export function generateStaticParams(): Params[] {
  return getAllTopics().flatMap((topic) =>
    topic.labs.map((lab) => ({ topic: topic.slug, lab: lab.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { topic: topicSlug, lab: labSlug } = await params;
  const found = getLab(topicSlug, labSlug);
  if (!found) return {};
  return {
    title: `${found.lab.title} · ${found.topic.title}`,
    description: found.lab.shortDescription,
  };
}

export default async function LabPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { topic: topicSlug, lab: labSlug } = await params;
  const found = getLab(topicSlug, labSlug);
  if (!found) notFound();
  const { topic, lab } = found;
  const accent = getAccent(topic.accentColor);
  const isFleshedOut = hasFullContent(lab);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <div className="pt-10 sm:pt-12">
        <Link
          href={`/emner/${topic.slug}`}
          className={`inline-flex items-center gap-1 text-sm ${accent.text} hover:underline`}
        >
          ← {topic.title}
        </Link>
      </div>

      <header className="mt-4">
        <span className={`text-xs font-semibold uppercase tracking-wider ${accent.textSoft}`}>
          Forsøg
        </span>
        <h1 className="mt-2 text-4xl font-semibold text-slate-900 sm:text-5xl">
          {lab.title}
        </h1>
        <p className="mt-3 text-lg text-slate-600">{lab.shortDescription}</p>
      </header>

      {lab.goal ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Formål</h2>
          <p className="mt-2 text-slate-700">{lab.goal}</p>
        </section>
      ) : null}

      {lab.keyConcepts && lab.keyConcepts.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">Centrale begreber</h2>
          <ul className="mt-3 space-y-2">
            {lab.keyConcepts.map((c) => (
              <li key={c} className="flex gap-3 text-slate-700">
                <span
                  className={`mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${accent.bg}`}
                  aria-hidden
                />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">Simulation</h2>
        <p className="mt-2 text-sm text-slate-600">
          Træk i skyderne og se, hvordan banen ændrer sig. Animationen starter
          forfra, hver gang du justerer en parameter.
        </p>
        <div className="mt-4">
          <Simulation simulationId={lab.simulationId} />
        </div>
      </section>

      {lab.theory && lab.theory.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Teori</h2>
          <div className="mt-3 space-y-4 text-slate-700">
            {lab.theory.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>
      ) : null}

      {!isFleshedOut ? (
        <section className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-6 text-slate-700">
          <h2 className="text-lg font-semibold text-slate-900">Under udarbejdelse</h2>
          <p className="mt-2 text-sm">
            Indholdet til dette forsøg – formål, fagbegreber og en interaktiv
            simulation – er på vej. Vi bygger forsøgene ud ét ad gangen.
          </p>
        </section>
      ) : null}
    </div>
  );
}

function hasFullContent(lab: Lab): boolean {
  return Boolean(lab.goal && lab.keyConcepts && lab.keyConcepts.length > 0);
}
