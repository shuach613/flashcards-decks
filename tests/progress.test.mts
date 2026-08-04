import assert from "node:assert/strict";
import test from "node:test";
import { summarizeProgress } from "../lib/progress.ts";

test("an empty deck is not complete", () => {
  assert.deepEqual(summarizeProgress([]), {
    totalCount: 0,
    goodCount: 0,
    pendingCount: 0,
    isComplete: false,
  });
});

test("a partially studied deck reports good and pending cards", () => {
  assert.deepEqual(
    summarizeProgress([
      { id: "one", isGood: true },
      { id: "two", isGood: false },
      { id: "three", isGood: false },
    ]),
    {
      totalCount: 3,
      goodCount: 1,
      pendingCount: 2,
      isComplete: false,
    }
  );
});

test("a deck is complete only when every current card is good", () => {
  assert.equal(
    summarizeProgress([
      { id: "one", isGood: true },
      { id: "two", isGood: true },
    ]).isComplete,
    true
  );

  assert.equal(
    summarizeProgress([
      { id: "one", isGood: true },
      { id: "two", isGood: true },
      { id: "new-card", isGood: false },
    ]).isComplete,
    false
  );
});
