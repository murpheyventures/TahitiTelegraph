// CruiseMapper port-call collector → cruise_port_calls.
// robots.txt allows /ports (verified in the tourism audit). Proprietary
// aggregated schedule data: private monitoring only (review_required if public).
// The schedule table is Day | Ship | Arrival | Departure; the cruise line is not
// in the table, so it's mapped from the ship name. Calls are a refreshed
// snapshot (cleared per source each run), with is_forward set vs today.

import * as cheerio from "cheerio";
import { eq } from "drizzle-orm";
import { db, schema } from "../../db/client";
import { BROWSER_UA, contentHash, politeFetch } from "../lib/http";

interface PortPage {
  port: string; // island/port slug
  url: string;
}

export const CRUISE_PORTS: PortPage[] = [
  { port: "papeete", url: "https://www.cruisemapper.com/ports/papeete-port-109" },
  { port: "moorea", url: "https://www.cruisemapper.com/ports/moorea-island-port-418" },
  { port: "bora-bora", url: "https://www.cruisemapper.com/ports/bora-bora-island-port-107" },
];

// Cruise line is absent from the port schedule table; map it from the ship name.
const SHIP_LINE: Record<string, string> = {
  "Paul Gauguin": "Paul Gauguin Cruises",
  "Star Breeze": "Windstar Cruises",
  "Star Pride": "Windstar Cruises",
  "Wind Spirit": "Windstar Cruises",
  "Wind Star": "Windstar Cruises",
  "Norwegian Spirit": "Norwegian Cruise Line",
  "Norwegian Sun": "Norwegian Cruise Line",
  "Aranui 5": "Aranui",
  "Le Soléal": "Ponant",
  "Le Bellot": "Ponant",
  "Le Jacques Cartier": "Ponant",
  "Silver Whisper": "Silversea",
  "Silver Shadow": "Silversea",
  "Silver Muse": "Silversea",
  "Seven Seas Navigator": "Regent Seven Seas",
  "Seven Seas Explorer": "Regent Seven Seas",
  Insignia: "Oceania Cruises",
  Regatta: "Oceania Cruises",
  Nautica: "Oceania Cruises",
};

export interface CollectResult {
  source: string;
  seen: number;
  added: number;
  error?: string;
}

function dateFrom(s: string): Date | null {
  const m = s.match(/(\d{1,2}\s+[A-Za-z]+,?\s*\d{4})/);
  if (!m) return null;
  const d = new Date(m[1].replace(",", ""));
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function collectCruiseMapper(opts: { dryRun?: boolean } = {}): Promise<CollectResult> {
  const result: CollectResult = { source: "cruisemapper-fp", seen: 0, added: 0 };
  const now = new Date();

  // Refresh: a schedule is a snapshot, not append-only history.
  if (!opts.dryRun) {
    await db.delete(schema.cruisePortCalls).where(eq(schema.cruisePortCalls.sourceId, "cruisemapper-fp"));
  }

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
      const cells = $tr.find("td").toArray().map((td) => $(td).text().replace(/\s+/g, " ").trim());
      const ship = ($tr.find('a[href*="/ships/"]').first().text().trim() || cells[1] || "").trim();
      if (!ship || cells.length < 2) continue; // header / non-schedule row

      const arrive = dateFrom(cells[0]);
      const cruiseLine = SHIP_LINE[ship] ?? null;
      result.seen++;
      const hash = contentHash(p.port, ship, arrive?.toISOString() ?? cells[0]);

      if (opts.dryRun) {
        result.added++;
        continue;
      }

      await db.insert(schema.cruisePortCalls).values({
        sourceId: "cruisemapper-fp",
        port: p.port,
        shipName: ship,
        cruiseLine,
        arrive,
        isForward: arrive ? arrive >= now : true,
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
