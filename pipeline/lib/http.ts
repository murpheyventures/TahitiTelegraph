// Polite HTTP helpers for collectors: a descriptive User-Agent, basic
// throttling, and a content hash for change detection / dedup.

import { createHash } from "node:crypto";

export const USER_AGENT =
  "TahitiTelegraph/0.1 (personal, non-commercial research aggregator)";

// Standard browser UA for public pages that serve a JS shell or block unusual
// agents. We read public info only; for pages that need JS or block a plain
// fetch, a headless browser is permitted for personal use (see README Access
// policy). Still respect robots.txt, paywalls/logins, and polite rate limits.
export const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function contentHash(...parts: (string | undefined | null)[]): string {
  return createHash("sha256").update(parts.filter(Boolean).join("")).digest("hex");
}

export async function politeFetch(
  url: string,
  opts: { timeoutMs?: number; ua?: string } = {}
): Promise<string> {
  const { timeoutMs = 15000, ua = USER_AGENT } = opts;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": ua, Accept: "*/*" },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}
