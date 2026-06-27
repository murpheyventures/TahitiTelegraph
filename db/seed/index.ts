// Seed: registries (islands, topics, sources) + a few HAND-WRITTEN example
// island pulses so the UI has something to render before the live pipeline runs.
// Idempotent: re-running replaces registry + seed rows.
//
// The example pulses are grounded in facts verified during the feasibility
// audit (ISPF 2024 tourism record; IEOM cruise-led growth; Tahitinews "ice" on
// Taha'a; AU/CA standing advisories). They are marked model = "seed-example".

import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, schema, sql as pg } from "../client";
import { ISLANDS } from "../../src/lib/islands";
import { DOMAINS } from "../../src/lib/taxonomy";

async function seedIslands() {
  await db.delete(schema.islands);
  await db.insert(schema.islands).values(
    ISLANDS.map((i) => ({
      slug: i.slug,
      name: i.name,
      nameTy: i.nameTy ?? null,
      archipelago: i.archipelago,
      aliases: i.aliases,
      sortOrder: i.sortOrder,
    }))
  );
  console.log(`  islands: ${ISLANDS.length}`);
}

async function seedTopics() {
  await db.delete(schema.topics);
  const rows: (typeof schema.topics.$inferInsert)[] = [];
  DOMAINS.forEach((d, di) => {
    rows.push({
      slug: d.slug,
      labelEn: d.labelEn,
      labelFr: d.labelFr,
      labelTy: d.labelTy ?? null,
      parentSlug: null,
      color: d.color,
      sortOrder: di * 100,
    });
    d.subtags.forEach((s, si) => {
      rows.push({
        slug: s.slug,
        labelEn: s.labelEn,
        labelFr: s.labelFr,
        parentSlug: d.slug,
        color: d.color,
        sortOrder: di * 100 + si + 1,
      });
    });
  });
  await db.insert(schema.topics).values(rows);
  console.log(`  topics: ${rows.length}`);
}

