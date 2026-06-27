# TahitiTelegraph — Theme

A restrained, modern "black-pearl / deep-ocean" editorial look. Polynesian motifs
are used sparingly as accents, never decoration over substance. Hazard UI stays
sober and high-contrast.

## Tokens (`src/app/globals.css`, Tailwind 4 `@theme`)

| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#06232f` | deep ocean background |
| `--color-surface` / `-2` | `#0c2f3d` / `#103a4a` | panels / cards |
| `--color-border` | `#1d4f5f` | lagoon hairline |
| `--color-fg` | `#f4eede` | shell-white text |
| `--color-muted` / `--color-faint` | `#aec6cf` / `#7194a1` | secondary text |
| `--color-primary` | `#2bb6c4` | lagoon turquoise — links, active state |
| `--color-coral` | `#e8552b` | hibiscus accent (tiare mark, "why it matters") |
| `--color-sand` | `#f2e2c4` | warm sand accent |
| signal `strong/moderate/thin` | `#34d399 / #f4b740 / #94a3b8` | confidence |
| vigilance `green/yellow/orange/red` | `#34d399 / #f4d03f / #f08c2e / #e5484d` | safety ladder |

Domain colours live in `src/lib/taxonomy.ts` (each of the 8 domains has its own
hex), used for the left accent stripe and chips on pulse cards.

## Motifs (`src/components/Motifs.tsx`)
- **TiareMark** — five-petal tiare (Tahitian gardenia). Kicker / "why it matters" mark. Use small (≤20px), coral.
- **NihoMano** — shark-teeth band. Section/footer divider only. Keep low-opacity.

Fonts: Newsreader (serif, headlines) + Geist (sans, body), via `next/font`.

## Rules
- Bilingual labels are French + English (accurate); reo Tahiti island names where confident (`name_ty`).
- Never style cyclone/tsunami/vigilance content decoratively — the `HazardRibbon` is intentionally plain and links to the official source.
- Facts and interpretation are always visually separated on a card.
