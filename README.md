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

Place the primary logo at `public/POMR_coach_logo.png`. The app also mirrors it to
`src/app/icon.png` for the Next.js app icon. Keep the file name stable so the sidebar,
case library, metadata icon, and PDF export can use the same asset.

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
npm run prisma:generate
npm run db:apply
```

## Privacy Defaults

Use anonymous case labels only. Do not enter patient name, registration number, resident ID, phone number, address, or exact birthdate.
