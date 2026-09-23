import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync, readdirSync, rmSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

type SqliteDatabase = {
  exec(sql: string): void;
  prepare<T = unknown>(sql: string): { get(): T; all(): T[] };
  close(): void;
};

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3") as new (path: string) => SqliteDatabase;
const migrationsDirectory = join(process.cwd(), "prisma", "migrations");
const categoryRenameMigration = "20260923110000_rename_certificates_to_categories";

function migrationNames() {
  return readdirSync(migrationsDirectory)
    .filter((name) => name !== "migration_lock.toml")
    .sort();
}

function applyMigrations(
  db: SqliteDatabase,
  options: { before?: string; through?: string } = {}
) {
  for (const migration of migrationNames()) {
    if (options.before && migration >= options.before) break;
    if (options.through && migration > options.through) break;
    db.exec(readFileSync(join(migrationsDirectory, migration, "migration.sql"), "utf8"));
  }
}

function createDatabase() {
  const databasePath = join(tmpdir(), `flashcards-lifecycle-${Date.now()}-${Math.random()}.db`);
  return { databasePath, db: new Database(databasePath) };
}

function tableNames(db: SqliteDatabase) {
  return db
    .prepare<{ name: string }>("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    .all()
    .map((table) => table.name);
}

function cleanup(databasePath: string) {
  rmSync(databasePath, { force: true });
}

test("fresh installation creates the current schema", () => {
  const { databasePath, db } = createDatabase();

  try {
    applyMigrations(db);
    const tables = tableNames(db);
    const deckColumns = db.prepare<{ name: string }>("PRAGMA table_info(Deck)").all();

    assert.ok(tables.includes("Category"));
    assert.ok(tables.includes("TrackCategory"));
    assert.ok(!tables.includes("Certificate"));
    assert.ok(deckColumns.some((column) => column.name === "categoryId"));
  } finally {
    db.close();
    cleanup(databasePath);
  }
});

test("restart preserves the persistent database", () => {
  const { databasePath, db } = createDatabase();

  try {
    applyMigrations(db);
    db.exec(
      'INSERT INTO "User" ("id", "email", "passwordHash", "role") VALUES (\'user-1\', \'restart@example.com\', \'hash\', \'ADMIN\')'
    );
    db.close();

    const restartedDb = new Database(databasePath);
    assert.deepEqual(
      restartedDb.prepare<{ email: string }>('SELECT "email" FROM "User"').get(),
      { email: "restart@example.com" }
    );
    restartedDb.close();
  } finally {
    cleanup(databasePath);
  }
});

test("upgrade applies the category migration to an existing schema", () => {
  const { databasePath, db } = createDatabase();

  try {
    applyMigrations(db, { before: categoryRenameMigration });
    db.exec(
      'INSERT INTO "Certificate" ("id", "name") VALUES (\'category-1\', \'General Basics 1\')'
    );
    db.close();

    const upgradedDb = new Database(databasePath);
    upgradedDb.exec(
      readFileSync(
        join(migrationsDirectory, categoryRenameMigration, "migration.sql"),
        "utf8"
      )
    );
    assert.deepEqual(
      upgradedDb.prepare<{ name: string }>('SELECT "name" FROM "Category"').get(),
      { name: "General Basics 1" }
    );
    upgradedDb.close();
  } finally {
    cleanup(databasePath);
  }
});

test("rollback restores the pre-upgrade database snapshot", () => {
  const { databasePath, db } = createDatabase();
  const snapshotPath = `${databasePath}.snapshot`;

  try {
    applyMigrations(db, { before: categoryRenameMigration });
    db.exec(
      'INSERT INTO "Certificate" ("id", "name") VALUES (\'category-1\', \'General Basics 1\')'
    );
    db.close();
    copyFileSync(databasePath, snapshotPath);

    const upgradedDb = new Database(databasePath);
    upgradedDb.exec(
      readFileSync(
        join(migrationsDirectory, categoryRenameMigration, "migration.sql"),
        "utf8"
      )
    );
    upgradedDb.close();

    copyFileSync(snapshotPath, databasePath);
    const rolledBackDb = new Database(databasePath);
    assert.equal(
      rolledBackDb.prepare<{ count: number }>(
        'SELECT COUNT(*) AS count FROM "Certificate"'
      ).get()?.count,
      1
    );
    assert.ok(!tableNames(rolledBackDb).includes("Category"));
    rolledBackDb.close();
  } finally {
    cleanup(databasePath);
    cleanup(snapshotPath);
  }
});

test("a failed migration transaction leaves the old schema intact", () => {
  const { databasePath, db } = createDatabase();

  try {
    applyMigrations(db, { before: categoryRenameMigration });
    assert.throws(() => {
      db.exec("BEGIN");
      try {
        db.exec('ALTER TABLE "Certificate" RENAME TO "Category"');
        db.exec('ALTER TABLE "missing_table" RENAME TO "broken_table"');
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    });

    assert.ok(tableNames(db).includes("Certificate"));
    assert.ok(!tableNames(db).includes("Category"));
  } finally {
    db.close();
    cleanup(databasePath);
  }
});
