// Aéroport de Tahiti-Faa'a (ADT) collector. Captures the latest traffic press
// releases (monthly passenger figures = a tourism demand proxy) and now fetches
// each article body so the analysis layer can synthesize real Air Access pulses.
// Enriches existing headline-only rows in place. Best-effort; numbers are prose.

import * as cheerio from "cheerio";
import { and, eq } from "drizzle-orm";
import { db, schema } from "../../db/client";
import { BROWSER_UA, politeFetch, sleep } from "../lib/http";

const ADT_URL = "https://tahiti-aeroports.com/";
const TRAFFIC_RE = /trafic|passager|fr[eé]quentation|record|envol|a[eé]rien/i;
const BODY_SELECTORS = [
  ".entry-content",
  ".elementor-widget-theme-post-content",
  ".post-content",
  "article",
  "main",
];

export interface CollectResult {
  source: string;
  seen: number;
  added: number;
  error?: string;
}

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

const isJunkTitle = (t: string) => !t || /[<>]/.test(t) || /img|data-tf/i.test(t);

/** Fetch an ADT article page; extract a clean title + the main content text. */
async function fetchArticle(url: string): Promise<{ title: string | null; body: string | null }> {
  try {
    const html = await politeFetch(url, { ua: BROWSER_UA, timeoutMs: 20000 });
    const $ = cheerio.load(html);

    // Title: prefer the page <h1>, fall back to <title> (strip the site-name suffix).
    let title = clean($("h1").first().text());
    if (isJunkTitle(title)) {
      title = clean($("title").first().text()).replace(/\s*[-|–][^-|–]*$/, "");
    }

    $("script, style, noscript, nav, header, footer, .elementor-widget-nav-menu").remove();
    let best = "";
    for (const sel of BODY_SELECTORS) {
      const t = clean($(sel).text());
      if (t.length > best.length) best = t;
    }
    if (best.length < 200) {
      best = clean($("p").map((_, p) => $(p).text()).get().join(" "));
    }
    return { title: title && !isJunkTitle(title) ? title : null, body: best ? best.slice(0, 5000) : null };
  } catch {
    return { title: null, body: null };
  }
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

    const [existing] = await db
      .select({ id: schema.articles.id, body: schema.articles.body, title: schema.articles.title })
      .from(schema.articles)
      .where(and(eq(schema.articles.sourceId, "adt-airport"), eq(schema.articles.url, l.href)))
      .limit(1);
    const needsWork = !existing || !existing.body || isJunkTitle(existing.title);
    if (existing && !needsWork) continue; // already enriched + clean title

    const art = await fetchArticle(l.href);
    await sleep(800); // polite between article fetches
    const title = art.title ?? (!isJunkTitle(l.text) ? l.text : "ADT traffic update");

    if (existing) {
      await db
        .update(schema.articles)
        .set({ title, body: art.body ?? existing.body, tagged: false })
        .where(eq(schema.articles.id, existing.id));
    } else {
      await db.insert(schema.articles).values({
        sourceId: "adt-airport",
        url: l.href,
        title,
        body: art.body,
        lang: "fr",
        islands: ["tahiti"],
      });
    }
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