const SOURCES: (typeof schema.sources.$inferInsert)[] = [
  { id: "tahiti-infos", name: "Tahiti Infos", url: "https://www.tahiti-infos.com", sourceType: "news", ingestionMethod: "rss", language: "fr", cadence: "hourly", licenceNote: "Copyrighted FR press; personal-use full-text ingest only." },
  { id: "radio1", name: "Radio 1 Tahiti", url: "https://www.radio1.pf", sourceType: "news", ingestionMethod: "crawl", language: "fr", cadence: "hourly", active: false, licenceNote: "RSS /feed/ → 403 (Cloudflare bot-block). Monitor / Phase-2 crawl." },
  { id: "tntv", name: "TNTV", url: "https://www.tntv.pf", sourceType: "news", ingestionMethod: "crawl", language: "fr", cadence: "hourly", active: false, licenceNote: "No public RSS (SPA). Phase-2 HTML crawl / sitemap." },
  { id: "tahitinews-co", name: "Tahitinews.co", url: "https://www.tahitinews.co", sourceType: "news", ingestionMethod: "rss", language: "fr", cadence: "hourly", licenceNote: "Active aggregator; dedup against majors." },
  { id: "la1ere-polynesie", name: "Polynésie la 1ère", url: "https://la1ere.franceinfo.fr/polynesie", sourceType: "news", ingestionMethod: "crawl", language: "fr", cadence: "daily", licenceNote: "France Télévisions IP; personal use only." },
  { id: "presidence-pf", name: "Présidence de la Polynésie française", url: "https://www.presidence.pf", sourceType: "official", ingestionMethod: "rss", language: "fr", cadence: "daily", licenceNote: "Official communiqués." },
  { id: "haut-commissariat", name: "Haut-commissariat de la République", url: "https://www.polynesie-francaise.pref.gouv.fr", sourceType: "official", ingestionMethod: "crawl", language: "fr", cadence: "daily", licenceNote: "French State; usually Licence Ouverte." },
  { id: "lexpol", name: "LEXPOL (Journal Officiel)", url: "https://lexpol.cloud.pf", sourceType: "legal", ingestionMethod: "crawl", language: "fr", cadence: "daily", active: false, licenceNote: "Official legal texts. Phase 2." },
  { id: "ispf", name: "ISPF", url: "https://www.ispf.pf", sourceType: "economic", ingestionMethod: "data_file", language: "fr", cadence: "weekly", licenceNote: "Open data (Licence Ouverte family)." },
  { id: "ieom", name: "IEOM", url: "https://www.ieom.fr", sourceType: "economic", ingestionMethod: "pdf", language: "fr", cadence: "monthly", active: false, licenceNote: "Central-bank reports (PDF). Phase 2." },
  { id: "meteo-france-pf", name: "Météo-France Polynésie", url: "https://meteo.pf/fr/vigilance", sourceType: "weather", ingestionMethod: "crawl", language: "fr", cadence: "hourly", licenceNote: "Copyright; store status flag + link only." },
  { id: "smartraveller", name: "Smartraveller (AU)", url: "https://www.smartraveller.gov.au/destinations/pacific/french-polynesia", sourceType: "advisory", ingestionMethod: "crawl", language: "en", cadence: "event", licenceNote: "Australian Govt; likely CC BY." },
  { id: "travel-gc-ca", name: "Travel Advice (Canada)", url: "https://travel.gc.ca/destinations/french-polynesia", sourceType: "advisory", ingestionMethod: "rss", language: "en", cadence: "event", licenceNote: "Open Government Licence – Canada." },
  { id: "spc-pdh", name: "SPC Pacific Data Hub (PDH.stat)", url: "https://stats.pacificdata.org", sourceType: "regional", ingestionMethod: "api", language: "en", cadence: "monthly", active: false, licenceNote: "SDMX API; open. Phase 2." },

  // ── Tourism layer (per tourism_source_feasibility_audit.md) ──
  { id: "hospitalitynet", name: "HospitalityNet", url: "https://www.hospitalitynet.org/rss", sourceType: "trade_press", ingestionMethod: "rss", language: "en", cadence: "daily", licenceNote: "RSS + API; FP-filtered; republished PRs. review_required if public." },
  { id: "travelpulse", name: "TravelPulse", url: "https://www.travelpulse.com", sourceType: "trade_press", ingestionMethod: "rss", language: "en", cadence: "daily", licenceNote: "Free; cruise/destinations RSS; FP-filtered. review_required if public." },
  { id: "cruisemapper-fp", name: "CruiseMapper (FP ports)", url: "https://www.cruisemapper.com/ports/papeete-port-109", sourceType: "cruise", ingestionMethod: "crawl", language: "en", cadence: "weekly", licenceNote: "robots allows /ports; proprietary aggregated schedule. review_required if public." },
  { id: "adt-airport", name: "Aéroport de Tahiti-Faa'a (ADT)", url: "https://tahiti-aeroports.com", sourceType: "airport", ingestionMethod: "crawl", language: "fr", cadence: "monthly", licenceNote: "Monthly passenger traffic in press releases (demand proxy)." },
  { id: "tahiti-tourisme-corp", name: "Tahiti Tourisme (corporate)", url: "https://tahititourisme.org/en-org/", sourceType: "tourism", ingestionMethod: "crawl", language: "en", cadence: "weekly", active: false, licenceNote: "Official DMO press + FM27; sitemap crawl (RSS disallowed). Phase 2." },
  { id: "ispf-tourism", name: "ISPF tourism datasets", url: "https://data.ispf.pf/", sourceType: "tourism", ingestionMethod: "data_file", language: "fr", cadence: "monthly", active: false, licenceNote: "Open licence; arrivals/cruise/source markets. Best-effort; verify endpoints." },
  { id: "fm27", name: "Fāri'ira'a Manihini 2027 (FM27)", url: "https://fm27.pf/en/", sourceType: "tourism", ingestionMethod: "crawl", language: "en", cadence: "monthly", active: false, licenceNote: "Sustainable-tourism strategy + updates. Phase 2." },
  { id: "air-tahiti-nui-corp", name: "Air Tahiti Nui (corporate)", url: "https://us.airtahitinui.com/news", sourceType: "airline", ingestionMethod: "crawl", language: "en", cadence: "weekly", active: false, licenceNote: "Intl routes/capacity + annual reports. Phase 2." },
  { id: "air-tahiti-corp", name: "Air Tahiti", url: "https://www.airtahiti.com/actualites", sourceType: "airline", ingestionMethod: "crawl", language: "fr", cadence: "weekly", active: false, licenceNote: "Domestic routes; heavy local-news overlap. Phase 2." },
  { id: "air-moana", name: "Air Moana", url: "https://www.airmoana.com", sourceType: "airline", ingestionMethod: "crawl", language: "fr", cadence: "weekly", active: false, licenceNote: "Domestic routes. Phase 2." },
  { id: "port-de-papeete-cruise", name: "Port autonome de Papeete (cruise)", url: "https://www.portdepapeete.pf", sourceType: "airport", ingestionMethod: "crawl", language: "fr", cadence: "monthly", active: false, licenceNote: "Official cruise calls / Te Anuanua terminal. Phase 2." },
];

