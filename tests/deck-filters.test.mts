import assert from "node:assert/strict";
import test from "node:test";
import {
  compareDifficulty,
  matchesDifficulty,
  parseDifficulty,
  parseDifficultyOrder,
} from "../lib/deck-filters.ts";

test("difficulty filters accept only supported values", () => {
  assert.equal(parseDifficulty("EASY"), "EASY");
  assert.equal(parseDifficulty("UNKNOWN"), undefined);
  assert.equal(matchesDifficulty("HARD", "HARD"), true);
  assert.equal(matchesDifficulty("EASY", "HARD"), false);
  assert.equal(matchesDifficulty("INTERMEDIATE", undefined), true);
});

test("difficulty ordering runs from easy to hard or the reverse", () => {
  assert.equal(compareDifficulty("EASY", "HARD", "asc") < 0, true);
  assert.equal(compareDifficulty("HARD", "EASY", "desc") < 0, true);
  assert.equal(compareDifficulty("INTERMEDIATE", "INTERMEDIATE", "asc"), 0);
  assert.equal(parseDifficultyOrder("asc"), "asc");
  assert.equal(parseDifficultyOrder("desc"), "desc");
  assert.equal(parseDifficultyOrder("random"), undefined);
});

test("unknown stored difficulty values sort as intermediate", () => {
  assert.equal(compareDifficulty("LEGACY", "HARD", "asc") < 0, true);
  assert.equal(compareDifficulty("LEGACY", "EASY", "desc") < 0, true);
});
