# POMR Coach Web Deployment Plan

Last updated: 2026-05-16

## Implementation Status

Started:

- Supabase SSR dependencies added.
- Login/signup/logout pages added.
- Signup consent and optional newsletter opt-in added.
- `User` model and `Case.ownerId` added to Prisma schema.
- Case service layer now supports owner-scoped reads and writes.
- Supabase session refresh proxy added for web auth cookie stability.
- Local fallback mode remains available when Supabase env vars are not configured.

Not done yet:

- Production Postgres schema/provider switch.
- Supabase project env values in deployment secrets.
- Supabase auth settings QA, including email confirmation behavior.
- Cloud Run Docker/deployment pipeline.
- Invite-code or open-signup policy finalization.
- Production auth QA on shared hospital computers.

## Local Supabase Auth Smoke Test

Local development stays in `Local mode` until Supabase environment variables are configured.

To test login/signup locally without touching production database storage, create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
APP_URL="http://localhost:3000"
```

Then restart the dev server. The app will require login, but case data still uses the local SQLite database until the production Postgres provider switch is implemented.

Things the developer/user must do in the Supabase dashboard:

- Decide whether email confirmation is enabled for early alpha signup.
- Add the local app URL to allowed redirect/site URLs if confirmation links or callbacks are used.
- Rotate any password that was shared in chat before using it for deployment secrets.

Things Codex can handle in the repository:

- Auth UI and server actions.
- Session refresh proxy.
- Owner-scoped case service logic.
- Postgres migration/deployment scripts when the web database switch begins.

## Context

POMR Coach started as a local-first desktop-friendly app. The next product need is a web version that students can open on shared hospital computers while reviewing EHR, then continue later from their own device.

Target workflow:

```text
Hospital computer web app
-> paste/type structured POMR material from EHR
-> continue at home on personal device, either web or desktop app
-> export clean POMR note
```

This is closer to a Notion-like product than a purely local utility: the same user should be able to access the same case library from multiple devices.

## Product Direction

Recommended direction:

- Keep the current app workflow.
- Add a cloud-backed web mode with account-based case ownership.
- Keep the desktop app path, but treat sync/login as a later stage.
- Do not split app and web into separate repositories yet.

The immediate goal is not a high-complexity medical platform. The immediate goal is a practical authenticated web workspace for de-identified educational POMR notes.

## Repository Strategy

### Option A: One Repository, Web First

Use the current repository for both web and desktop targets.

Recommended for now.

Pros:

- One source of truth for workflow UI.
- One Prisma schema and migration history.
- Easier to keep export, note editors, tables, and design system consistent.
- Avoids duplicating bug fixes across app/web repositories.
- Faster to ship the first web alpha.

Cons:

- Need clear environment boundaries: local SQLite mode vs cloud Postgres mode.
- Desktop packaging code and web deployment code live together.
- Requires discipline in docs and scripts.

Best near-term shape:

```text
POMR-coach/
  src/
  prisma/
  electron/
  docs/
  scripts/
```

Later, if the project grows:

```text
POMR-coach/
  apps/web/
  apps/desktop/
  packages/ui/
  packages/domain/
  packages/export/
