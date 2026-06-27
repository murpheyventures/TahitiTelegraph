// TahitiTelegraph topic taxonomy: 8 top-level domains, each with sub-tags.
// Canonical source of truth — the DB `topics` table is seeded from this, the
// pipeline tags items against it, and the UI colour-codes by domain.

export interface Subtag {
  slug: string;
  labelEn: string;
  labelFr: string;
}

export interface Domain {
  slug: string;
  labelEn: string;
  labelFr: string;
  /** Short reo Tahiti / accent label, optional. */
  labelTy?: string;
  color: string; // hex, used for domain colour-coding
  blurb: string;
  subtags: Subtag[];
}

export const DOMAINS: Domain[] = [
  {
    slug: "tourism-access",
    labelEn: "Tourism & Access",
    labelFr: "Tourisme & accès",
    color: "#2BB6C4", // lagoon turquoise
    blurb: "Visitors, hotels, air and sea access, getting between the islands.",
    subtags: [
      { slug: "tourism", labelEn: "Tourism", labelFr: "Tourisme" },
      { slug: "hotels-resorts", labelEn: "Hotels & resorts", labelFr: "Hôtellerie" },
      { slug: "flights-air-access", labelEn: "Flights & air access", labelFr: "Transport aérien" },
      { slug: "cruises", labelEn: "Cruises", labelFr: "Croisière" },
      { slug: "inter-island-transport", labelEn: "Inter-island transport", labelFr: "Transport inter-îles" },
    ],
  },
  {
    slug: "economy",
    labelEn: "Economy & Cost of Living",
    labelFr: "Économie & coût de la vie",
    color: "#1F8A55", // breadfruit green
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
    labelEn: "Governance & Politics",
    labelFr: "Gouvernance & politique",
    color: "#7B2D3A", // oxblood
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
    labelEn: "Infrastructure & Development",
    labelFr: "Infrastructures & aménagement",
    color: "#B07514", // tamanu amber
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
    labelEn: "Environment & Ocean",
    labelFr: "Environnement & océan",
    color: "#0E7C7B", // deep teal
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
    labelEn: "Climate, Weather & Hazards",
    labelFr: "Climat, météo & risques",
    color: "#C2410C", // warning ember
    blurb: "Forecasts, cyclones and natural hazards, and travel advisories.",
    subtags: [
      { slug: "climate-weather", labelEn: "Climate & weather", labelFr: "Climat / météo" },
      { slug: "natural-hazards", labelEn: "Natural hazards", labelFr: "Risques naturels" },
      { slug: "travel-advisories", labelEn: "Travel advisories", labelFr: "Conseils aux voyageurs" },
    ],
  },
  {
    slug: "safety-society",
    labelEn: "Safety, Health & Society",
    labelFr: "Sécurité, santé & société",
    color: "#7C5295", // plum
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
    labelEn: "Culture & Regional Pacific",
    labelFr: "Culture & Pacifique régional",
    color: "#E8552B", // hibiscus coral
    blurb: "Culture and events, sport, and the wider Pacific.",
    subtags: [
      { slug: "culture-events", labelEn: "Culture & events", labelFr: "Culture / événements" },
      { slug: "sport", labelEn: "Sport (va'a, surf)", labelFr: "Sport (va'a, surf)" },
      { slug: "regional-pacific-politics", labelEn: "Regional Pacific politics", labelFr: "Politique régionale du Pacifique" },
    ],
  },
];

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
