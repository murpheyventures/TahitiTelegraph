// Travel-advisory collectors: Canada (Global Affairs open-data JSON) and
// Smartraveller (AU). Keeps one current row per source, capturing the prior
// level so the analysis layer can flag changes.

import { desc, eq } from "drizzle-orm";
import { db, schema } from "../../db/client";
import { BROWSER_UA, politeFetch } from "../lib/http";

export interface CollectResult {
  source: string;
  level?: string;
  changed?: boolean;
  error?: string;
  note?: string;
}

const CANADA_JSON = "https://data.international.gc.ca/travel-voyage/index-alpha-eng.json";
const CANADA_PAGE = "https://travel.gc.ca/destinations/french-polynesia";
const SR_URL = "https://www.smartraveller.gov.au/destinations/pacific/french-polynesia";

// Canada advisory-state → label fallback (the JSON usually carries advisory-text).
const CA_STATE_LABEL: Record<number, string> = {
  0: "Take normal security precautions",
  1: "Take normal security precautions",
  2: "Exercise a high degree of caution",
  3: "Avoid non-essential travel",
  4: "Avoid all travel",
};

const SR_PHRASES = [
  "Do not travel",
  "Reconsider your need to travel",
  "Exercise a high degree of caution",
  "Exercise normal safety precautions",
];

async function upsert(
  sourceId: string,
  level: string,
  summary: string | null,
  updatedAt: Date | null,
  url: string,
  dryRun: boolean
): Promise<boolean> {
  const [prev] = await db
    .select()
    .from(schema.travelAdvisories)
    .where(eq(schema.travelAdvisories.sourceId, sourceId))
    .orderBy(desc(schema.travelAdvisories.retrievedAt))
    .limit(1);
  const changed = prev ? prev.level !== level : true;
  if (dryRun) return changed;

  // one current row per source; carry the prior level forward
  await db.delete(schema.travelAdvisories).where(eq(schema.travelAdvisories.sourceId, sourceId));
  await db.insert(schema.travelAdvisories).values({
    sourceId,
    level,
    prevLevel: prev?.level ?? null,
    updatedAt,
    summary,
    url,
  });

  // record a run for /sources health
  const [run] = await db
    .insert(schema.ingestionRuns)
    .values({ sourceId, status: "ok", finishedAt: new Date(), itemsSeen: 1, itemsNew: changed ? 1 : 0 })
    .returning({ id: schema.ingestionRuns.id });
  void run;
  return changed;
}

async function collectCanada(dryRun: boolean): Promise<CollectResult> {
  try {
    const j = JSON.parse(await politeFetch(CANADA_JSON));
    const pf = (j.data ?? j)["PF"];
    if (!pf) return { source: "travel-gc-ca", error: "PF entry not found in JSON" };
    const state: number = pf["advisory-state"];
    const level: string = pf.eng?.["advisory-text"] ?? CA_STATE_LABEL[state] ?? `Risk level ${state}`;
    const dateStr: string | undefined = pf["date-published"]?.date;
    const updatedAt = dateStr ? new Date(dateStr.replace(" ", "T")) : null;
    const summary = pf.eng?.["recent-updates"] ?? `Risk level ${state}`;
    const changed = await upsert("travel-gc-ca", level, summary, updatedAt, CANADA_PAGE, dryRun);
    return { source: "travel-gc-ca", level, changed };
  } catch (e) {
    return { source: "travel-gc-ca", error: e instanceof Error ? e.message : String(e) };
  }
}

async function collectSmartraveller(dryRun: boolean): Promise<CollectResult> {
  try {
    const html = await politeFetch(SR_URL, { ua: BROWSER_UA });
    const colour = html.match(/Travel advice level\s+(GREEN|YELLOW|ORANGE|RED)/i)?.[1]?.toUpperCase();
    const phrase = SR_PHRASES.find((p) => html.includes(p));
    if (!phrase && !colour) return { source: "smartraveller", error: "advice level not found on page" };
    const level = phrase ?? `Level ${colour}`;
    const summary = colour ? `Advice level ${colour}` : null;
    const changed = await upsert("smartraveller", level, summary, new Date(), SR_URL, dryRun);
    return { source: "smartraveller", level, changed };
  } catch (e) {
    return { source: "smartraveller", error: e instanceof Error ? e.message : String(e) };
  }
}

export async function collectAdvisories(opts: { dryRun?: boolean } = {}): Promise<CollectResult[]> {
  const dryRun = !!opts.dryRun;
  return [await collectCanada(dryRun), await collectSmartraveller(dryRun)];
}
