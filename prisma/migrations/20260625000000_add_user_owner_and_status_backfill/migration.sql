-- Corrective migration: earlier migrations never created the User table or
-- Case.ownerId, even though the schema (and generated client) require them.
-- Dev/web hide this because they provision the schema with `prisma db push`,
-- which bypasses these files. This migration realigns the migration history with
-- the schema so a from-scratch `prisma migrate deploy` produces the right shape.

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "marketingEmailOptIn" BOOLEAN NOT NULL DEFAULT false,
    "privacyEducationConsentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AlterTable: SQLite cannot add a foreign key via ALTER TABLE, so the Case ->
-- User relation is enforced at the Prisma layer (onDelete: SetNull). Postgres
-- provisions the real FK via `prisma db push`.
ALTER TABLE "Case" ADD COLUMN "ownerId" TEXT;

-- CreateIndex
CREATE INDEX "Case_ownerId_updatedAt_idx" ON "Case"("ownerId", "updatedAt");

-- Backfill: keep historical progress-note status context by copying each linked
-- problem's status into the (previously default-'active') progressStatus column.
UPDATE "ProgressNoteProblem"
SET "progressStatus" = (
    SELECT "Problem"."status"
    FROM "Problem"
    WHERE "Problem"."id" = "ProgressNoteProblem"."problemId"
)
WHERE "problemId" IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM "Problem" WHERE "Problem"."id" = "ProgressNoteProblem"."problemId"
  );
