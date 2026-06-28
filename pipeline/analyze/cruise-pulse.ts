// Cruise-deployment rollup. The cruise-NEWS sources (TravelPulse, Paul Gauguin
// press, Aranui) are bot-blocked (403) or JS-rendered, so they need a headless
// crawl (now permitted for personal use, see README Access policy) which isn't
// built yet. Meanwhile the substance of the beat, which lines/ships deploy in FP
// and the small vs large-ship mix, is already in cruise_port_calls. This synthesizes
// that schedule into one grounded `cruise` pulse, DETERMINISTICALLY (no LLM, so
// no hallucination over schedule data), cited to CruiseMapper. Refreshes itself.

import { eq } from "drizzle-orm";
import { db, schema } from "../../db/client";
import { getIsland } from "../../src/lib/islands";

const MODEL = "cruise-rollup";

// Large-ship lines (the rest are treated as small-ship, FP's preferred segment).
const LARGE_LINES = new Set([
  "Norwegian Cruise Line",
  "Princess Cruises",
  "Celebrity Cruises",
  "Holland America Line",
  "Royal Caribbean",
]);

const PORT_URL: Record<string, string> = {
  papeete: "https://www.cruisemapper.com/ports/papeete-port-109",
  moorea: "https://www.cruisemapper.com/ports/moorea-island-port-418",
  "bora-bora": "https://www.cruisemapper.com/ports/bora-bora-island-port-107",
};

function portName(slug: string): string {
  return getIsland(slug)?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}
function fmt(d: Date | null): string {
  return d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
}

export async function generateCruisePulse(): Promise<number> {
  const calls = await db.select().from(schema.cruisePortCalls);
  if (!calls.length) {
    console.log("  [cruise] no port calls, skipping rollup.");
    return 0;
  }

  const byLine: Record<string, number> = {};
  const byPort: Record<string, number> = {};
  const ships = new Set<string>();
  let minD: Date | null = null;
  let maxD: Date | null = null;
  for (const c of calls) {
    if (c.cruiseLine) byLine[c.cruiseLine] = (byLine[c.cruiseLine] ?? 0) + 1;
    if (c.port) byPort[c.port] = (byPort[c.port] ?? 0) + 1;
    if (c.shipName) ships.add(c.shipName);
    if (c.arrive) {
      if (!minD || c.arrive < minD) minD = c.arrive;
      if (!maxD || c.arrive > maxD) maxD = c.arrive;
    }
  }

  const topLines = Object.entries(byLine).sort((a, b) => b[1] - a[1]);
  const topPorts = Object.entries(byPort).sort((a, b) => b[1] - a[1]);
  const largeCalls = calls.filter((c) => c.cruiseLine && LARGE_LINES.has(c.cruiseLine)).length;
  const smallCalls = calls.length - largeCalls;
  const leadLine = topLines[0]?.[0] ?? "Cruise lines";
  const window = minD && maxD ? ` (${fmt(minD)} to ${fmt(maxD)})` : "";

  const headline = `${leadLine} leads ${calls.length} cruise calls across the islands, small ships dominate`;
  const take =
    `Across Papeete, Moorea and Bora Bora, ${calls.length} cruise calls are on the schedule${window}, ` +
    `with ${ships.size} ships from ${topLines.length} lines. Small-ship lines account for ${smallCalls} of the ${calls.length} calls.`;
  const whyItMatters =
    "Cruise calls concentrate visitor spending around port days, so the mix of small versus large ships shapes how much reaches each island, and the small-ship tilt reflects French Polynesia's cap on large vessels.";
  const facts = [
    `Most active lines: ${topLines.slice(0, 3).map(([l, n]) => `${l} (${n} calls)`).join(", ")}.`,
    `Calls by port: ${topPorts.map(([p, n]) => `${portName(p)} (${n})`).join(", ")}.`,
    `${smallCalls} small-ship calls versus ${largeCalls} large-ship calls.`,
  ];
  const interpretation = [
    "Schedule via CruiseMapper for the current window, subject to change, so read it as direction not a fixed count.",
  ];
  const citations = topPorts
    .map(([p]) => ({ itemType: "cruise", label: `CruiseMapper, ${portName(p)}`, url: PORT_URL[p] }))
    .filter((c) => c.url);

  await db.delete(schema.analysisOutputs).where(eq(schema.analysisOutputs.model, MODEL));
  await db.insert(schema.analysisOutputs).values({
    type: "island_pulse",
    island: "territory",
    domain: "cruise",
    period: new Date().toISOString().slice(0, 10),
    headline,
    take,
    whyItMatters,
    support: { kind: "metric", value: String(calls.length), label: "cruise calls this window", trend: "flat" },
    citations,
    facts,
    interpretation,
    signal: "moderate",
    confidence: 0.7,
    model: MODEL,
  });

  console.log(`  [cruise] wrote rollup: ${calls.length} calls, ${topLines.length} lines.`);
  return 1;
}
