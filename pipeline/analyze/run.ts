// Analysis orchestrator: tag new articles, then synthesize island pulses.
//
//   npm run analyze                      # pulses ONLY for islands with new items (cheap, default)
//   npm run analyze -- --all             # regenerate every island with recent content (full rebuild)
//   npm run analyze -- --island=tahiti   # tag + pulse for one island
//   npm run analyze -- --since-hours=48  # widen the "new items" window (default 26h)
//   npm run analyze -- --tag-only        # tagging pass only
//
// Steady-state cost control: by default only islands that received new articles
// since the last run are regenerated, so quiet windows cost almost nothing.
// Requires DEEPSEEK_API_KEY; degrades to a no-op with a message if unset.

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

/** Islands that received NEW articles within the window (default: since the last daily run). */
async function islandsWithNewItems(hours: number): Promise<string[]> {
  const since = new Date(Date.now() - hours * 3600_000).toISOString();
  const rows = await db.execute(
    sql`select distinct unnest(islands) as island from articles where retrieved_at >= ${since}`
  );
  return (rows as unknown as { island: string }[]).map((r) => r.island).filter(Boolean);
}

/** All islands with content in the last 14 days — for a full rebuild (--all). */
async function islandsWithAnyItems(): Promise<string[]> {
  const since = new Date(Date.now() - 14 * 86400_000).toISOString();
  const rows = await db.execute(
    sql`select distinct unnest(islands) as island from articles where retrieved_at >= ${since}`
  );
  return (rows as unknown as { island: string }[]).map((r) => r.island).filter(Boolean);
}

async function main() {
  console.log("\nTahitiTelegraph analyze\n");

  // Deterministic cruise-deployment rollup from cruise_port_calls (no LLM needed).
  await generateCruisePulse();

  if (!getClient()) {
    console.log("DEEPSEEK_API_KEY not set. Add it to .env (and GitHub Actions secrets) to run analysis.\n");
    await pg.end({ timeout: 5 });
    return;
  }

  const limit = Number(arg("limit") ?? 25);
  await tagArticles(limit);

  if (!hasFlag("tag-only")) {
    const only = arg("island");
    const sinceHours = Number(arg("since-hours") ?? 26);
    const islands = only
      ? [only]
      : hasFlag("all")
        ? await islandsWithAnyItems()
        : await islandsWithNewItems(sinceHours);
    if (!islands.length) {
      console.log(`  No islands with new items in the last ${sinceHours}h; pulses unchanged (no LLM calls).`);
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
