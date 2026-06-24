# POMR Coach

This application was made by HealCode:We heal patients, with code and love.
Local-first web app for Korean medical clerkship POMR practice.

POMR Coach can be used as an AI-free local note-writing and PDF export tool. AI review is optional and remains framed as educational feedback, not diagnosis or treatment support.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn-style UI primitives
- Prisma 7 + SQLite (local) / Postgres (web) via Prisma driver adapters
- OpenAI-compatible server-side AI review pipeline (disabled by default; see `AI_ENABLED`)
- Print-oriented HTML export (browser print-to-PDF)

## Brand Assets

Place the primary logo at `public/POMR_coach_logo.png`. Keep the file name stable so
the sidebar, case library, and PDF export can use the same full logo asset.

The web app icon/favicon is `public/app-icon.png` (also surfaced via `src/app/icon.png`).
Both are committed assets; update them in place if the brand mark changes.

## Local Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run db:apply
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open [http://127.0.0.1:3000/cases](http://127.0.0.1:3000/cases).

The AI review feature is **disabled by default**. The `/api/ai/review` route returns 503 unless `AI_ENABLED="true"` is set in the server environment; re-enabling still requires PHI/prompt-injection hardening before real use (see `src/ai/flags.ts`). When enabled without `OPENAI_API_KEY`, it returns a deterministic local mock response.

## Web Alpha Deployment

The recommended web alpha stack is now Cloud Run + Supabase Auth + Supabase Postgres.

```bash
npm run db:push:web
npm run build:cloudrun
```

See [docs/CLOUD_RUN_DEPLOYMENT.md](docs/CLOUD_RUN_DEPLOYMENT.md) for Cloud Run settings, environment variables, Supabase setup, and deployment checklist.

The earlier Vercel deployment path remains documented in [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md), but the app origin should be Cloud Run for the current alpha.

## MVP Workflow

1. Case Library
2. Timeline Scratchpad
3. Admission Workspace
4. Pre-test Initial Impression
5. Lab / Image / Procedure Data
6. Post-test Final Impression
7. Problem List Draft
8. Daily Progress Note SOAP
9. Submission PDF Export

The app is educational note-writing practice only. It does not provide diagnostic or treatment decision support, does not integrate with EHR, and does not support AI image interpretation.

## Current Export Features

- Submission-oriented admission, impression, lab/image/procedure, problem list, and progress note export
- Empty fields are skipped in the exported PDF for cleaner submission notes
- De-identified image attachments can be added to diagnostic data and SOAP Objective sections for export
- Lab tables can be edited manually or populated from `.xlsx` files copied/exported from an EHR

Image attachments are stored locally as data URLs in SQLite for MVP simplicity. Keep uploads de-identified, under 5MB per image, and under 10MB per section.

## Useful Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run build:cloudrun
npm run prisma:generate
npm run db:apply
npm run db:push:web
npm run build:web
```

## Privacy Defaults

Use anonymous case labels only. Do not enter patient name, registration number, resident ID, phone number, address, or exact birthdate.
