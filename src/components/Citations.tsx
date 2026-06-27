import type { Citation } from "@/lib/types";

/**
 * Renders the citation line for a pulse card. Every analysed claim must trace
 * back to an ingested item; this surfaces those links so facts stay verifiable.
 */
export function Citations({ citations }: { citations: Citation[] }) {
  if (!citations.length) return null;
  return (
    <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-[0.78rem] text-faint">
      <span>Sources:</span>
      {citations.map((c, i) => (
        <span key={`${c.label}-${i}`}>
          {c.url ? (
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-primary"
            >
              {c.label}
            </a>
          ) : (
            <span className="text-muted">{c.label}</span>
          )}
          {i < citations.length - 1 ? "," : ""}
        </span>
      ))}
    </div>
  );
}
