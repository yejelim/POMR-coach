# POMR Coach

This application was made by HealCode:We heal patients, with code and love.
Local-first web app for Korean medical clerkship POMR practice.

POMR Coach can be used as an AI-free local note-writing and PDF export tool. AI review is optional and remains framed as educational feedback, not diagnosis or treatment support.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn-style UI primitives
- Prisma 7 + SQLite + `@prisma/adapter-better-sqlite3`
- Optional OpenAI-compatible server-side AI review route
- Playwright HTML-to-PDF export

## Brand Assets

Place the primary logo at `public/POMR_coach_logo.png`. Keep the file name stable so
the sidebar, case library, and PDF export can use the same full logo asset.

Desktop/app icons are generated from the large P symbol in the primary logo:

```bash
npm run icons:generate
```

This creates `public/app-icon.png`, `src/app/icon.png`, and Electron packaging icons under `build/`.

## Local Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run db:apply
npx playwright install chromium
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open [http://127.0.0.1:3000/cases](http://127.0.0.1:3000/cases).

`OPENAI_API_KEY` is optional for local development. Without it, AI review returns a deterministic local mock response so the write-first feedback workflow can still be tested.

## Web Alpha Deployment

The recommended web alpha stack is Vercel + Supabase Auth + Supabase Postgres.

```bash
npm run db:push:web
npm run build:web
```

See [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) for Vercel environment variables, Supabase setup, and deployment checklist.

## Desktop App Builds

For non-developer users, POMR Coach can be distributed as an Electron desktop app. The desktop app opens its own local window and stores data in the user's local app data folder.

### Download

Desktop installers are intended to be attached to GitHub Releases.

| Platform | File |
| --- | --- |
| macOS Apple Silicon | `POMR Coach-0.1.0-arm64.dmg` |
| Windows | `.exe` installer from the Windows release build |
| Linux | `.AppImage` or `.deb` from the Linux release build |

The current macOS build is unsigned, so macOS may show a security warning on first launch.

```bash
npm run desktop:pack
```

Installer builds can be created with:

```bash
npm run desktop:dist
```

See [docs/DESKTOP_RELEASE.md](docs/DESKTOP_RELEASE.md) for GitHub Release packaging notes, unsigned build limitations, and future signing requirements.

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
npm test
npm run build
npm run icons:generate
npm run desktop:pack
npm run desktop:dist
npm run prisma:generate
npm run db:apply
npm run db:push:web
npm run build:web
```

## Privacy Defaults

Use anonymous case labels only. Do not enter patient name, registration number, resident ID, phone number, address, or exact birthdate.
