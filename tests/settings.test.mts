import assert from "node:assert/strict";
import test from "node:test";
import { isValidEmail, normalizeEmail } from "../lib/settings.ts";

test("email settings normalize addresses before saving", () => {
  assert.equal(normalizeEmail("  User@Example.COM "), "user@example.com");
});

test("email settings reject malformed addresses", () => {
  assert.equal(isValidEmail("user@example.com"), true);
  assert.equal(isValidEmail("not-an-email"), false);
  assert.equal(isValidEmail("user@"), false);
});
