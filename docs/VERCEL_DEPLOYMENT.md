# Vercel Deployment

This guide prepares the web alpha deployment path for POMR Coach.

Recommended first public alpha:

```text
Vercel + Supabase Auth + Supabase Postgres
```

The desktop/local SQLite path remains separate.

## Repository Settings

Import the GitHub repository into Vercel with:

- Framework Preset: `Next.js`
- Root Directory: repository root
- Build Command: `npm run build:web`
- Install Command: Vercel default
- Output Directory: Vercel default

`vercel.json` already sets the build command to `npm run build:web`.

## Environment Variables

Add these Vercel environment variables for both Preview and Production:

```bash
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="..."
APP_URL="https://your-vercel-domain.vercel.app"
AI_MOCK_MODE="true"
```

Optional later:

```bash
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"
```

For the first web alpha, keep `AI_MOCK_MODE="true"` unless AI feedback is intentionally being tested.

## Database Connection Choice

Use different database connection strings for different jobs:

- Local schema setup: Supabase Direct connection is acceptable for `npm run db:push:web`.
- Vercel runtime: prefer Supabase Transaction Pooler connection for serverless traffic.

Supabase recommends transaction mode for serverless or short-lived function traffic. If using transaction pooling, use the connection string from Supabase Dashboard → Connect → Transaction pooler.

## First Database Setup

Before the first Vercel deployment, create `.env.web.local` locally with a Supabase Postgres connection string:

```bash
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="..."
APP_URL="http://localhost:3000"
AI_MOCK_MODE="true"
```

Then run:

```bash
npm run db:push:web
```

This creates the web tables in Supabase Postgres using `prisma/schema.postgres.prisma`.

Do not commit `.env.web.local`.

## Supabase Auth Settings

In the Supabase dashboard:

- Enable Email/Password sign-in.
- Enable Anonymous Sign-Ins for guest mode.
- Add the Vercel domain to Site URL / allowed redirect URLs after Vercel creates the first deployment URL.
- Keep the signup consent language in the app; users should not enter patient identifiers.

## PDF Export Note

The current PDF route tries Playwright HTML-to-PDF first and falls back to an HTML document if browser PDF generation is unavailable.

For Vercel alpha:

- Treat browser print / HTML fallback as acceptable.
- Keep image uploads small. Vercel Functions have request/response payload limits, so large image-heavy cases may fail until image storage is moved to Supabase Storage.
- If PDF generation becomes unreliable or too heavy, move PDF rendering to Cloud Run later.

## Deployment Checklist

1. Rotate any database password that was shared outside a secret manager.
2. Create `.env.web.local` locally and run `npm run db:push:web`.
3. Import the GitHub repository into Vercel.
4. Add Vercel environment variables.
5. Deploy a Preview build.
6. Open `/cases` in a fresh browser session and confirm `Guest mode`.
7. Create a case, save it, refresh, and confirm it remains.
8. Sign up with an email account and confirm account-owned library behavior.
9. Try export. If PDF download fails, verify HTML fallback opens and can be printed.
10. After the first Vercel URL exists, update Supabase auth redirect/site URL settings.
