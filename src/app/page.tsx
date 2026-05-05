import { TopicCard } from "@/components/TopicCard";
import { getAllTopics } from "@/lib/content";

export default function HomePage() {
  const topics = getAllTopics();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
            Fysik · HTX
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            HTXLabs
          </h1>
          <p className="mt-4 text-lg text-slate-600 sm:text-xl">
            Forsøg og interaktive simulationer til fysikundervisningen. Vælg et
            emne, åbn et forsøg og bliv klogere ved at lege med modellen.
          </p>
        </div>
      </section>

      {/* Topics */}
      <section id="emner" className="scroll-mt-20 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Emner</h2>
          <span className="text-sm text-slate-500">{topics.length} emner</span>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <TopicCard key={topic.slug} topic={topic} />
          ))}
        </div>
      </section>

      {/* How to use */}
      <section className="rounded-2xl bg-slate-50 p-8 sm:p-10">
        <h2 className="text-2xl font-semibold text-slate-900">
          Sådan bruger du siden
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Step
            n={1}
            title="Vælg et emne"
            body="Start med at klikke på et af emnerne ovenfor for at se de forsøg, der hører til."
          />
          <Step
            n={2}
            title="Åbn et forsøg"
            body="Hvert forsøg har en kort beskrivelse, et formål og de centrale begreber, du skal kende."
          />
          <Step
            n={3}
            title="Leg med simulationen"
            body="Tryk, træk og ændr på tallene. Mærk hvordan fysikken opfører sig, før du går i laboratoriet."
          />
        </div>
      </section>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div>
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-white text-sm font-semibold">
        {n}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
    </div>
  );
}
