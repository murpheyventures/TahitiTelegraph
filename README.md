# TahitiTelegraph

A **personal, non-commercial** French Polynesia / Pacific intelligence brief.
It ingests official and public sources plus local news, and an analysis layer
(Claude) synthesizes **what materially happened and why it matters — island by
island**. Not a news mirror; every claim links back to its source.

> Personal use only. Keep it behind a password and don't publish/share it — the
> copyright posture changes the moment it becomes public. See
> `tahiti_french_polynesia_feasibility_audit.md`.

## Stack
- **Next.js 16 / React 19 / Tailwind 4** (App Router, TS) — the site (`src/`).
- **Neon Postgres + Drizzle** (`db/`) — shared by app and pipeline.
- **Pipeline** (`pipeline/`) — collectors + Claude analysis, run in **GitHub Actions** (`.github/workflows/ingest.yml`).

## Setup
1. `npm install`
2. Copy `.env.example` → `.env`; set `DATABASE_URL` (Neon). Add `ANTHROPIC_API_KEY` for analysis.
3. `npm run db:migrate && npm run db:seed`
4. `npm run dev` → http://localhost:3000

## Pipeline
- `npm run ingest -- --dry-run` — fetch + parse feeds, no writes.
- `npm run ingest` — collect into Neon.
- `npm run analyze` — tag new items + synthesize island pulses (needs Anthropic key).

## Secrets
- Local: `.env` (gitignored).
- GitHub Actions: repo Settings → Secrets → `DATABASE_URL`, `ANTHROPIC_API_KEY`.
- Vercel: env `DATABASE_URL` (app never calls Claude). Enable auth later with `AUTH_ENABLED=true` + `SITE_PASSWORD`.

## Routes
`/` overview · `/island/[slug]` island pulse · `/domain/[slug]` topic view · `/sources` source health.
