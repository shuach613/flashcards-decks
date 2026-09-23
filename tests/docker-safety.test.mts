import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

test("Docker build context excludes runtime data and secrets", () => {
  const dockerignore = readFileSync(join(root, ".dockerignore"), "utf8");

  for (const entry of [
    "data",
    ".migration-backups",
    ".env*",
    "*.db",
    "docker-compose*.yml",
  ]) {
    assert.match(dockerignore, new RegExp(`^${entry.replace("*", "\\S*")}$`, "m"));
  }
});

test("runtime image does not contain a build-time database", () => {
  const dockerfile = readFileSync(join(root, "Dockerfile"), "utf8");

  assert.match(dockerfile, /DATABASE_URL=file:\/tmp\/flashcards-build\.db/);
  assert.match(dockerfile, /rm -rf \/app\/data && mkdir -p \/app\/data/);
});
