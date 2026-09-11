# TahitiTelegraph

A **personal, non-commercial** French Polynesia / Pacific intelligence brief.
It ingests official and public sources plus local news, and an analysis layer
(DeepSeek) synthesizes **what materially happened and why it matters — island by
island**. Not a news mirror; every claim links back to its source.

> Personal use only. Keep it behind a password and don't publish/share it — the
> copyright posture changes the moment it becomes public. See
> `tahiti_french_polynesia_feasibility_audit.md`.

## Access policy (personal-use)

Because this is a private, non-commercial tool, collectors **may use a headless
browser** to render JavaScript pages and to read public pages that block a plain
HTTP fetch (e.g. TravelPulse, Air Tahiti, Radio 1, Paul Gauguin's press list,
the live Météo-France vigilance level). Guardrails that still apply:

- **Respect `robots.txt` Disallow** rules.
- **Never bypass paywalls or login walls.**
- Polite rate limits, a descriptive User-Agent, caching, and back-off on errors.
- This relaxation is tied to **personal use**. If the project is ever published,
  shared, or monetized, revert to the stricter posture (copyrighted news =
  metadata + link only; no bot-gated scraping) and re-run the commercial review
  in the audit files.

## Stack
- **Next.js 16 / React 19 / Tailwind 4** (App Router, TS) — the site (`src/`).
- **Neon Postgres + Drizzle** (`db/`) — shared by app and pipeline.
- **Pipeline** (`pipeline/`) — collectors + DeepSeek analysis, run in **GitHub Actions** (`.github/workflows/ingest.yml`).

## Setup
1. `npm install`
2. Copy `.env.example` → `.env`; set `DATABASE_URL` (Neon). Add `DEEPSEEK_API_KEY` for analysis.
3. `npm run db:migrate && npm run db:seed`
4. `npm run dev` → http://localhost:3000

## Pipeline
- `npm run ingest -- --dry-run` — fetch + parse feeds, no writes.
- `npm run ingest` — collect into Neon.
- `npm run analyze` — tag new items + synthesize island pulses (needs DeepSeek key).

## Secrets
- Local: `.env` (gitignored).
- GitHub Actions: repo Settings → Secrets → `DATABASE_URL`, `DEEPSEEK_API_KEY`.
- Vercel: env `DATABASE_URL` (app never calls an LLM). Enable auth later with `AUTH_ENABLED=true` + `SITE_PASSWORD`.

## Routes
`/` overview · `/island/[slug]` island pulse · `/domain/[slug]` topic view · `/sources` source health.
