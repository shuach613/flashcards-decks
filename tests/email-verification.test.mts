import assert from "node:assert/strict";
import test from "node:test";
import {
  VERIFICATION_TOKEN_TTL_MS,
  isExpiredVerificationAttempt,
  nextVerificationAttempt,
} from "../lib/email-verification-policy.ts";

test("verification links use a 48-hour lifetime", () => {
  assert.equal(VERIFICATION_TOKEN_TTL_MS, 48 * 60 * 60 * 1000);
});

test("verification allows exactly one retry", () => {
  assert.equal(nextVerificationAttempt(0), 1);
  assert.equal(nextVerificationAttempt(1), 2);
  assert.equal(nextVerificationAttempt(2), null);
});

test("only an expired final attempt qualifies for deletion", () => {
  const now = new Date("2026-09-24T12:00:00.000Z");
  assert.equal(isExpiredVerificationAttempt(1, new Date("2026-09-24T11:00:00.000Z"), now), false);
  assert.equal(isExpiredVerificationAttempt(2, new Date("2026-09-24T13:00:00.000Z"), now), false);
  assert.equal(isExpiredVerificationAttempt(2, new Date("2026-09-24T11:00:00.000Z"), now), true);
});