```

Do not move to this monorepo layout until there is real duplication pressure.

### Option B: Separate Web and Desktop Repositories

Create one repo for web and one repo for desktop.

Not recommended yet.

Pros:

- Cleaner deployment separation.
- Desktop can stay local-first without cloud concerns.
- Web can move faster on auth/cloud features.

Cons:

- Duplicates core workflow UI or forces package publishing.
- Harder to keep PDF export, table editors, SOAP forms, and case schema aligned.
- More maintenance burden for a solo/junior developer workflow.
- Higher chance of feature drift.

Only consider this if desktop and web become genuinely different products.

### Option C: Keep Desktop Local-Only, Build Separate Web Product

Not recommended for the current product vision.

This would make web and desktop behave unlike Notion. Users would not have a shared case library unless export/import or sync is built separately.

## Deployment Options

### Option 1: Cloud Run + Cloud SQL PostgreSQL

Recommended if we want control and predictable PDF generation.

Use:

- Cloud Run for the Next.js container.
- Cloud SQL PostgreSQL for persistent data.
- Secret Manager or Cloud Run secrets for `DATABASE_URL` and auth secrets.
- Artifact Registry for built images.

Pros:

- Good fit for the current Playwright-based PDF export because we control the container.
- Works well with Next.js standalone Docker output.
- Scales down/up as needed.
- Fits the user's current Cloud Run access.

Cons:

- More setup than Vercel.
- Requires Docker/deployment config.
- Requires production database migration flow.

Notes:

- Cloud Run services are stateless HTTP containers, so SQLite inside the container should not be used as production storage.
- Use Postgres in production.
- Use `prisma migrate deploy` for production migrations.

References:

- Cloud Run runs stateless containers: https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run
- Cloud Run + Cloud SQL PostgreSQL connection: https://cloud.google.com/sql/docs/postgres/connect-run
- Next.js standalone output: https://en.nextjs.im/docs/pages/api-reference/config/next-config-js/output
- Prisma production migrations: https://www.prisma.io/docs/cli/migrate/deploy

### Option 2: Vercel + Supabase

Recommended if we prioritize the fastest public web launch and can simplify PDF generation if needed.

Use:

- Vercel for Next.js hosting.
- Supabase Postgres for database.
- Supabase Auth for email/password accounts.

Pros:

- Very fast Next.js deployment.
- Preview deployments from GitHub are convenient.
- Supabase Auth handles email/password signup, login, reset flows, password hashing, and user identity.
- Less custom auth code.

Cons:

- Playwright PDF generation may be less predictable in serverless environments than Cloud Run.
- Need to adapt Prisma/Supabase integration carefully.
- More external platform coupling.

Good fit if:

- Browser print fallback is acceptable for early alpha.
- We want account creation quickly.
- We prefer managed auth over building sessions/password hashing ourselves.

References:

- Supabase Auth supports email/password auth: https://supabase.com/docs/guides/auth/passwords
- Supabase password security uses bcrypt and configurable password policies: https://supabase.com/docs/guides/auth/password-security

### Option 3: Cloud Run + Supabase

Strong practical compromise.

Use:

- Cloud Run for app hosting.
- Supabase for Postgres and Auth.

Pros:

- Keeps Cloud Run container control for PDF export.
- Uses managed Supabase Auth instead of custom password/session implementation.
- Avoids managing Cloud SQL initially.

Cons:

- Two cloud providers.
- Need clean environment variable and auth callback setup.

This may be the best balance for an early alpha if account auth needs to be simple and reliable.

### Option 4: Render / Railway / Fly.io

Acceptable alternatives, but not preferred if Cloud Run is already available.

Pros:

- Often simpler than raw GCP setup.
- Can host persistent services and Postgres.

Cons:

- Another platform to learn.
- Less aligned with current Cloud Run availability.
- Long-term cost/reliability tradeoffs need review.

## Recommended Platform Choice

Near-term recommendation:

```text
Cloud Run app + Supabase Auth + Supabase Postgres
```

Reason:

- Cloud Run lets us keep container control for Next.js and Playwright PDF export.
- Supabase Auth reduces custom login/password risk.
- Supabase Postgres is simpler to start than Cloud SQL while still being a real production database.
- Later, if desired, Supabase Postgres can be replaced with Cloud SQL PostgreSQL.

Conservative alternative:

```text
Cloud Run app + Cloud SQL PostgreSQL + custom Auth.js/email-password auth
```

This keeps everything closer to GCP but requires more auth/session implementation.

Fastest web launch alternative:

```text
Vercel + Supabase
```

This is fastest for pure web, but PDF export needs special testing.

## Authentication Scope

MVP account system:

- Email as login ID.
- Password login.
- Logout.
- Session cookie.
- User-owned case library.
- Optional password reset if Supabase Auth is used.
- No multi-factor auth for MVP.
- No organization/team features.
- No roles/admin panel for MVP unless invite approval is needed.

Signup fields:

- Email
- Password
- Confirm password
- Required checkbox:
  - `환자 식별정보를 입력하지 않으며, POMR Coach를 학습용으로만 사용하는 것에 동의합니다.`
- Optional checkbox:
  - `POMR Coach 업데이트 및 안내 메일 수신에 동의합니다.`

Keep marketing/newsletter consent separate from the required educational/privacy agreement. This is cleaner for user trust and future email handling.

Password policy:

- Keep it simple.
- Minimum 8 characters is enough for MVP.
- If using Supabase Auth, rely on its password storage and baseline security.

Session behavior for shared hospital computers:

- Show a visible logout button.
- Consider session duration shorter than a personal app.
- Add a small reminder near logout:
  - `공용 컴퓨터에서는 사용 후 로그아웃하세요.`

## Data Ownership Model

Add user ownership at the case level.

Recommended model changes:

```text
User
  id
  email
  createdAt
  updatedAt
  marketingEmailOptIn
  privacyEducationConsentAt

