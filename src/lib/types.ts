// View-model types the UI renders. These are projections of the DB rows
// (analysis_outputs + weather_alerts + travel_advisories + official_notices),
// adapted from the retelligence content contract.

export type Signal = "strong" | "moderate" | "thin";

export interface Citation {
  itemType: string; // "article" | "official_notice" | "statistic" | "advisory" | "weather"
  itemId?: string;
  url?: string;
  label: string; // e.g. "Tahiti Infos, 26 Jun 2026"
}

export type Support =
  | { kind: "metric"; value: string; label: string; trend?: "up" | "down" | "flat" }
  | { kind: "quote"; text: string; attribution: string };

/** One analysed item — the unit the site is built around. */
export interface PulseCard {
  id: string;
  island?: string | null;
  domain?: string | null;
  headline: string;
  take: string; // what this means
  whyItMatters?: string | null;
  support?: Support | null;
  citations: Citation[];
  facts: string[];
  interpretation: string[];
  signal: Signal;
  confidence?: number | null;
  generatedAt: string;
}

export interface WeatherAlertView {
  id: string;
  island?: string | null;
  hazardType?: string | null;
  vigilanceLevel?: string | null;
  issuedAt?: string | null;
  validUntil?: string | null;
  status: string;
  url?: string | null;
}

export interface AdvisoryView {
  id: string;
  sourceId?: string | null;
  level?: string | null;
  prevLevel?: string | null;
  updatedAt?: string | null;
  summary?: string | null;
  url?: string | null;
}

export interface OfficialNoticeView {
  id: string;
  noticeType?: string | null;
  title: string;
  issuedAt?: string | null;
  url: string;
  domains: string[];
  islands: string[];
  sourceId?: string | null;
}

export interface SourceHealth {
  id: string;
  name: string;
  sourceType: string;
  cadence: string;
  active: boolean;
  lastRunAt?: string | null;
  lastStatus?: string | null;
  lastItemsNew?: number | null;
}
