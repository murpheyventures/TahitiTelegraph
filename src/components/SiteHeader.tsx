import { Masthead } from "./Masthead";

function formatAsOf(asOf?: string): string | null {
  if (!asOf) return null;
  const d = new Date(asOf);
  if (Number.isNaN(d.getTime())) return asOf;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function SiteHeader({
  kicker,
  title,
  summary,
  asOf,
}: {
  kicker: string;
  title: string;
  summary?: string;
  asOf?: string;
}) {
  const asOfLabel = formatAsOf(asOf);
  return (
    <header className="border-b border-border bg-surface/60">
      <div className="mx-auto w-full max-w-6xl px-5">
        <Masthead />
        <div className="py-9">
          <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary">
            {kicker}
          </p>
          <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.06] tracking-tight text-fg sm:text-5xl">
            {title}
          </h1>
          {summary ? <p className="mt-4 max-w-2xl text-lg text-muted">{summary}</p> : null}
          {asOfLabel ? (
            <div className="mt-7 flex items-center justify-end border-t border-border pt-4">
              <span className="text-[0.7rem] font-medium uppercase tracking-wider text-faint">
                As of {asOfLabel}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
