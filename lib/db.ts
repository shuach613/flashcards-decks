import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// The "vercel-build" script (package.json) swaps in schema.postgres.prisma
// before `prisma generate`, so the generated client here is Postgres-flavored
// on Vercel and SQLite-flavored locally — pick the matching adapter to match.
async function createPrismaClient(): Promise<PrismaClient> {
  const url = process.env.DATABASE_URL!;
  if (process.env.VERCEL) {
    const { PrismaPg } = await import("@prisma/adapter-pg");
    return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  }
  const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}

export const prisma = globalForPrisma.prisma ?? (await createPrismaClient());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
