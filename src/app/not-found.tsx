import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        404
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-slate-900">Siden blev ikke fundet</h1>
      <p className="mt-3 text-slate-600">
        Den side, du leder efter, findes ikke. Måske er den på vej.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Tilbage til forsiden
      </Link>
    </div>
  );
}
