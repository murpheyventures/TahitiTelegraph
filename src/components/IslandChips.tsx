import Link from "next/link";
import { ISLANDS, getIsland } from "@/lib/islands";

/** Island navigation. If `slugs` given, only those render (e.g. islands with
 *  pulses); otherwise all non-aggregate islands plus the territory rollup. */
export function IslandChips({ active, slugs }: { active?: string; slugs?: string[] }) {
  const list = slugs
    ? slugs.map((s) => getIsland(s)).filter((x): x is NonNullable<typeof x> => Boolean(x))
    : ISLANDS.filter((i) => !i.aggregate || i.slug === "territory");
  const sorted = [...list].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex flex-wrap gap-2">
      {sorted.map((i) => {
        const isActive = i.slug === active;
        return (
          <Link
            key={i.slug}
            href={`/island/${i.slug}`}
            className={`rounded-full border px-3 py-1 text-[0.78rem] font-medium no-underline transition-colors ${
              isActive
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted hover:border-primary/50 hover:text-primary"
            }`}
          >
            {i.name}
            {i.nameTy && i.nameTy !== i.name ? (
              <span className="ml-1 text-faint">· {i.nameTy}</span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
