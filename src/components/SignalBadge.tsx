import type { Signal } from "@/lib/types";

const STYLES: Record<Signal, string> = {
  strong: "text-strong border-strong/35 bg-strong/10",
  moderate: "text-moderate border-moderate/35 bg-moderate/10",
  thin: "text-thin border-thin/35 bg-thin/10",
};

const DOT: Record<Signal, string> = {
  strong: "bg-strong",
  moderate: "bg-moderate",
  thin: "bg-thin",
};

const DEFAULT_LABEL: Record<Signal, string> = {
  strong: "Strong signal",
  moderate: "Moderate signal",
  thin: "Thin signal",
};

export function SignalBadge({ signal, label }: { signal: Signal; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.66rem] font-semibold uppercase tracking-wide ${STYLES[signal]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[signal]}`} />
      {label ?? DEFAULT_LABEL[signal]}
    </span>
  );
}
