// Text tidying for display. We don't use em dashes anywhere on the site, so
// any that slip in from generated analysis or seed copy get softened to commas
// (em dash) or hyphens (en dash) before rendering.

export function tidy(s: string): string {
  return s
    .replace(/\s*—\s*/g, ", ") // em dash -> comma
    .replace(/\s*–\s*/g, "-") // en dash -> hyphen
    .replace(/\s+,/g, ",") // tidy stray space before comma
    .replace(/,\s*,/g, ",");
}

export function tidyMaybe<T extends string | null | undefined>(s: T): T {
  return (typeof s === "string" ? (tidy(s) as T) : s);
}
