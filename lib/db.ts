import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Local dev uses SQLite via this driver adapter. Swap for @prisma/adapter-pg
// (and provider = "postgresql" in schema.prisma) when deploying to Vercel Postgres.
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
