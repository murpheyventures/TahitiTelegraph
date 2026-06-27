import Link from "next/link";
import { DOMAINS } from "@/lib/taxonomy";

export function DomainChips({ active }: { active?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {DOMAINS.map((d) => {
        const isActive = d.slug === active;
        return (
          <Link
            key={d.slug}
            href={`/domain/${d.slug}`}
            className="rounded-full border px-3 py-1 text-[0.78rem] font-medium no-underline transition-colors"
            style={{
              color: d.color,
              borderColor: isActive ? d.color : "var(--color-border)",
              backgroundColor: isActive ? `${d.color}22` : "transparent",
            }}
          >
            {d.labelEn}
          </Link>
        );
      })}
    </div>
  );
}
