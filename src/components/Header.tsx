import Link from "next/link";
import { getAllTopics } from "@/lib/content";

export function Header() {
  const topics = getAllTopics();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-white text-lg font-semibold transition group-hover:bg-slate-700">
            HX
          </span>
          <span className="hidden text-base font-semibold text-slate-900 sm:inline">
            HTXLabs
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            Forsiden
          </Link>

          {/* Compact link on small/medium screens */}
          <Link
            href="/#emner"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            Emner
          </Link>

          {/* Full list on large screens */}
          <div className="hidden items-center gap-1 lg:flex">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/emner/${topic.slug}`}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                {topic.title}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
