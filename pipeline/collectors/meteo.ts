// Météo-France Polynésie vigilance collector (Phase 1, scaffolded).
//
// Intent: fetch https://meteo.pf/fr/vigilance and /fr/cyclone, parse the CURRENT
// vigilance level per zone, and upsert weather_alerts as a STATUS FLAG + link —
// never store/restate the bulletin text (copyright + safety). On any change,
// the analysis layer emits a topic_alert.
//
// The page structure must be confirmed before wiring real selectors, so this is
// intentionally a no-op stub today; the seed provides a sample green status.

export interface CollectResult {
  source: string;
  seen: number;
  added: number;
  error?: string;
  note?: string;
}

export async function collectMeteo(opts: { dryRun?: boolean } = {}): Promise<CollectResult> {
  void opts;
  return {
    source: "meteo-france-pf",
    seen: 0,
    added: 0,
    note: "stub — confirm meteo.pf/fr/vigilance DOM, then store level+zone+link (not bulletin text)",
  };
}
