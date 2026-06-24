# Launch Safety Checklist

Use this before promoting POMR Coach to a wider group of clerkship users.

The current preferred production path is:

```text
Firebase Hosting -> Cloud Run -> Supabase Auth/Postgres
```

Keep Vercel out of the main app request path for the first public alpha. Vercel can host a landing page later, but the app itself should stay on Cloud Run until auth, cookies, and export behavior are stable.

## What Is Already Reasonable For Alpha

- User data is stored in Supabase Postgres, not in the Cloud Run container filesystem.
- Case reads and writes are scoped by `ownerId` in server-side service functions.
- Firebase Hosting rewrites all app traffic to the Cloud Run service.
- Supabase auth uses the `__session` cookie name so Firebase Hosting can forward auth state reliably.
- The app has health endpoints:
  - `/api/health`
  - `/api/health/db`
  - `/api/health/auth`
- Detailed health diagnostics are hidden by default unless `HEALTH_DEBUG=true`.
- Image upload has client-side size limits:
  - 5 MB per image
  - 10 MB per section
- PDF/export is currently print-oriented HTML, avoiding heavy server-side browser PDF generation.

## Highest-Risk Areas

### 1. Cost Spikes

Set Cloud Run scaling limits before inviting a larger audience.

Recommended first alpha limits:

```bash
gcloud run services update pomr-coach \
  --region asia-northeast3 \
  --min-instances 1 \
  --max-instances 3 \
  --concurrency 20 \
  --cpu 1 \
  --memory 1Gi
```

Keep `DATABASE_POOL_MAX=5` unless logs show database saturation. With max instances 3, this keeps the app-side Postgres pool around 15 possible connections.

Also set a Google Cloud budget alert in Billing. Suggested first alerts:

- 50%
- 80%
- 100%

Do not run public load tests against production until budget alerts are enabled.

### 2. Database Connection Pressure

The app uses a persistent Cloud Run container plus Prisma/Postgres pooling. This is a better fit than serverless functions, but connection count still scales with Cloud Run instances.

Watch for these errors in Cloud Run logs:

- `too many connections`
- `pool timeout`
- `PrismaClientKnownRequestError`
- Supabase pooler / prepared statement errors

If they appear:

1. Lower Cloud Run `--max-instances`.
2. Lower `DATABASE_POOL_MAX`.
3. Confirm the Supabase pooler URL is being used.
4. Consider a Supabase compute upgrade only if real usage justifies it.

### 3. Data Loss Expectations

The app has explicit save buttons. It does not yet have true autosave or conflict resolution.

Current behavior:

- Saved data persists in Supabase.
- Guest mode depends on the browser/session cookie and should be treated as temporary.
- If the same account opens the same case section in two tabs, the last save wins.

User-facing recommendation:

- Encourage account signup for real use.
- Ask users not to edit the same case in multiple tabs.
- Remind users to check the save state before leaving a page.

Future improvement:

- Add `updatedAt` conflict checks for section saves.
- Add section-level draft autosave.

### 4. Image Storage Growth

Current image attachments are stored as data URLs in database text fields. This is simple and works for alpha, but it can grow the database quickly because base64 encoding increases size.

For the first alpha:

- Keep the 5 MB per image and 10 MB per section limits.
- Encourage only key de-identified screenshots.
- Monitor Supabase database size.

Before a larger launch:

- Move images to Supabase Storage.
- Keep only image metadata and storage paths in Postgres.
- Remember that database backups do not restore deleted Storage objects unless Storage backups are handled separately.

### 5. Backups

Before inviting users whose notes matter:

- If using Supabase Free tier, manually export database dumps on a schedule.
- If using Supabase Pro or higher, confirm daily backups are visible in Dashboard -> Database -> Backups.
- For serious usage, consider Point-in-Time Recovery.

Suggested manual check:

```bash
supabase db dump --db-url "$DATABASE_URL" > pomr-coach-backup.sql
```

Store backups somewhere private and outside the public GitHub repository.

## Pre-Launch Verification

Run locally:

```bash
npm run lint
npm run test
npm run build:cloudrun
npm run prisma:generate:local
```

Check production health:

```bash
curl -sS https://pomr-coach.web.app/api/health
curl -sS https://pomr-coach.web.app/api/health/db
```

Check guest auth flow:

```bash
tmp_cookie=$(mktemp)
curl -sS -L -c "$tmp_cookie" -b "$tmp_cookie" https://pomr-coach.web.app/auth/guest -o /dev/null -w '%{http_code} %{url_effective}\n'
curl -sS -b "$tmp_cookie" https://pomr-coach.web.app/api/health/auth
rm -f "$tmp_cookie"
```

Expected auth result:

- final URL ends with `/cases`
- `sessionCookiePresent` is `true`
- `userPresent` is `true`
- `isAnonymous` is `true`

Only set `HEALTH_DEBUG=true` temporarily when debugging production. Turn it back off before public sharing.

## Manual Multi-User Smoke Test

Before public sharing, test with at least two separate browser profiles or devices.

1. User A signs up and creates a case.
2. User B signs up and creates a different case.
3. Confirm User A cannot see User B's case in the library.
4. User A saves admission, lab/image data, problems, and progress note.
5. User A refreshes each page and confirms data persists.
6. User B repeats the same flow.
7. Both users export at the same time.
8. Check Cloud Run logs for errors.

## Do Not Do Yet

- Do not reintroduce Vercel as a proxy for the main app until Cloud Run is stable.
- Do not raise Cloud Run max instances without checking Supabase connection limits.
- Do not remove guest-mode warnings.
- Do not promise autosave until it exists.
- Do not encourage uploading patient identifiers.
- Do not run high-volume load tests against production without a budget alert and a test window.
