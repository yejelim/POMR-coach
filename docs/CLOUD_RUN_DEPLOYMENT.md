# Cloud Run Deployment

This guide is the preferred web alpha deployment path for POMR Coach.

Recommended app stack:

```text
Cloud Run + Supabase Auth + Supabase Postgres
```

Use Cloud Run as the app origin. Keep Vercel out of the app request path for now. If a landing page is needed later, host the landing page separately and link to the Cloud Run app domain.

## Why Cloud Run

POMR Coach is a dynamic app with login sessions, account-owned case libraries, server actions, export rendering, and image-heavy note data. Running the Next.js app as one long-lived container is easier to reason about than splitting the same app across Vercel Functions.

Cloud Run also lets us:

- run in Seoul with `asia-northeast3`;
- keep at least one warm instance for better hospital-computer UX;
- use a normal Next.js standalone server;
- expand later to server-side PDF generation or heavier export jobs.

## Files Added For Cloud Run

- `Dockerfile`: builds a production Next.js standalone container.
- `.dockerignore`: keeps local DBs, Electron files, release artifacts, and env files out of the image.
- `src/app/api/health/route.ts`: lightweight health endpoint at `/api/health`.
- `npm run build:cloudrun`: generates the Postgres Prisma client and builds Next.js with a build-only dummy Postgres URL. The real `DATABASE_URL` is still supplied only at Cloud Run runtime.

## Required Cloud Run Settings

Use these as the first alpha settings:

| Setting | Value |
| --- | --- |
| Region | `asia-northeast3` |
| Authentication | Allow unauthenticated invocations |
| CPU | `1` |
| Memory | `1Gi` |
| Minimum instances | `1` |
| Maximum instances | `3` |
| Concurrency | `20` |
| Request timeout | `300s` |
| Container port | `8080` |

The app stores data in Supabase, not in the container filesystem.

## Runtime Environment Variables

Set these in Cloud Run:

```bash
DATABASE_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_PUBLISHABLE_KEY="..."
APP_URL="https://YOUR-CLOUD-RUN-URL-or-custom-domain"
DATABASE_POOL_MAX="5"
AI_MOCK_MODE="true"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"
```

Notes:

- Use the Supabase pooler URL with `sslmode=require`.
- `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are preferred for Cloud Run runtime config. The older `NEXT_PUBLIC_*` names still work as fallback for local/Vercel experiments.
- For Cloud Run, the Supabase Session pooler is a reasonable first choice because the service has warm containers and a small connection pool.
- If you use the Transaction pooler, keep `DATABASE_POOL_MAX` low and watch logs for prepared statement or pooler errors.
- Keep `AI_MOCK_MODE="true"` for the first public alpha unless AI feedback is intentionally being tested.

## Supabase Settings

In the Supabase dashboard:

1. Keep Email/Password sign-in enabled.
2. Keep Anonymous Sign-Ins enabled for guest mode.
3. Add the Cloud Run URL to allowed redirect URLs.
4. After adding a custom domain, add that domain too.
5. Keep the signup consent language in the app; users should not enter patient identifiers.

## First Manual Deploy

From the repository root:

```bash
gcloud run deploy pomr-coach \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 3 \
  --concurrency 20 \
  --timeout 300
```

During setup, add the environment variables above in the Cloud Run console or through `gcloud run services update`.

If using the Cloud Run console with GitHub repository integration:

1. Choose the GitHub repository.
2. Select the branch to deploy.
3. Let Cloud Run use the repository `Dockerfile`.
4. Add runtime environment variables.
5. Deploy to `asia-northeast3`.

## Verification Checklist

After deploy:

1. Open `/api/health` and confirm `{ "ok": true }`.
2. Open `/cases` in a fresh browser session and confirm guest mode works.
3. Create a test case.
4. Save admission, data, impression, problem, and progress pages.
5. Refresh and confirm the data remains.
6. Sign up with a test email and confirm account-owned library behavior.
7. Export using `Print / Save as PDF`.
8. Check Cloud Run logs for Prisma or Supabase errors.

## Custom Domain

Recommended domain shape:

```text
app.your-domain.com -> Cloud Run app
www.your-domain.com -> optional future landing page
```

For the alpha, using the generated Cloud Run URL is acceptable until the app stabilizes.

## Vercel Role

Do not proxy the main app through Vercel for the first Cloud Run alpha. It makes cookies, redirects, and RSC navigation harder to debug.

Later, Vercel can host a marketing/landing page that links to the Cloud Run app.
