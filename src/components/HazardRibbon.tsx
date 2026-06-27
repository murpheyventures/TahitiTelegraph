import type { AdvisoryView, WeatherAlertView } from "@/lib/types";
import { getIsland } from "@/lib/islands";

const VIG_COLOR: Record<string, string> = {
  green: "var(--color-vig-green)",
  yellow: "var(--color-vig-yellow)",
  orange: "var(--color-vig-orange)",
  red: "var(--color-vig-red)",
};

const VIG_RANK: Record<string, number> = { green: 0, yellow: 1, orange: 2, red: 3 };

/**
 * Sober, high-contrast safety strip: Météo-France vigilance + foreign-government
 * travel advisories. Deliberately undecorated — accuracy over theme. Always
 * links to the official source; never restates a bulletin as authoritative.
 */
export function HazardRibbon({
  alerts,
  advisories,
}: {
  alerts: WeatherAlertView[];
  advisories: AdvisoryView[];
}) {
  if (!alerts.length && !advisories.length) return null;

  const top = [...alerts].sort(
    (a, b) => (VIG_RANK[b.vigilanceLevel ?? "green"] ?? 0) - (VIG_RANK[a.vigilanceLevel ?? "green"] ?? 0)
  )[0];
  const topColor = top ? VIG_COLOR[top.vigilanceLevel ?? "green"] ?? "var(--color-faint)" : "var(--color-border)";
  const elevated = top && (VIG_RANK[top.vigilanceLevel ?? "green"] ?? 0) >= 2;

  return (
    <section
      className="rounded-[var(--radius-card)] border bg-surface/80 px-4 py-3"
      style={{ borderColor: elevated ? topColor : "var(--color-border)" }}
      aria-label="Current safety status"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.82rem]">
        <span className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-faint">
          Safety status
        </span>

        {alerts.map((a) => {
          const island = a.island ? getIsland(a.island)?.name ?? a.island : "Territory";
          const known = a.vigilanceLevel ? VIG_COLOR[a.vigilanceLevel] : undefined;
          const color = known ?? "var(--color-faint)";
          return (
            <span key={a.id} className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-muted">
                {island}: <span className="text-fg">{a.hazardType}</span>{" "}
                {known ? (
                  <span style={{ color }}>{a.vigilanceLevel}</span>
                ) : (
                  <span className="text-faint">see official</span>
                )}
              </span>
              {a.url ? (
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-faint hover:text-primary">
                  ↗
                </a>
              ) : null}
            </span>
          );
        })}

        {advisories.map((adv) => (
          <span key={adv.id} className="inline-flex items-center gap-1.5 text-muted">
            <span className="text-[0.66rem] uppercase tracking-wide text-faint">
              {adv.sourceId === "smartraveller" ? "AU" : adv.sourceId === "travel-gc-ca" ? "CA" : adv.sourceId}
            </span>
            <a href={adv.url ?? "#"} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary">
              {adv.level}
            </a>
          </span>
        ))}
      </div>
    </section>
  );
}
