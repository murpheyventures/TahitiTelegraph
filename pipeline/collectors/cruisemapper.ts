// CruiseMapper port-call collector → cruise_port_calls.
// robots.txt allows /ports (verified in the tourism audit). Proprietary
// aggregated schedule data: private monitoring only (review_required if public).
// Forward schedules change, so calls are stored with is_forward = true.

import * as cheerio from "cheerio";
import { and, eq } from "drizzle-orm";
import { db, schema } from "../../db/client";
import { BROWSER_UA, contentHash, politeFetch } from "../lib/http";

interface PortPage {
  port: string; // island/port slug
  url: string;
}

// Papeete URL is verified; add Bora Bora / Moorea / Raiatea port IDs once known.
export const CRUISE_PORTS: PortPage[] = [
  { port: "papeete", url: "https://www.cruisemapper.com/ports/papeete-port-109" },
];

export interface CollectResult {
  source: string;
  seen: number;
  added: number;
  error?: string;
}

function parseDate(s: string): Date | null {
  const t = s.trim();
  if (!t || t.length < 6) return null;
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function collectCruiseMapper(opts: { dryRun?: boolean } = {}): Promise<CollectResult> {
  const result: CollectResult = { source: "cruisemapper-fp", seen: 0, added: 0 };

  for (const p of CRUISE_PORTS) {
    let html: string;
    try {
      html = await politeFetch(p.url, { ua: BROWSER_UA });
    } catch (e) {
      result.error = e instanceof Error ? e.message : String(e);
      continue;
    }

    const $ = cheerio.load(html);
    for (const tr of $("table tr").toArray()) {
      const $tr = $(tr);
      const ship = $tr.find('a[href*="/ships/"]').first().text().trim();
      if (!ship) continue;
      const line = $tr.find('a[href*="/cruise-lines/"]').first().text().trim() || null;
      const cells = $tr.find("td").toArray().map((td) => $(td).text().trim());
      let arrive: Date | null = null;
      for (const c of cells) {
        const d = parseDate(c);
        if (d) {
          arrive = d;
          break;
        }
      }
      result.seen++;
      const hash = contentHash(p.port, ship, arrive?.toISOString() ?? cells.join("|"));

      if (opts.dryRun) {
        result.added++;
        continue;
      }

      const dup = await db
        .select({ id: schema.cruisePortCalls.id })
        .from(schema.cruisePortCalls)
        .where(and(eq(schema.cruisePortCalls.sourceId, "cruisemapper-fp"), eq(schema.cruisePortCalls.contentHash, hash)))
        .limit(1);
      if (dup.length) continue;

      await db.insert(schema.cruisePortCalls).values({
        sourceId: "cruisemapper-fp",
        port: p.port,
        shipName: ship,
        cruiseLine: line,
        arrive,
        isForward: true,
        contentHash: hash,
      });
      result.added++;
    }
  }

  if (!opts.dryRun) {
    await db.insert(schema.ingestionRuns).values({
      sourceId: "cruisemapper-fp",
      status: result.error ? "partial" : "ok",
      finishedAt: new Date(),
      itemsSeen: result.seen,
      itemsNew: result.added,
      error: result.error ?? null,
    });
  }

  return result;
}
