import assert from "node:assert/strict";
import test from "node:test";
import { buildStudyQueue, selectStudyCards } from "../lib/study-queue.ts";

const cards = [
  { id: "pending-1", isGood: false },
  { id: "pending-2", isGood: false },
  { id: "pending-3", isGood: false },
  { id: "pending-4", isGood: false },
  { id: "pending-5", isGood: false },
  { id: "pending-6", isGood: false },
  { id: "good-1", isGood: true },
  { id: "good-2", isGood: true },
  { id: "good-3", isGood: true },
  { id: "good-4", isGood: true },
  { id: "good-5", isGood: true },
  { id: "good-6", isGood: true },
];

test("the default queue excludes cards already marked good", () => {
  const queue = buildStudyQueue(cards, false);
  assert.equal(queue.length, 6);
  assert.ok(queue.every((card) => !card.isGood));
});

test("review mode mixes good cards at a lower frequency", () => {
  const queue = buildStudyQueue(cards, true);
  const goodCards = queue.filter((card) => card.isGood);

  assert.equal(queue.length, 8);
  assert.equal(goodCards.length, 2);
  assert.equal(new Set(queue.map((card) => card.id)).size, queue.length);
});

test("an all-good deck can still be reviewed without changing completion", () => {
  const queue = buildStudyQueue(
    cards.filter((card) => card.isGood),
    true
  );
  assert.equal(queue.length, 6);
  assert.ok(queue.every((card) => card.isGood));
});

test("selected study cards are limited to IDs from the loaded deck", () => {
  const selected = selectStudyCards(
    cards,
    new Set(["pending-2", "good-4", "not-in-this-deck"])
  );
  assert.deepEqual(
    selected.map((card) => card.id),
    ["pending-2", "good-4"]
  );
});
