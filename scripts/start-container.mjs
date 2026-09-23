import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { dirname, extname, join, basename } from "node:path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

function databasePath(databaseUrl) {
  if (!databaseUrl?.startsWith("file:")) {
    throw new Error("DATABASE_URL must be a SQLite file URL.");
  }

  return decodeURIComponent(databaseUrl.slice("file:".length).split("?")[0]);
}

function validateSecurityConfig() {
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret || authSecret.length < 32) {
    throw new Error("AUTH_SECRET must be configured with at least 32 characters.");
  }

  const adminApiKey = process.env.ADMIN_API_KEY;
  if (adminApiKey && adminApiKey.length < 32) {
    throw new Error("ADMIN_API_KEY must be at least 32 characters when configured.");
  }
}

async function backupDatabaseBeforeMigrations() {
  const sourcePath = databasePath(process.env.DATABASE_URL);
  if (!existsSync(sourcePath)) {
    console.log("No existing database found; skipping pre-migration backup.");
    return;
  }

  const backupDirectory = join(dirname(sourcePath), ".migration-backups");
  mkdirSync(backupDirectory, { recursive: true });

  const sourceName = basename(sourcePath, extname(sourcePath));
  const timestamp = new Date().toISOString().replace(/[.:]/g, "-");
  const backupPath = join(backupDirectory, `${sourceName}-${timestamp}.db`);
  const db = new Database(sourcePath, { readonly: true });

  try {
    await db.backup(backupPath);
    console.log(`Created pre-migration database backup at ${backupPath}.`);
  } finally {
    db.close();
  }

  const backups = readdirSync(backupDirectory)
    .filter((name) => name.startsWith(`${sourceName}-`) && name.endsWith(".db"))
    .sort()
    .reverse();

  for (const oldBackup of backups.slice(5)) {
    unlinkSync(join(backupDirectory, oldBackup));
  }
}

function bootstrapAdmin() {
  const email = process.env.ADMIN_INITIAL_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;

  if (!email && !password) {
    console.log("No initial admin credentials configured; skipping admin bootstrap.");
    return;
  }

  if (!email || !password) {
    throw new Error(
      "Set both ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD, or leave both unset."
    );
  }

  if (password.length < 8) {
    throw new Error("ADMIN_INITIAL_PASSWORD must be at least 8 characters long.");
  }

  const db = new Database(databasePath(process.env.DATABASE_URL));

  try {
    const userCount = db.prepare('SELECT COUNT(*) AS count FROM "User"').get().count;
    if (userCount > 0) {
      console.log("Users already exist; skipping initial admin bootstrap.");
      return;
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    db.prepare(
      'INSERT INTO "User" ("id", "email", "passwordHash", "role", "createdAt") VALUES (?, ?, ?, \'ADMIN\', CURRENT_TIMESTAMP)'
    ).run(randomUUID(), email, passwordHash);

    console.log(`Created initial admin account ${email}.`);
  } finally {
    db.close();
  }
}

console.log("Applying database migrations...");
validateSecurityConfig();
await backupDatabaseBeforeMigrations();
execFileSync("npx", ["--no-install", "prisma", "migrate", "deploy"], {
  stdio: "inherit",
});
bootstrapAdmin();
console.log("Starting Flashcard Decks...");
execFileSync("npm", ["run", "start", "--", "-H", "0.0.0.0", "-p", "3000"], {
  stdio: "inherit",
});
