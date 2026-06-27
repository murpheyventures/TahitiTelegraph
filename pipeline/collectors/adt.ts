// Aéroport de Tahiti-Faa'a (ADT) collector. Captures the latest traffic press
// releases (monthly passenger figures = a tourism demand proxy) as articles,
// which the tagger classifies under air-access / airport-traffic. Headline-only
// (body fetched lazily later if needed). Best-effort; numbers are in prose.

import * as cheerio from "cheerio";
import { and, eq } from "drizzle-orm";
import { db, schema } from "../../db/client";
import { BROWSER_UA, politeFetch } from "../lib/http";

const ADT_URL = "https://tahiti-aeroports.com/";
const TRAFFIC_RE = /trafic|passager|fr[eé]quentation|record|envol|a[eé]rien/i;

export interface CollectResult {
  source: string;
  seen: number;
  added: number;
  error?: string;
}

export async function collectAdt(opts: { dryRun?: boolean } = {}): Promise<CollectResult> {
  const result: CollectResult = { source: "adt-airport", seen: 0, added: 0 };

  let html: string;
  try {
    html = await politeFetch(ADT_URL, { ua: BROWSER_UA });
  } catch (e) {
    result.error = e instanceof Error ? e.message : String(e);
    return result;
  }

  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const links = $("a")
    .toArray()
    .map((a) => ({ href: ($(a).attr("href") ?? "").trim(), text: $(a).text().trim() }))
    .filter((l) => l.href.startsWith("http") && l.text.length > 12 && TRAFFIC_RE.test(l.text));

  for (const l of links.slice(0, 6)) {
    if (seen.has(l.href)) continue;
    seen.add(l.href);
    result.seen++;
    if (opts.dryRun) {
      result.added++;
      continue;
    }
    const dup = await db
      .select({ id: schema.articles.id })
      .from(schema.articles)
      .where(and(eq(schema.articles.sourceId, "adt-airport"), eq(schema.articles.url, l.href)))
      .limit(1);
    if (dup.length) continue;

    await db.insert(schema.articles).values({
      sourceId: "adt-airport",
      url: l.href,
      title: l.text,
      body: null,
      lang: "fr",
      islands: ["tahiti"],
    });
    result.added++;
  }

  if (!opts.dryRun) {
    await db.insert(schema.ingestionRuns).values({
      sourceId: "adt-airport",
      status: result.error ? "partial" : "ok",
      finishedAt: new Date(),
      itemsSeen: result.seen,
      itemsNew: result.added,
      error: result.error ?? null,
    });
  }

  return result;
}
