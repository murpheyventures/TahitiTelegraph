// Island-pulse synthesis. For one island, gather recent tagged items and ask
// Claude to produce grounded "what happened / why it matters" pulses, citing
// corpus items by number (so URLs can't be hallucinated). Writes analysis_outputs.

import { and, desc, gte, sql } from "drizzle-orm";
import { db, schema } from "../../db/client";
import { DOMAIN_VOCAB, MODEL, getClient, toolInput } from "./claude";
import { getIsland } from "../../src/lib/islands";

const WINDOW_DAYS = 14;

interface CorpusItem {
  n: number;
  itemType: "article" | "official_notice";
  itemId: string;
  source: string;
  title: string;
  url: string;
  body: string;
}

interface PulseOut {
  domain: string;
  headline: string;
  take: string;
  whyItMatters?: string;
  supportMetricValue?: string;
  supportMetricLabel?: string;
  supportTrend?: "up" | "down" | "flat";
  supportQuote?: string;
  supportQuoteAttribution?: string;
  facts: string[];
  interpretation: string[];
  signal: "strong" | "moderate" | "thin";
  confidence: number;
  sources: number[]; // corpus item numbers
}

const TOOL = {
  name: "emit_pulses",
  description:
    "Emit 0-4 grounded intelligence pulses for the island, each citing corpus item numbers.",
  input_schema: {
    type: "object" as const,
    properties: {
      pulses: {
        type: "array",
        items: {
          type: "object",
          properties: {
            domain: { type: "string", enum: DOMAIN_VOCAB },
            headline: { type: "string" },
            take: { type: "string", description: "What this means, plain English." },
            whyItMatters: { type: "string" },
            supportMetricValue: { type: "string" },
            supportMetricLabel: { type: "string" },
            supportTrend: { type: "string", enum: ["up", "down", "flat"] },
            supportQuote: { type: "string" },
            supportQuoteAttribution: { type: "string" },
            facts: { type: "array", items: { type: "string" } },
            interpretation: { type: "array", items: { type: "string" } },
            signal: { type: "string", enum: ["strong", "moderate", "thin"] },
            confidence: { type: "number" },
            sources: { type: "array", items: { type: "integer" } },
          },
          required: ["domain", "headline", "take", "facts", "interpretation", "signal", "confidence", "sources"],
        },
      },
    },
    required: ["pulses"],
  },
};

const SYSTEM = `You are the analyst for a personal French Polynesia intelligence brief.
You receive a numbered CORPUS of recently ingested items (often French) about one island.
Produce 0-4 pulses that capture what MATERIALLY happened and why it matters — not a digest.

Rules:
- Ground every claim in the corpus. Cite the corpus item number(s) in "sources". Never invent facts or URLs.
- Summarize French content into English; do not reproduce long passages.
- Keep "facts" strictly factual (each traceable to a cited item). Put any inference in "interpretation".
- Set "signal"/"confidence" lower for single-source or thinly-evidenced items.
- Write in plain, warm, human English. Do NOT use em dashes (—); use commas, periods, or "and".
- If nothing material happened, return an empty pulses array. Quality over quantity.`;

function buildSupport(p: PulseOut) {
  if (p.supportMetricValue && p.supportMetricLabel) {
    return { kind: "metric" as const, value: p.supportMetricValue, label: p.supportMetricLabel, trend: p.supportTrend };
  }
  if (p.supportQuote) {
    return { kind: "quote" as const, text: p.supportQuote, attribution: p.supportQuoteAttribution ?? "" };
  }
  return null;
}

async function gatherCorpus(islandSlug: string): Promise<CorpusItem[]> {
  const since = new Date(Date.now() - WINDOW_DAYS * 86400_000);
  const arts = await db
    .select()
    .from(schema.articles)
    .where(
      and(
        sql`${schema.articles.islands} @> ARRAY[${islandSlug}]::text[]`,
        gte(schema.articles.retrievedAt, since)
      )
    )
    .orderBy(desc(schema.articles.publishedAt))
    .limit(40);

  const notices = await db
    .select()
    .from(schema.officialNotices)
    .where(
      and(
        sql`${schema.officialNotices.islands} @> ARRAY[${islandSlug}]::text[]`,
        gte(schema.officialNotices.retrievedAt, since)
      )
    )
    .limit(20);

  const corpus: CorpusItem[] = [];
  let n = 1;
  for (const a of arts) {
    corpus.push({ n: n++, itemType: "article", itemId: a.id, source: a.sourceId ?? "", title: a.title, url: a.url, body: (a.body ?? "").slice(0, 1500) });
  }
  for (const o of notices) {
    corpus.push({ n: n++, itemType: "official_notice", itemId: o.id, source: o.sourceId ?? "", title: o.title, url: o.url, body: (o.body ?? "").slice(0, 1500) });
  }
  return corpus;
}

export async function generateIslandPulse(islandSlug: string): Promise<number> {
  const client = getClient();
  if (!client) {
    console.log("  [pulse] ANTHROPIC_API_KEY not set — skipping synthesis.");
    return 0;
  }
  const island = getIsland(islandSlug);
  if (!island) {
    console.log(`  [pulse] unknown island '${islandSlug}'.`);
    return 0;
  }

  const corpus = await gatherCorpus(islandSlug);
  if (!corpus.length) {
    console.log(`  [pulse] ${islandSlug}: no recent items, nothing to synthesize.`);
    return 0;
  }

  const corpusText = corpus
    .map((c) => `[${c.n}] (${c.source}) ${c.title}\nURL: ${c.url}\n${c.body}`)
    .join("\n\n");

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: [
      { type: "text", text: SYSTEM },
      // Cache the corpus so repeated runs in a window are cheaper.
      { type: "text", text: `ISLAND: ${island.name}\n\nCORPUS:\n${corpusText}`, cache_control: { type: "ephemeral" } },
    ],
    tools: [TOOL],
    tool_choice: { type: "tool", name: TOOL.name },
    messages: [{ role: "user", content: `Produce pulses for ${island.name}.` }],
  });

  const out = toolInput<{ pulses: PulseOut[] }>(msg, TOOL.name);
  const pulses = out?.pulses ?? [];
  if (!pulses.length) {
    console.log(`  [pulse] ${islandSlug}: no material pulses.`);
    return 0;
  }

  // Replace prior generated (non-seed) pulses for this island.
  await db
    .delete(schema.analysisOutputs)
    .where(
      and(
        sql`${schema.analysisOutputs.type} = 'island_pulse'`,
        sql`${schema.analysisOutputs.island} = ${islandSlug}`,
        sql`${schema.analysisOutputs.model} <> 'seed-example'`
      )
    );

  const period = new Date().toISOString().slice(0, 10);
  for (const p of pulses) {
    const citations = (p.sources ?? [])
      .map((num) => corpus.find((c) => c.n === num))
      .filter((c): c is CorpusItem => Boolean(c))
      .map((c) => ({ itemType: c.itemType, itemId: c.itemId, url: c.url, label: `${c.source}` }));

    await db.insert(schema.analysisOutputs).values({
      type: "island_pulse",
      island: islandSlug,
      domain: p.domain,
      period,
      headline: p.headline,
      take: p.take,
      whyItMatters: p.whyItMatters ?? null,
      support: buildSupport(p),
      citations,
      facts: p.facts ?? [],
      interpretation: p.interpretation ?? [],
      signal: p.signal,
      confidence: p.confidence,
      model: MODEL,
    });
  }

  console.log(`  [pulse] ${islandSlug}: wrote ${pulses.length} pulse(s).`);
  return pulses.length;
}
