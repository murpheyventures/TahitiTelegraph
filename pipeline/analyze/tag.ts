// Tagging pass: classify untagged articles into domains / sub-tags / islands /
// entities against the fixed vocabulary, using Claude tool-use. Merges with the
// rule-based island guess already on the row.

import { eq } from "drizzle-orm";
import { db, schema } from "../../db/client";
import {
  DOMAIN_VOCAB,
  ISLAND_VOCAB,
  MODEL,
  SUBTAG_VOCAB,
  getClient,
  toolInput,
} from "./claude";

interface TagOutput {
  domains: string[];
  subtags: string[];
  islands: string[];
  entities: string[];
}

const TOOL = {
  name: "tag_item",
  description: "Assign taxonomy tags to a French Polynesia news item.",
  input_schema: {
    type: "object" as const,
    properties: {
      domains: { type: "array", items: { type: "string", enum: DOMAIN_VOCAB } },
      subtags: { type: "array", items: { type: "string", enum: SUBTAG_VOCAB } },
      islands: { type: "array", items: { type: "string", enum: ISLAND_VOCAB } },
      entities: { type: "array", items: { type: "string" } },
    },
    required: ["domains", "subtags", "islands", "entities"],
  },
};

const SYSTEM =
  "You tag French-language French Polynesia news for a personal intelligence tool. " +
  "Choose only from the provided enums. Use 1-2 domains, the most specific sub-tags, " +
  "and island slugs the item is actually about (use 'territory' if not island-specific). " +
  "Extract notable entities (people, orgs, ministries, companies). Do not invent tags.";

export async function tagArticles(limit = 25): Promise<number> {
  const client = getClient();
  if (!client) {
    console.log("  [tag] ANTHROPIC_API_KEY not set — skipping tagging.");
    return 0;
  }

  const rows = await db
    .select()
    .from(schema.articles)
    .where(eq(schema.articles.tagged, false))
    .limit(limit);

  let tagged = 0;
  for (const a of rows) {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: SYSTEM,
      tools: [TOOL],
      tool_choice: { type: "tool", name: TOOL.name },
      messages: [
        {
          role: "user",
          content: `TITLE: ${a.title}\n\nBODY (may be French):\n${(a.body ?? "").slice(0, 3000)}`,
        },
      ],
    });

    const out = toolInput<TagOutput>(msg, TOOL.name);
    if (!out) continue;

    const islands = Array.from(new Set([...(a.islands ?? []), ...(out.islands ?? [])]));
    await db
      .update(schema.articles)
      .set({
        domains: out.domains ?? [],
        subtags: out.subtags ?? [],
        islands: islands.length ? islands : ["territory"],
        entities: out.entities ?? [],
        tagged: true,
      })
      .where(eq(schema.articles.id, a.id));
    tagged++;
  }
  console.log(`  [tag] tagged ${tagged} article(s).`);
  return tagged;
}
