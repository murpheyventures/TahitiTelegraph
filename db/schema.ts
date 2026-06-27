// TahitiTelegraph data model (Neon Postgres via Drizzle).
// Shared by the Next.js app (read) and the pipeline (read/write).
//
// Flow: raw_items (provenance) -> normalized (articles / official_notices /
// statistical_observations / weather_alerts / travel_advisories) -> Claude
// tagging + island-pulse synthesis -> analysis_outputs (what the site renders).

import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/** Empty text[] default helper. */
const emptyArr = sql`'{}'::text[]`;

/* ---------------------------------------------------------------- registries */

export const sources = pgTable("sources", {
  id: text("id").primaryKey(), // slug, e.g. "tahiti-infos"
  name: text("name").notNull(),
  url: text("url").notNull(),
  sourceType: text("source_type").notNull(), // news | official | legal | economic | tourism | transport | weather | advisory | regional | marine
  ingestionMethod: text("ingestion_method").notNull(), // rss | crawl | data_file | api | pdf | manual
  language: text("language").notNull().default("fr"),
  cadence: text("cadence").notNull().default("daily"), // hourly | daily | weekly | event
  active: boolean("active").notNull().default(true),
  robotsNotes: text("robots_notes"),
  licenceNote: text("licence_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const islands = pgTable("islands", {
  slug: text("slug").primaryKey(), // "tahiti", "bora-bora", "territory", "regional-pacific"
  name: text("name").notNull(),
  nameTy: text("name_ty"), // reo Tahiti
  archipelago: text("archipelago").notNull(), // society-windward | society-leeward | tuamotu | marquesas | austral | gambier | territory | regional
  aliases: text("aliases").array().notNull().default(emptyArr),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const topics = pgTable("topics", {
  slug: text("slug").primaryKey(), // domain slug or subtag slug
  labelEn: text("label_en").notNull(),
  labelFr: text("label_fr"),
  labelTy: text("label_ty"), // optional reo Tahiti label
  parentSlug: text("parent_slug"), // null => top-level domain
  color: text("color"), // hex, for domains
  sortOrder: integer("sort_order").notNull().default(0),
});

/* ------------------------------------------------------------------ ingestion */

export const ingestionRuns = pgTable("ingestion_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceId: text("source_id").references(() => sources.id),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: text("status").notNull().default("running"), // running | ok | partial | failed
  itemsSeen: integer("items_seen").notNull().default(0),
  itemsNew: integer("items_new").notNull().default(0),
  error: text("error"),
});

export const rawItems = pgTable("raw_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceId: text("source_id").references(() => sources.id),
  runId: uuid("run_id").references(() => ingestionRuns.id),
  url: text("url"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  contentHash: text("content_hash"), // change detection / dedup of the raw fetch
  title: text("title"),
  rawText: text("raw_text"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  lang: text("lang"),
  payload: jsonb("payload"),
});

/* ----------------------------------------------------------------- normalized */

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceId: text("source_id").references(() => sources.id),
  rawItemId: uuid("raw_item_id").references(() => rawItems.id),
  url: text("url").notNull(),
  title: text("title").notNull(),
  body: text("body"), // full text OK — personal use only
  publishedAt: timestamp("published_at", { withTimezone: true }),
  retrievedAt: timestamp("retrieved_at", { withTimezone: true }).notNull().defaultNow(),
  lang: text("lang").notNull().default("fr"),
  dedupClusterId: text("dedup_cluster_id"),
  domains: text("domains").array().notNull().default(emptyArr),
  subtags: text("subtags").array().notNull().default(emptyArr),
  islands: text("islands").array().notNull().default(emptyArr),
  entities: text("entities").array().notNull().default(emptyArr),
  tagged: boolean("tagged").notNull().default(false),
});

export const officialNotices = pgTable("official_notices", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceId: text("source_id").references(() => sources.id),
  rawItemId: uuid("raw_item_id").references(() => rawItems.id),
  noticeType: text("notice_type"), // communique | decree | crisis | appointment | jo
  title: text("title").notNull(),
  body: text("body"),
  issuedAt: timestamp("issued_at", { withTimezone: true }),
  retrievedAt: timestamp("retrieved_at", { withTimezone: true }).notNull().defaultNow(),
  url: text("url").notNull(),
  lang: text("lang").notNull().default("fr"),
  domains: text("domains").array().notNull().default(emptyArr),
  islands: text("islands").array().notNull().default(emptyArr),
  entities: text("entities").array().notNull().default(emptyArr),
  tagged: boolean("tagged").notNull().default(false),
});

export const statisticalObservations = pgTable("statistical_observations", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceId: text("source_id").references(() => sources.id),
  seriesCode: text("series_code"),
  indicator: text("indicator").notNull(),
  period: text("period").notNull(), // e.g. "2026-05" or "2025"
  value: doublePrecision("value"),
  unit: text("unit"),
  geography: text("geography"), // island slug or "territory"
  theme: text("theme"), // domain/subtag slug
  retrievedAt: timestamp("retrieved_at", { withTimezone: true }).notNull().defaultNow(),
});

export const weatherAlerts = pgTable("weather_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceId: text("source_id").references(() => sources.id),
  island: text("island"), // island slug or zone
  hazardType: text("hazard_type"), // cyclone | rain | marine | swell | tsunami
  vigilanceLevel: text("vigilance_level"), // green | yellow | orange | red (or local stage)
  issuedAt: timestamp("issued_at", { withTimezone: true }),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  status: text("status").notNull().default("active"), // active | cleared
  url: text("url"),
  retrievedAt: timestamp("retrieved_at", { withTimezone: true }).notNull().defaultNow(),
});

export const travelAdvisories = pgTable("travel_advisories", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceId: text("source_id").references(() => sources.id), // "smartraveller" | "travel-gc-ca"
  level: text("level"),
  prevLevel: text("prev_level"),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  summary: text("summary"),
  url: text("url"),
  retrievedAt: timestamp("retrieved_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------- analysis */

export const analysisOutputs = pgTable("analysis_outputs", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(), // island_pulse | daily_brief | topic_alert | weekly
  island: text("island"), // island slug (for island_pulse)
  domain: text("domain"), // domain slug (optional grouping)
  period: text("period"), // window label, e.g. "2026-06-26"
  headline: text("headline").notNull(),
  take: text("take").notNull(), // what this means
  whyItMatters: text("why_it_matters"),
  support: jsonb("support"), // { kind:"metric"|"quote", ... } | null
  citations: jsonb("citations").notNull().default(sql`'[]'::jsonb`), // [{itemType,itemId,url,label}]
  facts: jsonb("facts").notNull().default(sql`'[]'::jsonb`), // string[]
  interpretation: jsonb("interpretation").notNull().default(sql`'[]'::jsonb`), // string[]
  signal: text("signal").notNull().default("moderate"), // strong | moderate | thin
  confidence: doublePrecision("confidence"),
  model: text("model"),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
  reviewed: boolean("reviewed").notNull().default(false),
});
