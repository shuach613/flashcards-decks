-- Replace legacy service-specific default track keys with neutral identifiers.
-- Track IDs, names, categories, and user assignments are preserved.
BEGIN;

UPDATE "Track" SET "key" = 'MIGRATING_FOUNDATIONS' WHERE "key" = 'IT_SUPPORT';
UPDATE "Track" SET "key" = 'MIGRATING_CORE_KNOWLEDGE' WHERE "key" = 'CYBERSECURITY';
UPDATE "Track" SET "key" = 'MIGRATING_APPLIED_KNOWLEDGE' WHERE "key" = 'AI_CYBERSECURITY';

UPDATE "Track" SET "key" = 'FOUNDATIONS' WHERE "key" = 'MIGRATING_FOUNDATIONS';
UPDATE "Track" SET "key" = 'CORE_KNOWLEDGE' WHERE "key" = 'MIGRATING_CORE_KNOWLEDGE';
UPDATE "Track" SET "key" = 'APPLIED_KNOWLEDGE' WHERE "key" = 'MIGRATING_APPLIED_KNOWLEDGE';

COMMIT;