Case
  ownerId
  title
  department
  status
  summary
  ...
```

Do not add `userId` to every child table at first. Instead:

- `Case.ownerId` determines ownership.
- Timeline, admission, diagnostics, impressions, problems, progress notes remain linked to `caseId`.
- Every service function that reads/writes a case must check `case.ownerId === currentUser.id`.

This keeps the schema simpler and avoids repetitive ownership columns.

## Local App vs Web App

### Web Alpha

The web version should become the first shared multi-device product.

Requirements:

- Cloud database.
- Auth.
- Account-owned Library.
- Same workflow pages.
- Same PDF export behavior.

### Desktop App

Short-term:

- Keep desktop app as local-first.
- Do not force login in desktop yet.

Medium-term options:

1. Desktop remains local-only.
2. Desktop becomes a wrapper around the web app.
3. Desktop supports optional cloud sync/login.

For Notion-like behavior, option 2 or 3 is eventually better. For now, web deployment is the urgent path.

## Privacy and Safety Posture

Keep security practical but not overbuilt.

Required:

- HTTPS only in production.
- Email/password login.
- Logout visible.
- Case ownership enforced server-side.
- Avoid PHI fields in UI.
- Signup agreement not to enter patient identifiers.
- Do not upload raw EHR exports containing identifiers.
- Do not enable AI by default in the first web deployment.

Not required for MVP:

- MFA.
- Hospital SSO.
- Audit log.
- Admin review workflow.
- Complex password rules beyond a sensible minimum.
- Enterprise compliance program.

Important product language:

POMR Coach is an educational writing workspace, not a medical record system and not medical decision support.

## Implementation Milestones

### Phase 0: Document and Decide

- Add this deployment plan.
- Decide initial platform:
  - recommended: Cloud Run + Supabase Auth + Supabase Postgres.
- Decide whether web alpha is invite-only or open signup.

### Phase 1: Prepare Database for Web

- Add production Postgres configuration.
- Update Prisma datasource strategy if needed.
- Add `User` / `ownerId` data model.
- Add migrations.
- Add development seed/migration notes.

### Phase 2: Add Auth

- Add login/signup/logout pages.
- Add session handling.
- Add signup consent checkboxes.
- Add newsletter opt-in field.
- Add route protection.

### Phase 3: Enforce Ownership

- Update case service functions to scope by `userId`.
- Protect all case routes.
- Ensure `/cases` lists only the current user's cases.
- Ensure direct case URL access fails for non-owners.

### Phase 4: Cloud Deployment

- Add Dockerfile for Next.js standalone app.
- Add Cloud Run deployment docs/scripts.
- Add environment variable docs.
- Add production migration command.
- Add health check route if needed.

### Phase 5: Alpha QA

- Test signup/login/logout.
- Test shared hospital computer workflow.
- Test copy/paste from EHR-like sources.
- Test PDF export.
- Test image upload size behavior.
- Test account data separation.

### Phase 6: Release

- Deploy private alpha URL.
- Use a small group first.
- Collect friction points before broader sharing.

## Open Decisions

- Supabase Auth vs custom Auth.js.
- Supabase Postgres vs Cloud SQL PostgreSQL.
- Open signup vs invite-code signup.
- Whether desktop app remains local-only after web launch.
- Whether PDF export in web alpha must use server PDF generation or browser print fallback is acceptable.

## Current Recommendation

Do this next:

1. Keep one repository.
2. Build web alpha in the current app.
3. Use account ownership at the `Case` level.
4. Use email/password signup with a required educational/privacy agreement and optional newsletter opt-in.
5. Prefer Cloud Run + Supabase Auth/Postgres for the first serious web alpha.
6. Keep desktop local-first until web account workflow is stable.
