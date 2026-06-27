import Link from "next/link";
import { DOMAINS, domainSection, type Section } from "@/lib/taxonomy";

/** Category chips for a deep-link category page. Renders only the chips for the
 *  given section (derived from the active slug when not passed). */
export function DomainChips({ active, section }: { active?: string; section?: Section }) {
  const sec: Section = section ?? (active ? domainSection(active) : "local");
  const list = DOMAINS.filter((d) => d.section === sec);

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((d) => {
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
