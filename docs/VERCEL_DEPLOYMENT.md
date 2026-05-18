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

- Local schema setup: use Supabase Session pooler if Direct connection fails with `P1001`.
- Vercel runtime: use Supabase Transaction pooler for serverless traffic.

Supabase Direct connection can require IPv6. If local `npm run db:push:web` cannot reach `db.[project-ref].supabase.co:5432`, use the Session pooler string from Supabase Dashboard → Connect → Session pooler.

Supabase recommends transaction mode for serverless or short-lived function traffic. Use the connection string from Supabase Dashboard → Connect → Transaction pooler for Vercel. If Prisma reports prepared statement errors with a transaction pooler, append `pgbouncer=true` to the connection string.

All Supabase Postgres URLs used by this project should include `sslmode=require`. If the pooler host and port are reachable but Prisma still reports `P1001`, check for a missing `sslmode=require` first.

## First Database Setup

Before the first Vercel deployment, create `.env.web.local` locally with a Supabase Postgres connection string:

```bash
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"
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

For Vercel, set `DATABASE_URL` separately in the Vercel dashboard using the Transaction pooler string, commonly port `6543`:

```bash
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?sslmode=require"
```

## Supabase Auth Settings

In the Supabase dashboard:

- Enable Email/Password sign-in.
- Enable Anonymous Sign-Ins for guest mode.
- Add the Vercel domain to Site URL / allowed redirect URLs after Vercel creates the first deployment URL.
- Keep the signup consent language in the app; users should not enter patient identifiers.

## Export Note

The Vercel web alpha returns a clean print-oriented HTML export instead of generating PDFs on the server.

For Vercel alpha:

- Treat browser print / HTML fallback as acceptable.
- Keep image uploads small. Vercel Functions have request/response payload limits, so large image-heavy cases may fail until image storage is moved to Supabase Storage.
- Use the browser's Print / Save as PDF flow for submission files.
- If one-click PDF generation becomes important later, move PDF rendering to Cloud Run or a separate worker.

## Deployment Checklist

1. Rotate any database password that was shared outside a secret manager.
2. Create `.env.web.local` locally and run `npm run db:push:web`.
3. Import the GitHub repository into Vercel.
4. Add Vercel environment variables.
5. Deploy a Preview build.
6. Open `/cases` in a fresh browser session and confirm `Guest mode`.
7. Create a case, save it, refresh, and confirm it remains.
8. Sign up with an email account and confirm account-owned library behavior.
9. Try export and verify the HTML print view opens and can be saved as PDF from the browser.
10. After the first Vercel URL exists, update Supabase auth redirect/site URL settings.
