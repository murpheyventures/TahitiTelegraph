// Generic RSS collector. Writes raw_items (provenance) + articles (normalized),
// deduping on a content hash. Full body is stored — personal-use scope.
//
// NOTE: feed URLs are best-effort and must be confirmed on first real run.
// Tahiti Infos runs a custom CMS; the others are WordPress (/feed/).

import Parser from "rss-parser";
import { and, eq } from "drizzle-orm";
import { db, schema } from "../../db/client";
import { USER_AGENT, contentHash } from "../lib/http";
import { resolveIslands } from "../lib/geo";

export interface RssSource {
  id: string; // must match a row in `sources`
  feedUrl: string;
}

export const RSS_FEEDS: RssSource[] = [
  { id: "radio1", feedUrl: "https://www.radio1.pf/feed/" },
  { id: "tahitinews-co", feedUrl: "https://www.tahitinews.co/feed/" },
  { id: "tntv", feedUrl: "https://www.tntv.pf/feed/" },
  { id: "tahiti-infos", feedUrl: "https://www.tahiti-infos.com/spip.php?page=backend" },
];

const parser = new Parser({
  headers: { "User-Agent": USER_AGENT },
  timeout: 15000,
});

export interface CollectResult {
  source: string;
  feedUrl: string;
  seen: number;
  added: number;
  error?: string;
}

export async function collectRss(
  src: RssSource,
  opts: { dryRun?: boolean } = {}
): Promise<CollectResult> {
  const result: CollectResult = { source: src.id, feedUrl: src.feedUrl, seen: 0, added: 0 };

  let feed: Awaited<ReturnType<typeof parser.parseURL>>;
  try {
    feed = await parser.parseURL(src.feedUrl);
  } catch (e) {
    result.error = e instanceof Error ? e.message : String(e);
    return result;
  }

  const items = feed.items ?? [];
  result.seen = items.length;

  let runId: string | undefined;
  if (!opts.dryRun) {
    const [run] = await db
      .insert(schema.ingestionRuns)
      .values({ sourceId: src.id, status: "running" })
      .returning({ id: schema.ingestionRuns.id });
    runId = run.id;
  }

  try {
    for (const it of items) {
      const url = it.link ?? "";
      const title = it.title ?? "(untitled)";
      const hash = contentHash(it.guid ?? url, title);
      const body = (it as { content?: string })["content"] ?? it.contentSnippet ?? null;
      const publishedAt = it.isoDate ? new Date(it.isoDate) : null;
      const islands = resolveIslands(title, it.contentSnippet ?? body);

      if (opts.dryRun) {
        result.added++; // count as "would add"
        continue;
      }

      const dup = await db
        .select({ id: schema.rawItems.id })
        .from(schema.rawItems)
        .where(and(eq(schema.rawItems.sourceId, src.id), eq(schema.rawItems.contentHash, hash)))
        .limit(1);
      if (dup.length) continue;

      const [raw] = await db
        .insert(schema.rawItems)
        .values({
          sourceId: src.id,
          runId,
          url,
          contentHash: hash,
          title,
          rawText: body,
          publishedAt,
          lang: "fr",
          payload: it as unknown as object,
        })
        .returning({ id: schema.rawItems.id });

      await db.insert(schema.articles).values({
        sourceId: src.id,
        rawItemId: raw.id,
        url,
        title,
        body,
        publishedAt,
        lang: "fr",
        islands,
      });
      result.added++;
    }

    if (runId) {
      await db
        .update(schema.ingestionRuns)
        .set({ finishedAt: new Date(), status: "ok", itemsSeen: result.seen, itemsNew: result.added })
        .where(eq(schema.ingestionRuns.id, runId));
    }
  } catch (e) {
    result.error = e instanceof Error ? e.message : String(e);
    if (runId) {
      await db
        .update(schema.ingestionRuns)
        .set({ finishedAt: new Date(), status: "failed", error: result.error })
        .where(eq(schema.ingestionRuns.id, runId));
    }
  }

  return result;
}
