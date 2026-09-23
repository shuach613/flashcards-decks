# Flashcard Decks

A Next.js application for studying and managing flashcard decks.

## Development

Install dependencies and start the development server:

`bash
npm install
npm run dev
`

Open [http://localhost:3000](http://localhost:3000).

For containerized local development with hot reload, use the separate development Compose file:

```bash
docker compose -f docker-compose.dev.yml up --build
```

The production Compose file is intentionally kept separate from this workflow. It builds and starts the production container; the development file mounts the source tree and runs `next dev`.

## Database

The application uses SQLite through Prisma. Set `DATABASE_URL` to the database file location, then apply migrations:

`bash
npx prisma migrate deploy
`

For production, keep the SQLite file on persistent storage.

## Authentication

Set a stable, long random `AUTH_SECRET`.

The Synology deployment creates one local initial administrator on an empty database using:

`text
ADMIN_INITIAL_EMAIL
ADMIN_INITIAL_PASSWORD
`

After the first administrator is created, later signups are regular users. The bootstrap variables should be removed after the first login.

## Password reset emails

Password reset emails use any SMTP-compatible personal email account. Configure:

`text
APP_URL=https://your-app.example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-smtp-password-or-app-password
SMTP_FROM=ShuachCloud <your-email@example.com>
`

The reset-token link expires after one hour.

## Synology deployment

The repository includes a Dockerfile and a Compose project for Synology Container Manager:

- `Dockerfile`
- `docker-compose.yml`
- `scripts/start-container.mjs`

See `docs/synology-container-manager.md` for the complete DS925+/DSM deployment guide.

The Synology Compose project is self-contained: edit the values in `docker-compose.yml` directly. No `.env` file is required for Container Manager. Set `APP_URL` to the HTTPS address configured in DSM's internal reverse proxy; the repository does not contain or require reverse-proxy rules.

Pull requests and `codex/*` pushes automatically run the tests and validate a Linux/amd64 Docker image build. Successful pushes to `main` and version tags publish the image to GitHub Container Registry as `ghcr.io/shuach613/flashcards-decks`; feature branches never publish images.

For a release tag such as `v1.2.3`, the workflow publishes `1.2.3`, `1.2`, `1`, and a commit-SHA tag. Pushes to `main` additionally update `latest`.

The `codex/docker-v2` branch temporarily publishes `test-docker-v2` for pre-main testing. It does not update `latest` or release tags.

## Updating a deployed container

For a Compose deployment that uses a prebuilt GHCR image:

1. Back up `/volume1/flashcards/data/` before changing the image.
2. Change the image tag in Container Manager, or use the new release tag supplied with the update.
3. Pull the new image and recreate the project without deleting `/volume1/flashcards/data/`.
4. Wait for the container to become healthy. Pending database migrations run automatically before the application starts.
5. Verify `https://your-app.example.com/api/health` returns HTTP `200`.

Do not use `--build` for a prebuilt image deployment, and do not remove the persistent data folder. If migrations fail, the container remains stopped and the pre-migration backup is retained under `/volume1/flashcards/data/.migration-backups/`.

## Rolling back an update

If an update fails, stop the project and restore the image tag and database backup from the same update point:

1. Stop the Flashcard Decks project in Container Manager.
2. Select the previous working image tag.
3. Copy the matching backup from `/volume1/flashcards/data/.migration-backups/` back to `/volume1/flashcards/data/flashcards.db`.
4. Recreate the project without rebuilding or deleting the data folder.
5. Check the logs and verify `/api/health` returns HTTP `200`.

Restore the database backup together with the previous image. Do not run an older image against a database that has already been migrated by a newer image.

## Production

Run the production build and server with:

`bash
npm run build
npm run start
`
