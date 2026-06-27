import type { PulseCard as PulseCardType } from "@/lib/types";
import { colorForTopic, domainForSubtag, getDomain } from "@/lib/taxonomy";
import { getIsland } from "@/lib/islands";
import { SignalBadge } from "./SignalBadge";
import { Citations } from "./Citations";
import { TiareMark } from "./Motifs";

const TREND_GLYPH: Record<string, string> = { up: "▲", down: "▼", flat: "▬" };

function domainLabel(slug?: string | null): string | null {
  if (!slug) return null;
  return getDomain(slug)?.labelEn ?? domainForSubtag(slug)?.labelEn ?? slug;
}

export function PulseCard({ card, showIsland = false }: { card: PulseCardType; showIsland?: boolean }) {
  const color = card.domain ? colorForTopic(card.domain) : "var(--color-primary)";
  const dLabel = domainLabel(card.domain);
  const island = showIsland && card.island ? getIsland(card.island) : undefined;

  return (
    <article
      className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-5 transition-colors hover:border-primary/40"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {dLabel ? (
            <span
              className="rounded-full px-2.5 py-0.5 text-[0.64rem] font-semibold uppercase tracking-wide"
              style={{ color, backgroundColor: `${color}1f` }}
            >
              {dLabel}
            </span>
          ) : null}
          {island ? (
            <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[0.64rem] font-medium text-muted">
              {island.name}
            </span>
          ) : null}
        </div>
        <SignalBadge signal={card.signal} />
      </div>

      <h3 className="font-serif text-lg font-medium leading-snug text-fg">
        {card.headline}
      </h3>

      <p className="text-[0.94rem] text-muted">{card.take}</p>

      {card.support?.kind === "metric" ? (
        <div className="flex items-baseline gap-2 border-l-2 border-primary/40 pl-3">
          <span className="font-serif text-3xl font-medium text-fg">{card.support.value}</span>
          {card.support.trend ? (
            <span className="text-sm text-faint">{TREND_GLYPH[card.support.trend]}</span>
          ) : null}
          <span className="text-[0.8rem] text-faint">{card.support.label}</span>
        </div>
      ) : null}

      {card.support?.kind === "quote" ? (
        <blockquote className="border-l-2 border-border pl-3 font-serif text-[1.02rem] italic leading-snug text-fg/85">
          “{card.support.text}”
          <footer className="mt-1.5 font-sans text-[0.78rem] not-italic text-faint">
            {card.support.attribution}
          </footer>
        </blockquote>
      ) : null}

      {card.whyItMatters ? (
        <div className="flex gap-2 rounded-md bg-surface-2/60 p-3">
          <TiareMark className="mt-0.5 h-3.5 w-3.5 shrink-0 text-coral" />
          <p className="text-[0.86rem] text-muted">
            <span className="font-semibold text-fg/80">Why it matters. </span>
            {card.whyItMatters}
          </p>
        </div>
      ) : null}

      {card.facts.length || card.interpretation.length ? (
        <details className="text-[0.82rem] text-muted">
          <summary className="cursor-pointer select-none text-faint hover:text-primary">
            Facts &amp; interpretation
          </summary>
          {card.facts.length ? (
            <div className="mt-2">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-faint">Facts</p>
              <ul className="mt-1 list-disc pl-5">
                {card.facts.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {card.interpretation.length ? (
            <div className="mt-2">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-faint">Interpretation</p>
              <ul className="mt-1 list-disc pl-5 italic text-faint">
                {card.interpretation.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </details>
      ) : null}

      <Citations citations={card.citations} />
    </article>
  );
}
