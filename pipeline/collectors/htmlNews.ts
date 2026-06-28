// Generic HTML news-page collector: crawl a listing page for article links,
// fetch each article for a clean title + body, store as articles. Used for
// official/airline sites that have no RSS but do server-render article links.
//
// Air Tahiti (403 to plain fetch) and Air Moana (no static news page) are not
// wired here yet; their route news flows through the local feeds. Both are
// headless-crawl candidates (permitted for personal use, see README Access policy).

import * as cheerio from "cheerio";
import { and, eq } from "drizzle-orm";
import { db, schema } from "../../db/client";
import { BROWSER_UA, politeFetch, sleep } from "../lib/http";
import { resolveIslands } from "../lib/geo";

export interface NewsSite {
  id: string; // sources row id
  listUrl: string;
  base: string; // origin for resolving relative hrefs
  linkMatch: RegExp; // href test selecting article links
  lang: string;
  max?: number;
}

export const NEWS_SITES: NewsSite[] = [
  {
    id: "air-tahiti-nui-corp",
    listUrl: "https://us.airtahitinui.com/news",
    base: "https://us.airtahitinui.com",
    linkMatch: /\/news\/corporate\//i, // routes, codeshare, capacity, awards
    lang: "en",
    max: 8,
  },
];

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const isJunk = (t: string) => !t || /[<>]/.test(t) || /img|data-tf/i.test(t);

async function fetchArticle(url: string): Promise<{ title: string | null; body: string | null }> {
  try {
    const html = await politeFetch(url, { ua: BROWSER_UA, timeoutMs: 20000 });
    const $ = cheerio.load(html);
    let title = clean($("h1").first().text());
    if (isJunk(title)) title = clean($("title").first().text()).replace(/\s*[-|–][^-|–]*$/, "");
    $("script, style, noscript, nav, header, footer").remove();
    const sels = [".field--name-body", ".node__content", ".entry-content", ".content", "article", "main"];
    let best = "";
    for (const s of sels) {
      const t = clean($(s).text());
      if (t.length > best.length) best = t;
    }
    if (best.length < 200) best = clean($("p").map((_, p) => $(p).text()).get().join(" "));
    return { title: title && !isJunk(title) ? title : null, body: best ? best.slice(0, 5000) : null };
  } catch {
    return { title: null, body: null };
  }
}

export interface CollectResult {
  source: string;
  seen: number;
  added: number;
  error?: string;
}

export async function collectNewsSite(site: NewsSite, opts: { dryRun?: boolean } = {}): Promise<CollectResult> {
  const result: CollectResult = { source: site.id, seen: 0, added: 0 };

  let html: string;
  try {
    html = await politeFetch(site.listUrl, { ua: BROWSER_UA, timeoutMs: 20000 });
  } catch (e) {
    result.error = e instanceof Error ? e.message : String(e);
    return result;
  }

  const $ = cheerio.load(html);
  const hrefs = new Set<string>();
  $("a").each((_, a) => {
    let href = ($(a).attr("href") ?? "").trim();
    if (!href) return;
    if (href.startsWith("/")) href = site.base + href;
    if (href.startsWith("http") && site.linkMatch.test(href)) hrefs.add(href);
  });

  for (const url of [...hrefs].slice(0, site.max ?? 8)) {
    result.seen++;
    if (opts.dryRun) {
      result.added++;
      continue;
    }
    const dup = await db
      .select({ id: schema.articles.id })
      .from(schema.articles)
      .where(and(eq(schema.articles.sourceId, site.id), eq(schema.articles.url, url)))
      .limit(1);
    if (dup.length) continue;

    const art = await fetchArticle(url);
    await sleep(800);
    if (!art.title && !art.body) continue;

    const islands = resolveIslands(art.title ?? "", art.body ?? "");
    await db.insert(schema.articles).values({
      sourceId: site.id,
      url,
      title: art.title ?? "(untitled)",
      body: art.body,
      lang: site.lang,
      islands: islands.length ? islands : ["territory"],
    });
    result.added++;
  }

  if (!opts.dryRun) {
    await db.insert(schema.ingestionRuns).values({
      sourceId: site.id,
      status: result.error ? "partial" : "ok",
      finishedAt: new Date(),
      itemsSeen: result.seen,
      itemsNew: result.added,
      error: result.error ?? null,
    });
  }

  return result;
}
