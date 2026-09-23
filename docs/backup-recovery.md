# Backup and Recovery

This application stores its persistent state in SQLite. The container image is
replaceable; the data and deployment configuration are the items that must be
protected.

## What to back up

Back up these items from the Synology NAS:

- `/volume1/flashcards/data/flashcards.db`
- `/volume1/flashcards/data/.migration-backups/`
- The production Compose YAML, stored separately from the repository because it
  contains secrets
- The DSM reverse-proxy hostname and certificate configuration, maintained in
  DSM rather than in this repository

The `.migration-backups` directory contains automatic pre-migration snapshots.
Keep it as an additional recovery option, but do not use one of those files as
the active database unless performing a rollback.

## Routine backup

Use Hyper Backup or another backup tool that can copy SQLite files safely.
Before manually copying `flashcards.db`, stop the project in Container Manager
so no write is in progress. Keep multiple dated backup versions and test that
at least one version can be restored.

Back up the Compose YAML whenever configuration changes. Keep the SMTP app
password, `AUTH_SECRET`, and `ADMIN_API_KEY` protected; do not commit the
production YAML or secrets to Git.

## Recovery on the same NAS

1. Stop the Flashcard Decks project.
2. Preserve the current `/volume1/flashcards/data/` directory for investigation.
3. Restore the selected `flashcards.db` backup to
   `/volume1/flashcards/data/flashcards.db`.
4. Restore the matching Compose YAML and use the image version that created
   that database backup.
5. Recreate the project without deleting or reinitializing the data folder.
6. Check the container logs and open `/api/health`.
7. Verify that users, decks, cards, progress, and password-reset settings work.

## Recovery on a new NAS

1. Install the current DSM and Container Manager.
2. Recreate `/volume1/flashcards/data/`.
3. Restore the database and the production Compose YAML.
4. Recreate the DSM reverse-proxy configuration and certificate.
5. Pull the matching image tag and start the project.
6. Confirm `/api/health` returns HTTP `200` before allowing normal use.

Use the same `AUTH_SECRET` when restoring an installation. Changing it can
invalidate existing authentication sessions. Do not set new initial-admin
credentials unless the restored database contains no users.

## Before deleting an installation

Confirm that the backup contains a readable `flashcards.db`, the Compose YAML
is stored securely, and the public URL and SMTP settings are documented in a
protected location. Only then remove the old container or data directory.
