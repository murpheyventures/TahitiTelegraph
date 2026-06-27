// Ingestion orchestrator. Runs collectors, prints a summary, exits.
//
//   npm run ingest                     # all RSS feeds
//   npm run ingest -- --source=radio1  # one source
//   npm run ingest -- --dry-run        # fetch + parse, NO writes
//
// Heavy work belongs here (GitHub Actions), not in the web app.

import "dotenv/config";
import { sql as pg } from "../db/client";
import { RSS_FEEDS, collectRss, type CollectResult } from "./collectors/rss";
import { collectMeteo } from "./collectors/meteo";
import { collectAdvisories } from "./collectors/advisories";
import { collectCruiseMapper } from "./collectors/cruisemapper";
import { collectAdt } from "./collectors/adt";
import { NEWS_SITES, collectNewsSite } from "./collectors/htmlNews";

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : undefined;
}
const hasFlag = (name: string) => process.argv.includes(`--${name}`);

async function main() {
  const dryRun = hasFlag("dry-run");
  const only = arg("source");

  console.log(`\nTahitiTelegraph ingest — ${dryRun ? "DRY RUN (no writes)" : "live"}${only ? ` — source=${only}` : ""}\n`);

  const feeds = hasFlag("no-rss")
    ? []
    : only
      ? RSS_FEEDS.filter((f) => f.id === only)
      : RSS_FEEDS;
  const results: CollectResult[] = [];

  for (const f of feeds) {
    process.stdout.write(`  ${f.id} … `);
    const r = await collectRss(f, { dryRun });
    results.push(r);
    console.log(r.error ? `ERROR: ${r.error}` : `seen ${r.seen}, ${dryRun ? "would add" : "added"} ${r.added}`);
  }

  // Non-RSS collectors — only when not filtering to a single RSS source.
  if (!only) {
    const m = await collectMeteo({ dryRun });
    console.log(`  ${m.source} … ${m.error ? `ERROR: ${m.error}` : m.note}`);
    for (const adv of await collectAdvisories({ dryRun })) {
      console.log(
        `  ${adv.source} … ${adv.error ? `ERROR: ${adv.error}` : `${adv.level}${adv.changed ? " (changed)" : ""}`}`
      );
    }
    const cm = await collectCruiseMapper({ dryRun });
    console.log(`  ${cm.source} … ${cm.error ? `ERROR: ${cm.error}` : `seen ${cm.seen}, ${dryRun ? "would add" : "added"} ${cm.added}`}`);
    const adt = await collectAdt({ dryRun });
    console.log(`  ${adt.source} … ${adt.error ? `ERROR: ${adt.error}` : `seen ${adt.seen}, ${dryRun ? "would add" : "added"} ${adt.added}`}`);
    for (const site of NEWS_SITES) {
      const r = await collectNewsSite(site, { dryRun });
      console.log(`  ${r.source} … ${r.error ? `ERROR: ${r.error}` : `seen ${r.seen}, ${dryRun ? "would add" : "added"} ${r.added}`}`);
    }
  }

  const okFeeds = results.filter((r) => !r.error).length;
  console.log(`\nDone. ${okFeeds}/${results.length} feeds ok.\n`);

  await pg.end({ timeout: 5 });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
