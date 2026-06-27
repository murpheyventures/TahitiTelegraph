// Shared Anthropic client + tagging vocabulary for the analysis layer.
// Returns null when no key is set so the pipeline degrades gracefully.

import Anthropic from "@anthropic-ai/sdk";
import { DOMAINS, allSubtagSlugs } from "../../src/lib/taxonomy";
import { allIslandSlugs } from "../../src/lib/islands";

// Sonnet 4.6 for the per-item tagging pass and island-pulse synthesis.
// (Reserve Opus 4.8 for the future weekly deep-dive.)
export const MODEL = "claude-sonnet-4-6";

export function getClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

export const DOMAIN_VOCAB = DOMAINS.map((d) => d.slug);
export const SUBTAG_VOCAB = allSubtagSlugs();
export const ISLAND_VOCAB = allIslandSlugs();

/** Pull the first tool_use input out of a message, typed loosely. */
export function toolInput<T = Record<string, unknown>>(
  msg: Anthropic.Message,
  toolName: string
): T | null {
  const block = msg.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === toolName
  );
  return block ? (block.input as T) : null;
}
