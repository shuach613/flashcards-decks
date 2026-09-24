-- Existing users are trusted so this feature does not interrupt active accounts.
ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "verificationAttempts" INTEGER NOT NULL DEFAULT 0;

UPDATE "User"
SET "emailVerifiedAt" = CURRENT_TIMESTAMP
WHERE "emailVerifiedAt" IS NULL;

CREATE TABLE "VerificationToken" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tokenHash" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "attempt" INTEGER NOT NULL DEFAULT 1,
  "expiresAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VerificationToken_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "VerificationToken_tokenHash_key" ON "VerificationToken"("tokenHash");
CREATE INDEX "VerificationToken_userId_idx" ON "VerificationToken"("userId");
CREATE INDEX "VerificationToken_expiresAt_idx" ON "VerificationToken"("expiresAt");
