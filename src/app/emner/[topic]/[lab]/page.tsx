import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HookesLovInquiry } from "@/components/HookesLovInquiry";
import LabPageContent from "@/components/LabPageContent";
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

  const breadcrumb = (
    <div className="pt-10 sm:pt-12">
      <Link
        href={`/emner/${topic.slug}`}
        className={`inline-flex items-center gap-1 text-sm ${accent.text} hover:underline`}
      >
        ← {topic.title}
      </Link>
    </div>
  );

  const header = (
    <header className="mt-4">
      <span className={`text-xs font-semibold uppercase tracking-wider ${accent.textSoft}`}>
        Forsøg
      </span>
      <h1 className="mt-2 text-4xl font-semibold text-slate-900 sm:text-5xl">
        {lab.title}
      </h1>
      <p className="mt-3 text-lg text-slate-600">{lab.shortDescription}</p>
    </header>
  );

  if (lab.inquiry) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {breadcrumb}
        {header}
        <HookesLovInquiry accent={accent} />
        <div className="pb-16" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      {breadcrumb}
      {header}
      <LabPageContent lab={lab} accent={accent} />

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
