// Point every test worker at the isolated test database provisioned by
// vitest.global-setup.ts. Set before any module (e.g. @/server/db) is imported.
process.env.DATABASE_URL = "file:./prisma/test.db";
