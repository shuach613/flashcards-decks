import assert from "node:assert/strict";
import test from "node:test";
import {
  canStudentAccessDeck,
  matchesStudentSearch,
} from "../lib/admin-student-overview.ts";

test("student search matches email, track, and category text", () => {
  assert.equal(matchesStudentSearch("alex@example.com", ["Foundations"], ["Basics"], "alex@"), true);
  assert.equal(matchesStudentSearch("alex@example.com", ["Foundations"], ["Basics"], "found"), true);
  assert.equal(matchesStudentSearch("alex@example.com", ["Foundations"], ["Basics"], "advanced"), false);
  assert.equal(matchesStudentSearch("alex@example.com", ["Foundations"], ["Basics"], undefined), true);
});

test("student deck visibility requires an assigned category", () => {
  assert.equal(canStudentAccessDeck("category-1", ["category-1", "category-2"]), true);
  assert.equal(canStudentAccessDeck("category-3", ["category-1", "category-2"]), false);
  assert.equal(canStudentAccessDeck(null, ["category-1"]), false);
});
