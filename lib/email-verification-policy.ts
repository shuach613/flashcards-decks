export const VERIFICATION_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

export function nextVerificationAttempt(currentAttempt: number) {
  if (currentAttempt >= 2) return null;
  return Math.max(1, currentAttempt + 1);
}

export function isExpiredVerificationAttempt(
  attempt: number,
  expiresAt: Date,
  now = new Date()
) {
  return attempt >= 2 && expiresAt <= now;
}
