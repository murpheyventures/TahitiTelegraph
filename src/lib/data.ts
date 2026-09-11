// Server-side data access. The app reads everything the pipeline produced
// from Neon through these helpers. Keep all Drizzle queries in here so pages
// stay declarative.

import { and, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@db/client";
import { tidy, tidyMaybe } from "./text";
import type {
  AdvisoryView,
  Citation,
  CruiseCallView,
  OfficialNoticeView,
  PulseCard,
  SourceHealth,
  Support,
  Signal,
  WeatherAlertView,
} from "./types";

function iso(d: Date | null | undefined): string | null {
  return d ? d.toISOString() : null;
}

function tidySupport(s: Support | null): Support | null {
  if (!s) return null;
  if (s.kind === "metric") return { ...s, value: tidy(s.value), label: tidy(s.label) };
  return { ...s, text: tidy(s.text), attribution: tidy(s.attribution) };
}

function toCard(row: typeof schema.analysisOutputs.$inferSelect): PulseCard {
  const citations = ((row.citations as Citation[]) ?? []).map((c) => ({ ...c, label: tidy(c.label) }));
  return {
    id: row.id,
    island: row.island,
    domain: row.domain,
    headline: tidy(row.headline),
    take: tidy(row.take),
    whyItMatters: tidyMaybe(row.whyItMatters),
    support: tidySupport((row.support as Support | null) ?? null),
    citations,
    facts: ((row.facts as string[]) ?? []).map(tidy),
    interpretation: ((row.interpretation as string[]) ?? []).map(tidy),
    signal: (row.signal as Signal) ?? "moderate",
    confidence: row.confidence,
    generatedAt: iso(row.generatedAt) ?? "",
  };
}

/** Latest island_pulse cards for one island. */
export async function getIslandPulse(islandSlug: string): Promise<PulseCard[]> {
  const rows = await db
    .select()
    .from(schema.analysisOutputs)
    .where(
      and(
        eq(schema.analysisOutputs.type, "island_pulse"),
        eq(schema.analysisOutputs.island, islandSlug)
      )
    )
    .orderBy(desc(schema.analysisOutputs.generatedAt));
  return rows.map(toCard);
}

/** Latest island_pulse card per island, for the overview grid. */
export async function getOverviewPulses(limit = 60): Promise<PulseCard[]> {
  const rows = await db
    .select()
    .from(schema.analysisOutputs)
    .where(eq(schema.analysisOutputs.type, "island_pulse"))
    .orderBy(desc(schema.analysisOutputs.generatedAt))
    .limit(limit);
  return rows.map(toCard);
}

/** Cards tagged to a domain, across islands. */
export async function getDomainPulses(domainSlug: string): Promise<PulseCard[]> {
  const rows = await db
    .select()
    .from(schema.analysisOutputs)
    .where(eq(schema.analysisOutputs.domain, domainSlug))
    .orderBy(desc(schema.analysisOutputs.generatedAt));
  return rows.map(toCard);
}

export async function getActiveWeatherAlerts(): Promise<WeatherAlertView[]> {
  const rows = await db
    .select()
    .from(schema.weatherAlerts)
    .where(eq(schema.weatherAlerts.status, "active"))
    .orderBy(desc(schema.weatherAlerts.issuedAt));
  return rows.map((r) => ({
    id: r.id,
    island: r.island,
    hazardType: r.hazardType,
    vigilanceLevel: r.vigilanceLevel,
    issuedAt: iso(r.issuedAt),
    validUntil: iso(r.validUntil),
    status: r.status,
    url: r.url,
  }));
}

export async function getAdvisories(): Promise<AdvisoryView[]> {
  const rows = await db
    .select()
    .from(schema.travelAdvisories)
    .orderBy(desc(schema.travelAdvisories.updatedAt));
  return rows.map((r) => ({
    id: r.id,
    sourceId: r.sourceId,
    level: tidyMaybe(r.level),
    prevLevel: tidyMaybe(r.prevLevel),
    updatedAt: iso(r.updatedAt),
    summary: tidyMaybe(r.summary),
    url: r.url,
  }));
}

const CRUISEMAPPER_PORT_URL: Record<string, string> = {
  papeete: "https://www.cruisemapper.com/ports/papeete-port-109",
  moorea: "https://www.cruisemapper.com/ports/moorea-island-port-418",
  "bora-bora": "https://www.cruisemapper.com/ports/bora-bora-island-port-107",
};

/** Recent and upcoming cruise port calls, most recent first. */
export async function getUpcomingCruiseCalls(limit = 14): Promise<CruiseCallView[]> {
  const rows = await db
    .select()
    .from(schema.cruisePortCalls)
    .orderBy(sql`${schema.cruisePortCalls.arrive} desc nulls last`)
    .limit(limit);
  return rows.map((r) => ({
    id: r.id,
    port: r.port,
    shipName: tidyMaybe(r.shipName),
    cruiseLine: tidyMaybe(r.cruiseLine),
    arrive: iso(r.arrive),
    sourceUrl: r.port ? CRUISEMAPPER_PORT_URL[r.port] ?? null : null,
  }));
}

export async function getRecentOfficialNotices(limit = 12): Promise<OfficialNoticeView[]> {
  const rows = await db
    .select()
    .from(schema.officialNotices)
    .orderBy(desc(schema.officialNotices.issuedAt))
    .limit(limit);
  return rows.map((r) => ({
    id: r.id,
    noticeType: r.noticeType,
    title: tidy(r.title),
    issuedAt: iso(r.issuedAt),
    url: r.url,
    domains: r.domains ?? [],
    islands: r.islands ?? [],
    sourceId: r.sourceId,
  }));
}

export async function getSourcesHealth(): Promise<SourceHealth[]> {
  const sources = await db.select().from(schema.sources).orderBy(schema.sources.sourceType);
  const out: SourceHealth[] = [];
  for (const s of sources) {
    const [run] = await db
      .select()
      .from(schema.ingestionRuns)
      .where(eq(schema.ingestionRuns.sourceId, s.id))
      .orderBy(desc(schema.ingestionRuns.startedAt))
      .limit(1);
    out.push({
      id: s.id,
      name: s.name,
      sourceType: s.sourceType,
      cadence: s.cadence,
      active: s.active,
      lastRunAt: run ? iso(run.startedAt) : null,
      lastStatus: run?.status ?? null,
      lastItemsNew: run?.itemsNew ?? null,
    });
  }
  return out;
}

/** Island slugs that currently have at least one pulse (for the overview grid). */
export async function getIslandsWithPulses(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ island: schema.analysisOutputs.island })
    .from(schema.analysisOutputs)
    .where(and(eq(schema.analysisOutputs.type, "island_pulse"), sql`${schema.analysisOutputs.island} is not null`));
  return rows.map((r) => r.island).filter((x): x is string => Boolean(x));
}
