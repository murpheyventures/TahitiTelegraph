// TahitiTelegraph topic taxonomy.
// Two SECTIONS: "tourism" (the main focus) and "local" (general news).
// Canonical source of truth — the DB `topics` table is seeded from this, the
// pipeline tags items against it, and the UI colour-codes + tabs by section.

export type Section = "tourism" | "local";

export interface Subtag {
  slug: string;
  labelEn: string;
  labelFr: string;
}

export interface Domain {
  slug: string;
  section: Section;
  labelEn: string;
  labelFr: string;
  /** Short reo Tahiti / accent label, optional. */
  labelTy?: string;
  color: string; // hex, used for colour-coding
  blurb: string;
  subtags: Subtag[];
}

export const DOMAINS: Domain[] = [
  // ───────────────────────── TOURISM (main focus) ─────────────────────────
  {
    slug: "visitor-demand",
    section: "tourism",
    labelEn: "Visitor Demand & Data",
    labelFr: "Fréquentation & données",
    color: "#2bb6c4",
    blurb: "Arrivals, source markets, length of stay, cruise vs land, occupancy.",
    subtags: [
      { slug: "visitor-arrivals", labelEn: "Visitor arrivals", labelFr: "Arrivées de touristes" },
      { slug: "source-markets", labelEn: "Source markets", labelFr: "Marchés émetteurs" },
      { slug: "length-of-stay", labelEn: "Length of stay", labelFr: "Durée de séjour" },
      { slug: "occupancy", labelEn: "Occupancy & lodging", labelFr: "Hébergement & occupation" },
    ],
  },
  {
    slug: "hotels-resorts",
    section: "tourism",
    labelEn: "Hotels & Resorts",
    labelFr: "Hôtellerie",
    color: "#e8552b",
    blurb: "Openings, renovations, reopenings, rebrands, ownership, the pipeline.",
    subtags: [
      { slug: "hotel-openings", labelEn: "Openings", labelFr: "Ouvertures" },
      { slug: "renovations-reopenings", labelEn: "Renovations & reopenings", labelFr: "Rénovations & réouvertures" },
      { slug: "rebrands-ownership", labelEn: "Rebrands & ownership", labelFr: "Changement d'enseigne / propriété" },
      { slug: "hotel-pipeline", labelEn: "Hotel pipeline", labelFr: "Projets hôteliers" },
      { slug: "luxury-resorts", labelEn: "Luxury resorts", labelFr: "Resorts de luxe" },
    ],
  },
  {
    slug: "cruise",
    section: "tourism",
    labelEn: "Cruise",
    labelFr: "Croisière",
    color: "#0e7c7b",
    blurb: "Deployment, itineraries, port calls, terminals, restrictions.",
    subtags: [
      { slug: "cruise-deployment", labelEn: "Deployment & itineraries", labelFr: "Déploiement & itinéraires" },
      { slug: "port-calls", labelEn: "Port calls", labelFr: "Escales" },
      { slug: "cruise-restrictions", labelEn: "Cruise restrictions", labelFr: "Restrictions croisière" },
      { slug: "cruise-terminal", labelEn: "Cruise terminal", labelFr: "Terminal croisière" },
    ],
  },
  {
    slug: "air-access",
    section: "tourism",
    labelEn: "Air Access",
    labelFr: "Accès aérien",
    color: "#4f9ed9",
    blurb: "International routes, seat capacity, airport traffic, codeshares.",
    subtags: [
      { slug: "international-routes", labelEn: "International routes", labelFr: "Lignes internationales" },
      { slug: "airport-traffic", labelEn: "Airport traffic", labelFr: "Trafic aéroport" },
      { slug: "seat-capacity", labelEn: "Seat capacity", labelFr: "Capacité en sièges" },
      { slug: "codeshares", labelEn: "Codeshares & partnerships", labelFr: "Codeshares & partenariats" },
    ],
  },
  {
    slug: "inter-island",
    section: "tourism",
    labelEn: "Inter-island Transport",
    labelFr: "Transport inter-îles",
    color: "#6cae75",
    blurb: "Domestic air routes and inter-island ferries and schooners.",
    subtags: [
      { slug: "domestic-routes", labelEn: "Domestic routes", labelFr: "Lignes intérieures" },
      { slug: "ferries-schooners", labelEn: "Ferries & schooners", labelFr: "Ferries & goélettes" },
    ],
  },
  {
    slug: "sustainability-policy",
    section: "tourism",
    labelEn: "Sustainability & Policy",
    labelFr: "Durabilité & politique",
    color: "#2e9e6b",
    blurb: "FM27, visitor caps, destination management, tourism regulation.",
    subtags: [
      { slug: "sustainable-tourism", labelEn: "Sustainable tourism", labelFr: "Tourisme durable" },
      { slug: "visitor-caps", labelEn: "Visitor caps", labelFr: "Plafonds de fréquentation" },
      { slug: "destination-management", labelEn: "Destination management", labelFr: "Gestion de la destination" },
      { slug: "tourism-regulation", labelEn: "Tourism regulation", labelFr: "Réglementation touristique" },
    ],
  },
  {
    slug: "travel-trade",
    section: "tourism",
    labelEn: "Travel Trade",
    labelFr: "Trade & distribution",
    color: "#c98a1e",
    blurb: "What advisors are selling, packaging trends, availability, sentiment.",
    subtags: [
      { slug: "advisor-sentiment", labelEn: "Advisor sentiment", labelFr: "Sentiment des agents" },
      { slug: "packaging-trends", labelEn: "Packaging trends", labelFr: "Tendances forfaits" },
      { slug: "availability", labelEn: "Availability", labelFr: "Disponibilité" },
    ],
  },
  {
    slug: "dmc-operators",
    section: "tourism",
    labelEn: "DMC & Operators",
    labelFr: "Réceptifs & opérateurs",
    color: "#9a6fb0",
    blurb: "Local DMC and operator updates, products, and packages.",
    subtags: [
      { slug: "operator-updates", labelEn: "Operator updates", labelFr: "Actus opérateurs" },
      { slug: "product-packages", labelEn: "Products & packages", labelFr: "Produits & forfaits" },
    ],
  },
  {
    slug: "marine-experiential",
    section: "tourism",
    labelEn: "Marine & Experiential",
    labelFr: "Tourisme marin & expériences",
    color: "#2f8fb3",
    blurb: "Diving, snorkeling, whale watching, lagoon and nautical experiences.",
    subtags: [
      { slug: "diving-snorkeling", labelEn: "Diving & snorkeling", labelFr: "Plongée & snorkeling" },
      { slug: "whale-watching", labelEn: "Whale watching", labelFr: "Observation des baleines" },
      { slug: "lagoon-activities", labelEn: "Lagoon activities", labelFr: "Activités lagon" },
    ],
  },
  {
    slug: "events-festivals",
    section: "tourism",
    labelEn: "Events & Festivals",
    labelFr: "Événements & festivals",
    color: "#d4567f",
    blurb: "Heiva, Hawaiki Nui Va'a, and cultural events that draw visitors.",
    subtags: [
      { slug: "heiva", labelEn: "Heiva", labelFr: "Heiva" },
      { slug: "vaa-events", labelEn: "Va'a events", labelFr: "Événements va'a" },
      { slug: "cultural-festivals", labelEn: "Cultural festivals", labelFr: "Festivals culturels" },
    ],
  },

  // ───────────────────────── LOCAL NEWS (general) ─────────────────────────
  {
    slug: "economy",
    section: "local",
    labelEn: "Economy & Cost of Living",
    labelFr: "Économie & coût de la vie",
    color: "#1F8A55",
    blurb: "Prices, jobs, the primary sector, and the broader economy.",
    subtags: [
      { slug: "business-economy", labelEn: "Business & economy", labelFr: "Économie" },
      { slug: "inflation-prices", labelEn: "Inflation & prices", labelFr: "Prix / inflation" },
      { slug: "cost-of-living", labelEn: "Cost of living", labelFr: "Coût de la vie" },
      { slug: "jobs-employment", labelEn: "Jobs & employment", labelFr: "Emploi" },
      { slug: "agriculture-primary", labelEn: "Agriculture & primary sector", labelFr: "Agriculture & secteur primaire" },
    ],
  },
  {
    slug: "governance",
    section: "local",
    labelEn: "Governance & Politics",
    labelFr: "Gouvernance & politique",
    color: "#7B2D3A",
    blurb: "Government, elections, sovereignty, and the nuclear-testing legacy.",
    subtags: [
      { slug: "government-policy", labelEn: "Government & policy", labelFr: "Gouvernement / politiques" },
      { slug: "elections-politics", labelEn: "Elections & politics", labelFr: "Élections / politique" },
      { slug: "sovereignty-decolonization", labelEn: "Sovereignty & decolonization", labelFr: "Souveraineté / décolonisation" },
      { slug: "nuclear-legacy", labelEn: "Nuclear legacy (CEP/CIVEN)", labelFr: "Héritage nucléaire (CEP/CIVEN)" },
    ],
  },
  {
    slug: "infrastructure",
    section: "local",
    labelEn: "Infrastructure & Development",
    labelFr: "Infrastructures & aménagement",
    color: "#B07514",
    blurb: "Public works, housing and land, energy, and connectivity.",
    subtags: [
      { slug: "public-works", labelEn: "Public works & infrastructure", labelFr: "Travaux publics / infrastructures" },
      { slug: "housing-land", labelEn: "Housing & land", labelFr: "Logement / foncier" },
      { slug: "land-tenure", labelEn: "Land tenure (indivision)", labelFr: "Régime foncier (indivision)" },
      { slug: "energy-utilities", labelEn: "Energy & utilities", labelFr: "Énergie & réseaux" },
      { slug: "connectivity-telecom", labelEn: "Connectivity & telecom", labelFr: "Connectivité / télécoms" },
    ],
  },
  {
    slug: "environment-ocean",
    section: "local",
    labelEn: "Environment & Ocean",
    labelFr: "Environnement & océan",
    color: "#0E7C7B",
    blurb: "Environment, marine resources, fisheries, and pearl farming.",
    subtags: [
      { slug: "environment", labelEn: "Environment", labelFr: "Environnement" },
      { slug: "marine-resources", labelEn: "Marine resources", labelFr: "Ressources marines" },
      { slug: "fisheries", labelEn: "Fisheries", labelFr: "Pêche" },
      { slug: "pearl-farming", labelEn: "Pearl farming", labelFr: "Perliculture" },
    ],
  },
  {
    slug: "weather-hazards",
    section: "local",
    labelEn: "Climate, Weather & Hazards",
    labelFr: "Climat, météo & risques",
    color: "#C2410C",
    blurb: "Forecasts, cyclones and natural hazards, and travel advisories.",
    subtags: [
      { slug: "climate-weather", labelEn: "Climate & weather", labelFr: "Climat / météo" },
      { slug: "natural-hazards", labelEn: "Natural hazards", labelFr: "Risques naturels" },
      { slug: "travel-advisories", labelEn: "Travel advisories", labelFr: "Conseils aux voyageurs" },
    ],
  },
  {
    slug: "safety-society",
    section: "local",
    labelEn: "Safety, Health & Society",
    labelFr: "Sécurité, santé & société",
    color: "#7C5295",
    blurb: "Public safety, drug trafficking, health, and social movements.",
    subtags: [
      { slug: "public-safety", labelEn: "Public safety", labelFr: "Sécurité publique" },
      { slug: "drug-trafficking-crime", labelEn: "Drug trafficking & crime", labelFr: "Trafic de drogue / criminalité" },
      { slug: "health", labelEn: "Health", labelFr: "Santé" },
      { slug: "social-movements", labelEn: "Social movements", labelFr: "Mouvements sociaux" },
    ],
  },
  {
    slug: "culture-regional",
    section: "local",
    labelEn: "Culture & Regional Pacific",
    labelFr: "Culture & Pacifique régional",
    color: "#E8552B",
    blurb: "Culture and events, sport, and the wider Pacific.",
    subtags: [
      { slug: "culture-events", labelEn: "Culture & events", labelFr: "Culture / événements" },
      { slug: "sport", labelEn: "Sport (va'a, surf)", labelFr: "Sport (va'a, surf)" },
      { slug: "regional-pacific-politics", labelEn: "Regional Pacific politics", labelFr: "Politique régionale du Pacifique" },
    ],
  },
];

