// Travel-advisory collectors (Phase 1, scaffolded).
//
// Intent: read the current advisory LEVEL for French Polynesia from Smartraveller
// (AU) and travel.gc.ca (CA), detect changes vs the stored level, and upsert
// travel_advisories. travel.gc.ca also exposes RSS/open data — prefer that.
//
// Stubbed today (seed provides the baseline levels); confirm the source feed /
// selector on first real run.

export interface CollectResult {
  source: string;
  seen: number;
  added: number;
  error?: string;
  note?: string;
}

export async function collectAdvisories(opts: { dryRun?: boolean } = {}): Promise<CollectResult> {
  void opts;
  return {
    source: "advisories",
    seen: 0,
    added: 0,
    note: "stub — wire travel.gc.ca RSS/open-data + Smartraveller level + change detection",
  };
}
