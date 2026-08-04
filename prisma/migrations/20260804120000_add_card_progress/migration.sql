-- CreateTable
CREATE TABLE "CardProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "isGood" BOOLEAN NOT NULL DEFAULT false,
    "timesGood" INTEGER NOT NULL DEFAULT 0,
    "timesAgain" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CardProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CardProgress_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CardProgress_userId_cardId_key" ON "CardProgress"("userId", "cardId");

-- CreateIndex
CREATE INDEX "CardProgress_userId_idx" ON "CardProgress"("userId");

-- CreateIndex
CREATE INDEX "CardProgress_cardId_idx" ON "CardProgress"("cardId");