export const TOURISM_CATEGORIES: Domain[] = DOMAINS.filter((d) => d.section === "tourism");
export const LOCAL_DOMAINS: Domain[] = DOMAINS.filter((d) => d.section === "local");

export const DOMAIN_BY_SLUG: Record<string, Domain> = Object.fromEntries(
  DOMAINS.map((d) => [d.slug, d])
);

const SUBTAG_TO_DOMAIN: Record<string, Domain> = Object.fromEntries(
  DOMAINS.flatMap((d) => d.subtags.map((s) => [s.slug, d]))
);

export function getDomain(slug: string): Domain | undefined {
  return DOMAIN_BY_SLUG[slug];
}

export function domainForSubtag(subtagSlug: string): Domain | undefined {
  return SUBTAG_TO_DOMAIN[subtagSlug];
}

/** Section ("tourism" | "local") for a domain or sub-tag slug; defaults to "local". */
export function domainSection(slug: string | null | undefined): Section {
  if (!slug) return "local";
  return (DOMAIN_BY_SLUG[slug]?.section ?? SUBTAG_TO_DOMAIN[slug]?.section ?? "local");
}

/** Resolve a colour for any domain or sub-tag slug; falls back to neutral. */
export function colorForTopic(slug: string): string {
  return DOMAIN_BY_SLUG[slug]?.color ?? SUBTAG_TO_DOMAIN[slug]?.color ?? "#64748b";
}

export function allSubtagSlugs(): string[] {
  return DOMAINS.flatMap((d) => d.subtags.map((s) => s.slug));
}

export function allTopicSlugs(): string[] {
  return [...DOMAINS.map((d) => d.slug), ...allSubtagSlugs()];
}
