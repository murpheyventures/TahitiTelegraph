// Analysis orchestrator: tag new articles, then synthesize island pulses.
//
//   npm run analyze                      # tag + pulses for islands with new items
//   npm run analyze -- --island=tahiti   # tag + pulse for one island
//   npm run analyze -- --tag-only        # tagging pass only
//
// Requires ANTHROPIC_API_KEY; degrades to a no-op with a message if unset.

import "dotenv/config";
import { sql as pg, db } from "../../db/client";
import { sql } from "drizzle-orm";
import { tagArticles } from "./tag";
import { generateIslandPulse } from "./island-pulse";
import { generateCruisePulse } from "./cruise-pulse";
import { getClient } from "./claude";

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : undefined;
}
const hasFlag = (name: string) => process.argv.includes(`--${name}`);

async function islandsWithRecentItems(): Promise<string[]> {
  const since = new Date(Date.now() - 14 * 86400_000).toISOString();
  const rows = await db.execute(
    sql`select distinct unnest(islands) as island from articles
        where tagged = true and retrieved_at >= ${since}`
  );
  return (rows as unknown as { island: string }[]).map((r) => r.island).filter(Boolean);
}

async function main() {
  console.log("\nTahitiTelegraph analyze\n");

  // Deterministic cruise-deployment rollup from cruise_port_calls (no LLM needed).
  await generateCruisePulse();

  if (!getClient()) {
    console.log("ANTHROPIC_API_KEY not set. Add it to .env (and GitHub Actions secrets) to run analysis.\n");
    await pg.end({ timeout: 5 });
    return;
  }

  const limit = Number(arg("limit") ?? 25);
  await tagArticles(limit);

  if (!hasFlag("tag-only")) {
    const only = arg("island");
    const islands = only ? [only] : await islandsWithRecentItems();
    if (!islands.length) {
      console.log("  No islands with recent tagged items. Ingest first (npm run ingest).");
    }
    for (const slug of islands) {
      await generateIslandPulse(slug);
    }
  }

  console.log("\nDone.\n");
  await pg.end({ timeout: 5 });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
