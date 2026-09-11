// Shared DeepSeek client + tagging vocabulary for the analysis layer.
// Returns null when no key is set so the pipeline degrades gracefully.

import OpenAI from "openai";
import { DOMAINS, allSubtagSlugs } from "../../src/lib/taxonomy";
import { allIslandSlugs } from "../../src/lib/islands";

export const MODEL = "deepseek-chat";

export function getClient(): OpenAI | null {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key, baseURL: "https://api.deepseek.com" });
}

export const DOMAIN_VOCAB = DOMAINS.map((d) => d.slug);
export const SUBTAG_VOCAB = allSubtagSlugs();
export const ISLAND_VOCAB = allIslandSlugs();

/** Parse the first tool call's arguments from a chat completion. */
export function toolInput<T = Record<string, unknown>>(
  msg: OpenAI.Chat.ChatCompletion,
  toolName: string,
): T | null {
  const call = msg.choices[0]?.message?.tool_calls?.find(
    (tc) => tc.type === "function" && tc.function.name === toolName,
  );
  if (!call || call.type !== "function") return null;
  try {
    return JSON.parse(call.function.arguments) as T;
  } catch {
    return null;
  }
}
