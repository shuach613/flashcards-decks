import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

function databasePath(databaseUrl) {
  if (!databaseUrl?.startsWith("file:")) {
    throw new Error("DATABASE_URL must be a SQLite file URL.");
  }

  return decodeURIComponent(databaseUrl.slice("file:".length).split("?")[0]);
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
execFileSync("npx", ["prisma", "migrate", "deploy"], { stdio: "inherit" });
bootstrapAdmin();
console.log("Starting Flashcard Decks...");
execFileSync("npm", ["run", "start", "--", "-H", "0.0.0.0", "-p", "3000"], {
  stdio: "inherit",
});