async function seedSources() {
  for (const s of SOURCES) {
    await db
      .insert(schema.sources)
      .values(s)
      .onConflictDoUpdate({
        target: schema.sources.id,
        set: {
          name: s.name,
          url: s.url,
          sourceType: s.sourceType,
          ingestionMethod: s.ingestionMethod,
          language: s.language ?? "fr",
          cadence: s.cadence ?? "daily",
          active: s.active ?? true,
          licenceNote: s.licenceNote ?? null,
        },
      });
  }
  console.log(`  sources: ${SOURCES.length}`);
}

const SEED_MODEL = "seed-example";

async function seedExamplePulses() {
  await db.delete(schema.analysisOutputs).where(eq(schema.analysisOutputs.model, SEED_MODEL));
  const now = new Date();
  const period = now.toISOString().slice(0, 10);

  await db.insert(schema.analysisOutputs).values([
    {
      type: "island_pulse",
      island: "territory",
      domain: "visitor-demand",
      period,
      headline: "Tourism set a record in 2024, but the growth is increasingly cruise-led",
      take: "French Polynesia welcomed more visitors than ever in 2024, yet the marginal growth came from cruise passengers rather than higher-spending land stays, a quieter shift in the shape of the tourism economy.",
      whyItMatters:
        "Cruise-led growth spreads differently across the fenua than resort stays: it concentrates spending around port calls and day-trips rather than nights in island hotels, which matters for jobs and revenue outside Tahiti and Bora Bora.",
      support: { kind: "metric", value: "263,766", label: "visitors in 2024 (record)", trend: "up" },
      citations: [
        { itemType: "statistic", label: "ISPF, 2024 tourism review", url: "https://www.ispf.pf/publication/1489" },
        { itemType: "data_report", label: "IEOM, 2024 annual economic report", url: "https://www.ieom.fr/Rapport-annuel-economique-2024-de-l-IEOM-Polynesie-Francaise" },
      ],
      facts: [
        "ISPF reports 263,766 visitors in 2024, a record, up slightly from 261,813 in 2023.",
        "IEOM attributes much of the 2024 momentum to a rise in cruise-ship visitors.",
      ],
      interpretation: [
        "The mix shift toward cruise suggests headline visitor counts may overstate gains in island-level hotel demand.",
      ],
      signal: "strong",
      confidence: 0.8,
      model: SEED_MODEL,
    },
    {
      type: "island_pulse",
      island: "tahaa",
      domain: "safety-society",
      period,
      headline: "Methamphetamine (‘ice’) trafficking is reaching even the Leeward outer islands",
      take: "Reporting indicates the ice trade has spread beyond Tahiti to smaller Leeward islands such as Taha'a, an early signal that a problem once seen as urban is becoming territory-wide.",
      whyItMatters:
        "Drug penetration into small-island communities strains policing, health, and social services that are thin outside Papeete, and tends to track other crime, worth watching as a recurring beat, not a one-off.",
      support: { kind: "quote", text: "Même Taha'a est gangrénée par le trafic d'ice", attribution: "Tahitinews.co headline, Jun 2026" },
      citations: [
        { itemType: "article", label: "Tahitinews.co", url: "https://www.tahitinews.co" },
      ],
      facts: [
        "A June 2026 Tahitinews.co report describes ice trafficking affecting Taha'a.",
      ],
      interpretation: [
        "Single-source so far; treat as a lead to corroborate against Tahiti Infos / official sources before drawing trend conclusions.",
      ],
      signal: "thin",
      confidence: 0.45,
      model: SEED_MODEL,
    },
    {
      type: "island_pulse",
      island: "territory",
      domain: "weather-hazards",
      period,
      headline: "Standing travel-safety picture: dengue risk year-round, cyclones Nov to Apr",
      take: "Foreign-government advisories keep French Polynesia at their baseline ‘normal precautions’ level, with the recurring caveats that matter for planning: mosquito-borne illness all year and the cyclone window from November to April.",
      whyItMatters:
        "These are the stable background risks against which any acute event (a vigilance upgrade, an outbreak) should be read, useful as the default safety frame for the islands.",
      support: { kind: "metric", value: "Level 1", label: "AU & CA: normal precautions", trend: "flat" },
      citations: [
        { itemType: "advisory", label: "Smartraveller (AU)", url: "https://www.smartraveller.gov.au/destinations/pacific/french-polynesia" },
        { itemType: "advisory", label: "travel.gc.ca (Canada)", url: "https://travel.gc.ca/destinations/french-polynesia" },
      ],
      facts: [
        "Australia and Canada both advise exercising normal/standard precautions for French Polynesia.",
        "Both note dengue-type illness is common and the cyclone season runs November–April.",
      ],
      interpretation: [
        "No elevated alert at present; this card establishes the baseline the pipeline will diff future changes against.",
      ],
      signal: "moderate",
      confidence: 0.7,
      model: SEED_MODEL,
    },
  ]);
  console.log("  example pulses: 3");
}

