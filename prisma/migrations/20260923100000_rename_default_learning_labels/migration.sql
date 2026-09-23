-- Keep existing records and relationships while replacing the original
-- domain-specific default labels with generic learning placeholders.
UPDATE "Certificate" SET "name" = 'General Basics 1' WHERE "name" = 'A+ Core 1';
UPDATE "Certificate" SET "name" = 'General Basics 2' WHERE "name" = 'A+ Core 2';
UPDATE "Certificate" SET "name" = 'Connections Basics' WHERE "name" = 'Network+';
UPDATE "Certificate" SET "name" = 'Safety Basics' WHERE "name" = 'Security+';
UPDATE "Certificate" SET "name" = 'Applied Concepts' WHERE "name" = 'SecAI+';

UPDATE "Track" SET "name" = 'Foundations Track' WHERE "key" = 'IT_SUPPORT';
UPDATE "Track" SET "name" = 'Core Knowledge Track' WHERE "key" = 'CYBERSECURITY';
UPDATE "Track" SET "name" = 'Applied Knowledge Track' WHERE "key" = 'AI_CYBERSECURITY';
