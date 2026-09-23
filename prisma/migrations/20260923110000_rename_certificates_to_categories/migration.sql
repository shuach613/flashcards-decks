-- Rename the persisted certificate concept to category without losing data or
-- changing the IDs used by decks and track assignments.
ALTER TABLE "Certificate" RENAME TO "Category";
ALTER TABLE "TrackCertificate" RENAME TO "TrackCategory";
ALTER TABLE "Deck" RENAME COLUMN "certificateId" TO "categoryId";
ALTER TABLE "TrackCategory" RENAME COLUMN "certificateId" TO "categoryId";

DROP INDEX IF EXISTS "Certificate_name_key";
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

DROP INDEX IF EXISTS "TrackCertificate_certificateId_idx";
CREATE INDEX "TrackCategory_categoryId_idx" ON "TrackCategory"("categoryId");
