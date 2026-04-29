import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LabCard } from "@/components/LabCard";
import { getAccent } from "@/lib/accent";
import { getAllTopics, getTopic } from "@/lib/content";

type Params = { topic: string };

export function generateStaticParams(): Params[] {
  return getAllTopics().map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { topic: topicSlug } = await params;
  const topic = getTopic(topicSlug);
  if (!topic) return {};
  return {
    title: topic.title,
    description: topic.description,
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { topic: topicSlug } = await params;
  const topic = getTopic(topicSlug);
  if (!topic) notFound();

  const accent = getAccent(topic.accentColor);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Topic header */}
      <section className={`rounded-2xl bg-gradient-to-br ${accent.gradient} mt-10 p-8 sm:mt-12 sm:p-12`}>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          ← Forsiden
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${accent.bg}`} aria-hidden />
          <span className={`text-xs font-semibold uppercase tracking-wider ${accent.textSoft}`}>
            Emne
          </span>
        </div>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900 sm:text-5xl">
          {topic.title}
        </h1>
        <p className="mt-2 text-lg text-slate-600">{topic.tagline}</p>
        <p className="mt-6 max-w-3xl text-slate-700">{topic.description}</p>
      </section>

      {/* Labs */}
      <section className="py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Forsøg</h2>
          <span className="text-sm text-slate-500">{topic.labs.length} forsøg</span>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {topic.labs.map((lab, i) => (
            <LabCard
              key={lab.slug}
              lab={lab}
              topicSlug={topic.slug}
              accentColor={topic.accentColor}
              index={i}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