async function seedWeatherAndAdvisories() {
  await db.delete(schema.weatherAlerts).where(eq(schema.weatherAlerts.sourceId, "meteo-france-pf"));
  await db.insert(schema.weatherAlerts).values({
    sourceId: "meteo-france-pf",
    island: "territory",
    hazardType: "cyclone",
    vigilanceLevel: "green",
    issuedAt: new Date(),
    status: "active",
    url: "https://meteo.pf/fr/vigilance",
  });

  await db.delete(schema.travelAdvisories);
  await db.insert(schema.travelAdvisories).values([
    { sourceId: "smartraveller", level: "Exercise normal safety precautions", updatedAt: new Date(), summary: "Dengue common; cyclone season Nov–Apr.", url: "https://www.smartraveller.gov.au/destinations/pacific/french-polynesia" },
    { sourceId: "travel-gc-ca", level: "Take normal security precautions", updatedAt: new Date(), summary: "Standard precautions; monitor weather in cyclone season.", url: "https://travel.gc.ca/destinations/french-polynesia" },
  ]);
  console.log("  weather + advisories seeded");
}

async function main() {
  console.log("Seeding TahitiTelegraph…");
  await seedIslands();
  await seedTopics();
  await seedSources();
  await seedExamplePulses();
  await seedWeatherAndAdvisories();
  console.log("Done.");
  await pg.end({ timeout: 5 });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
