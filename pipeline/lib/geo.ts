// Rule-based geography resolver: scan text for island/archipelago aliases and
// return the matching island slugs. A cheap first pass; the Claude tagging step
// can refine. Defaults to ["territory"] when nothing island-specific matches.

import { ISLANDS } from "../../src/lib/islands";

interface AliasEntry {
  slug: string;
  alias: string;
}

const ALIAS_INDEX: AliasEntry[] = ISLANDS.flatMap((i) =>
  i.aliases.map((a) => ({ slug: i.slug, alias: a.toLowerCase() }))
).sort((a, b) => b.alias.length - a.alias.length); // longest first

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // strip accents for loose matching
}

export function resolveIslands(...texts: (string | null | undefined)[]): string[] {
  const hay = norm(texts.filter(Boolean).join("  "));
  const found = new Set<string>();
  for (const { slug, alias } of ALIAS_INDEX) {
    const a = norm(alias);
    // word-ish boundary match
    const re = new RegExp(`(^|[^a-z0-9])${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`);
    if (re.test(hay)) found.add(slug);
  }
  if (found.size === 0) found.add("territory");
  return [...found];
}
