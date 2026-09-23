import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

type SqliteDatabase = {
  exec(sql: string): void;
  prepare(sql: string): { get(): unknown };
  close(): void;
};

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3") as new (path: string) => SqliteDatabase;

const migrationsDirectory = join(process.cwd(), "prisma", "migrations");
const categoryRenameMigration = "20260923110000_rename_certificates_to_categories";

function applyMigrationsBeforeCategoryRename(db: SqliteDatabase) {
  for (const migration of readdirSync(migrationsDirectory).sort()) {
    if (migration >= categoryRenameMigration) continue;

    db.exec(readFileSync(join(migrationsDirectory, migration, "migration.sql"), "utf8"));
  }
}

test("category rename preserves existing installation data", () => {
  const databasePath = join(tmpdir(), `flashcards-upgrade-${Date.now()}.db`);
  const db = new Database(databasePath);

  applyMigrationsBeforeCategoryRename(db);

  db.exec(`
    INSERT INTO "User" ("id", "email", "passwordHash", "role")
      VALUES ('user-1', 'user@example.com', 'hash', 'USER');
    INSERT INTO "Certificate" ("id", "name", "order")
      VALUES ('category-1', 'General Basics 1', 0);
    INSERT INTO "Track" ("id", "key", "name", "order")
      VALUES ('track-1', 'IT_SUPPORT', 'Foundations Track', 0);
    INSERT INTO "TrackCertificate" ("trackId", "certificateId")
      VALUES ('track-1', 'category-1');
    INSERT INTO "UserTrack" ("userId", "trackId")
      VALUES ('user-1', 'track-1');
    INSERT INTO "Deck" ("id", "slug", "title", "description", "certificateId", "language")
      VALUES ('deck-1', 'general-basics', 'General Basics', 'Existing deck', 'category-1', 'EN');
    INSERT INTO "Card" ("id", "deckId", "front", "back", "order")
      VALUES ('card-1', 'deck-1', 'Question', 'Answer', 0);
    INSERT INTO "StudyProgress" ("id", "userId", "deckId", "timesStudied")
      VALUES ('study-1', 'user-1', 'deck-1', 3);
    INSERT INTO "CardProgress" ("id", "userId", "cardId", "isGood", "timesGood", "timesAgain", "updatedAt")
      VALUES ('progress-1', 'user-1', 'card-1', 1, 2, 1, CURRENT_TIMESTAMP);
  `);

  db.exec(
    readFileSync(
      join(migrationsDirectory, categoryRenameMigration, "migration.sql"),
      "utf8"
    )
  );

  assert.deepEqual(db.prepare('SELECT "id", "name" FROM "Category"').get(), {
    id: "category-1",
    name: "General Basics 1",
  });
  assert.deepEqual(
    db.prepare('SELECT "id", "categoryId" FROM "Deck"').get(),
    { id: "deck-1", categoryId: "category-1" }
  );
  assert.deepEqual(
    db.prepare('SELECT "trackId", "categoryId" FROM "TrackCategory"').get(),
    { trackId: "track-1", categoryId: "category-1" }
  );
  assert.deepEqual(db.prepare('SELECT "id" FROM "User"').get(), { id: "user-1" });
  assert.deepEqual(db.prepare('SELECT "id" FROM "Card"').get(), { id: "card-1" });
  assert.deepEqual(
    db.prepare('SELECT "timesStudied" FROM "StudyProgress"').get(),
    { timesStudied: 3 }
  );
  assert.deepEqual(
    db.prepare('SELECT "timesGood" FROM "CardProgress"').get(),
    { timesGood: 2 }
  );

  db.close();
});
