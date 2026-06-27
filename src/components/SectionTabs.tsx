"use client";

import { useState } from "react";
import type { CruiseCallView, PulseCard as PulseCardType } from "@/lib/types";
import {
  LOCAL_DOMAINS,
  TOURISM_CATEGORIES,
  domainSection,
  type Section,
} from "@/lib/taxonomy";
import { getIsland } from "@/lib/islands";
import { PulseCard } from "./PulseCard";

const TABS: { id: Section; label: string }[] = [
  { id: "tourism", label: "Tourism News" },
  { id: "local", label: "Local News" },
];

function portLabel(slug?: string | null): string {
  if (!slug) return "·";
  return getIsland(slug)?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}

function fmtDate(s?: string | null): string {
  if (!s) return "TBD";
  const d = new Date(s);
  return Number.isNaN(d.getTime())
    ? "TBD"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function SectionTabs({
  pulses,
  cruiseCalls = [],
}: {
  pulses: PulseCardType[];
  cruiseCalls?: CruiseCallView[];
}) {
  const [tab, setTab] = useState<Section>("tourism"); // tourism active by default
  const [cat, setCat] = useState<string | null>(null);
  const showCruise = tab === "tourism" && (cat === null || cat === "cruise") && cruiseCalls.length > 0;

  const categories = tab === "tourism" ? TOURISM_CATEGORIES : LOCAL_DOMAINS;
  const visible = pulses.filter(
    (p) => domainSection(p.domain) === tab && (!cat || p.domain === cat)
  );

  function switchTab(next: Section) {
    setTab(next);
    setCat(null); // reset category when switching tabs
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pt-2" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => switchTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-[0.95rem] font-semibold transition-colors ${
              tab === t.id
                ? "border-primary text-fg"
                : "border-transparent text-faint hover:text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Category chips for the active tab only */}
      <section className="py-6">
        <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-faint">
          {tab === "tourism" ? "Tourism categories" : "Local news categories"}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCat(null)}
            className={`rounded-full border px-3 py-1 text-[0.78rem] font-medium transition-colors ${
              cat === null
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted hover:border-primary/50 hover:text-primary"
            }`}
          >
            All
          </button>
          {categories.map((d) => {
            const active = cat === d.slug;
            return (
              <button
                key={d.slug}
                onClick={() => setCat(active ? null : d.slug)}
                className="rounded-full border px-3 py-1 text-[0.78rem] font-medium transition-colors"
                style={{
                  color: d.color,
                  borderColor: active ? d.color : "var(--color-border)",
                  backgroundColor: active ? `${d.color}22` : "transparent",
                }}
              >
                {d.labelEn}
              </button>
            );
          })}
        </div>
      </section>

      {/* Cruise calls panel (Tourism tab, Cruise or All) */}
      {showCruise ? (
        <section className="pb-6">
          <h3 className="mb-3 font-serif text-lg font-medium text-fg">Upcoming cruise calls</h3>
          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border">
            <table className="w-full border-collapse text-left text-[0.82rem]">
              <thead>
                <tr className="border-b border-border bg-surface-2/60 text-[0.66rem] uppercase tracking-wide text-faint">
                  <th className="px-4 py-2.5 font-semibold">Arrives</th>
                  <th className="px-4 py-2.5 font-semibold">Port</th>
                  <th className="px-4 py-2.5 font-semibold">Ship</th>
                  <th className="px-4 py-2.5 font-semibold">Line</th>
                </tr>
              </thead>
              <tbody>
                {cruiseCalls.map((c) => (
                  <tr key={c.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-2 text-muted">{fmtDate(c.arrive)}</td>
                    <td className="px-4 py-2 text-fg">{portLabel(c.port)}</td>
                    <td className="px-4 py-2 text-fg">{c.shipName ?? "·"}</td>
                    <td className="px-4 py-2 text-muted">{c.cruiseLine ?? "·"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[0.72rem] text-faint">
            Scheduled calls via CruiseMapper, subject to change. Private monitoring only.
          </p>
        </section>
      ) : null}

      {/* Filtered pulse grid */}
      <section className="pb-4">
        <h2 className="mb-5 font-serif text-2xl font-medium tracking-tight text-fg">
          {tab === "tourism" ? "Latest tourism developments" : "Latest from the islands"}
        </h2>
        {visible.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((card) => (
              <PulseCard key={card.id} card={card} showIsland />
            ))}
          </div>
        ) : (
          <p className="text-muted">
            {tab === "tourism"
              ? "No tourism items yet. The tourism collectors and analysis will fill this tab."
              : "No local news items yet."}
          </p>
        )}
      </section>
    </>
  );
}
