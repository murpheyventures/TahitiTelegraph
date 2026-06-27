// Polite HTTP helpers for collectors: a descriptive User-Agent, basic
// throttling, and a content hash for change detection / dedup.

import { createHash } from "node:crypto";

export const USER_AGENT =
  "TahitiTelegraph/0.1 (personal, non-commercial research aggregator)";

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function contentHash(...parts: (string | undefined | null)[]): string {
  return createHash("sha256").update(parts.filter(Boolean).join("")).digest("hex");
}

export async function politeFetch(url: string, timeoutMs = 15000): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "*/*" },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}
