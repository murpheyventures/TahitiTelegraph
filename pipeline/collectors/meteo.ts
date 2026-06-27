// Météo-France Polynésie vigilance collector.
//
// The current level on meteo.pf is injected client-side (Drupal + JS), so the
// static HTML usually doesn't expose it. We therefore:
//   - detect a server-rendered ACTIVE alert if one is present (defensive), and
//   - otherwise store an explicit "see official" status (NEVER a fabricated
//     green), with the link, so the ribbon points users to the source.
// Live level parsing is Phase 2 (headless render or the AJAX/data endpoint).

import { eq } from "drizzle-orm";
import { db, schema } from "../../db/client";
import { BROWSER_UA, politeFetch } from "../lib/http";

export interface CollectResult {
  source: string;
  level?: string | null;
  detected: boolean;
  error?: string;
  note?: string;
}

const VIGILANCE_URL = "https://meteo.pf/fr/vigilance";

// meteo.pf level codes → {ribbon colour, hazard type, French label}
const LEVEL_MAP: Record<string, { level: string; hazard: string; label: string }> = {
  "1": { level: "green", hazard: "vigilance", label: "Pas de vigilance particulière" },
  "1_5": { level: "green", hazard: "vigilance", label: "Restez prudent" },
  "2": { level: "yellow", hazard: "vigilance", label: "Soyez attentif" },
  "3": { level: "orange", hazard: "vigilance", label: "Soyez très vigilant" },
  "4": { level: "red", hazard: "vigilance", label: "Une vigilance absolue s'impose" },
  "5": { level: "red", hazard: "cyclone", label: "Confinez-vous" },
  "7": { level: "orange", hazard: "cyclone", label: "Pré-alerte cyclonique" },
  "8": { level: "orange", hazard: "cyclone", label: "Alerte cyclonique orange" },
  "9": { level: "red", hazard: "cyclone", label: "Alerte cyclonique rouge" },
  "10": { level: "red", hazard: "cyclone", label: "Alerte cyclonique violette" },
};

/** Return the active level code if a vigilance_level_N element is rendered without `hidden`. */
function detectActive(html: string): string | null {
  const re = /<p[^>]*class="([^"]*\bvigilance_level_([0-9_]+)\b[^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (!/\bhidden\b/.test(m[1])) return m[2];
  }
  return null;
}

export async function collectMeteo(opts: { dryRun?: boolean } = {}): Promise<CollectResult> {
  const dryRun = !!opts.dryRun;
  let html: string;
  try {
    html = await politeFetch(VIGILANCE_URL, { ua: BROWSER_UA });
  } catch (e) {
    return { source: "meteo-france-pf", detected: false, error: e instanceof Error ? e.message : String(e) };
  }

  const code = detectActive(html);
  const mapped = code ? LEVEL_MAP[code] : undefined;
  const vigilanceLevel = mapped?.level ?? null; // null => "see official", not green
  const hazard = mapped?.hazard ?? "vigilance";
  const note = mapped
    ? `active: ${mapped.label} (level ${code})`
    : "level not in static HTML — stored 'see official' (link only)";

  if (!dryRun) {
    await db.delete(schema.weatherAlerts).where(eq(schema.weatherAlerts.sourceId, "meteo-france-pf"));
    await db.insert(schema.weatherAlerts).values({
      sourceId: "meteo-france-pf",
      island: "territory",
      hazardType: hazard,
      vigilanceLevel, // null when undeterminable
      issuedAt: new Date(),
      status: "active",
      url: VIGILANCE_URL,
    });
    await db
      .insert(schema.ingestionRuns)
      .values({ sourceId: "meteo-france-pf", status: "ok", finishedAt: new Date(), itemsSeen: 1, itemsNew: 1 });
  }

  return { source: "meteo-france-pf", level: vigilanceLevel, detected: !!mapped, note };
}
