// Island / geography registry. Canonical source for the DB `islands` table,
// the pipeline geo-resolver (via `aliases`), and the UI.
//
// "Aggregate" slugs (windward, leeward, tuamotu, marquesas, austral, gambier,
// territory, regional-pacific) let items tag a whole archipelago or the whole
// fenua when an article isn't island-specific.

export type Archipelago =
  | "society-windward"
  | "society-leeward"
  | "tuamotu"
  | "marquesas"
  | "austral"
  | "gambier"
  | "territory"
  | "regional";

export interface Island {
  slug: string;
  name: string;
  nameTy?: string; // reo Tahiti, where known
  archipelago: Archipelago;
  aliases: string[]; // lowercase FR/EN/reo forms for geo-resolution
  sortOrder: number;
  /** True for archipelago/territory rollups (vs a single island). */
  aggregate?: boolean;
}

export const ISLANDS: Island[] = [
  // Territory rollup (first)
  { slug: "territory", name: "French Polynesia", nameTy: "Pōrīnetia Farāni", archipelago: "territory", aggregate: true, sortOrder: 0,
    aliases: ["french polynesia", "polynésie française", "polynesie francaise", "fenua", "te fenua", "tahiti et ses îles", "pf"] },

  // Society — Windward (Îles du Vent)
  { slug: "windward", name: "Windward Islands", archipelago: "society-windward", aggregate: true, sortOrder: 10,
    aliases: ["îles du vent", "iles du vent", "windward islands"] },
  { slug: "tahiti", name: "Tahiti", nameTy: "Tahiti", archipelago: "society-windward", sortOrder: 11,
    aliases: ["tahiti", "papeete", "faaa", "faa'a", "punaauia", "pirae", "intercontinental tahiti", "te moana tahiti", "hilton tahiti"] },
  { slug: "moorea", name: "Moorea", nameTy: "Mo'orea", archipelago: "society-windward", sortOrder: 12,
    aliases: ["moorea", "mo'orea", "moʻorea", "sofitel kia ora moorea"] },
  { slug: "tetiaroa", name: "Tetiaroa", nameTy: "Tetiaroa", archipelago: "society-windward", sortOrder: 13,
    aliases: ["tetiaroa", "the brando", "brando resort"] },

  // Society — Leeward (Îles Sous-le-Vent)
  { slug: "leeward", name: "Leeward Islands", archipelago: "society-leeward", aggregate: true, sortOrder: 20,
    aliases: ["îles sous-le-vent", "iles sous le vent", "leeward islands", "raromata'i"] },
  { slug: "bora-bora", name: "Bora Bora", nameTy: "Pora Pora", archipelago: "society-leeward", sortOrder: 21,
    aliases: ["bora bora", "bora-bora", "pora pora", "porapora", "four seasons bora bora", "st regis bora bora", "intercontinental bora bora", "intercontinental le moana", "le bora bora by pearl", "westin bora bora", "intercontinental thalasso"] },
  { slug: "raiatea", name: "Raiatea", nameTy: "Ra'iatea", archipelago: "society-leeward", sortOrder: 22,
    aliases: ["raiatea", "ra'iatea", "uturoa"] },
  { slug: "tahaa", name: "Taha'a", nameTy: "Taha'a", archipelago: "society-leeward", sortOrder: 23,
    aliases: ["tahaa", "taha'a", "tahaʻa", "le taha'a by pearl", "vahine private island", "vahine island"] },
  { slug: "huahine", name: "Huahine", nameTy: "Huahine", archipelago: "society-leeward", sortOrder: 24,
    aliases: ["huahine", "fare"] },
  { slug: "maupiti", name: "Maupiti", nameTy: "Maupiti", archipelago: "society-leeward", sortOrder: 25,
    aliases: ["maupiti"] },

  // Tuamotu
  { slug: "tuamotu", name: "Tuamotu", archipelago: "tuamotu", aggregate: true, sortOrder: 30,
    aliases: ["tuamotu", "tuamotus", "îles tuamotu", "archipel des tuamotu", "paumotu"] },
  { slug: "rangiroa", name: "Rangiroa", archipelago: "tuamotu", sortOrder: 31, aliases: ["rangiroa", "avatoru"] },
  { slug: "fakarava", name: "Fakarava", archipelago: "tuamotu", sortOrder: 32, aliases: ["fakarava"] },
  { slug: "manihi", name: "Manihi", archipelago: "tuamotu", sortOrder: 33, aliases: ["manihi"] },
  { slug: "hao", name: "Hao", archipelago: "tuamotu", sortOrder: 34, aliases: ["hao"] },

  // Marquesas
  { slug: "marquesas", name: "Marquesas", nameTy: "Te Henua ʻEnana", archipelago: "marquesas", aggregate: true, sortOrder: 40,
    aliases: ["marquesas", "marquises", "îles marquises", "iles marquises", "henua enana"] },
  { slug: "nuku-hiva", name: "Nuku Hiva", archipelago: "marquesas", sortOrder: 41, aliases: ["nuku hiva", "nuku-hiva", "taiohae"] },
  { slug: "hiva-oa", name: "Hiva Oa", archipelago: "marquesas", sortOrder: 42, aliases: ["hiva oa", "hiva-oa", "atuona"] },

  // Austral
  { slug: "austral", name: "Austral Islands", archipelago: "austral", aggregate: true, sortOrder: 50,
    aliases: ["austral", "australes", "îles australes", "iles australes", "tuha'a pae"] },
  { slug: "tubuai", name: "Tubuai", archipelago: "austral", sortOrder: 51, aliases: ["tubuai"] },
  { slug: "rurutu", name: "Rurutu", archipelago: "austral", sortOrder: 52, aliases: ["rurutu"] },

  // Gambier
  { slug: "gambier", name: "Gambier", archipelago: "gambier", aggregate: true, sortOrder: 60,
    aliases: ["gambier", "îles gambier", "iles gambier", "mangareva"] },

  // Regional Pacific (context)
  { slug: "regional-pacific", name: "Regional Pacific", archipelago: "regional", aggregate: true, sortOrder: 90,
    aliases: ["pacific", "pacifique", "new caledonia", "nouvelle-calédonie", "fiji", "fidji", "cook islands", "samoa", "tonga", "wallis"] },
];

export const ISLAND_BY_SLUG: Record<string, Island> = Object.fromEntries(
  ISLANDS.map((i) => [i.slug, i])
);

export function getIsland(slug: string): Island | undefined {
  return ISLAND_BY_SLUG[slug];
}

/** Single islands (not rollups), in display order. */
export function singleIslands(): Island[] {
  return ISLANDS.filter((i) => !i.aggregate).sort((a, b) => a.sortOrder - b.sortOrder);
}

/** All slugs, for pipeline tagging vocabulary. */
export function allIslandSlugs(): string[] {
  return ISLANDS.map((i) => i.slug);
}
