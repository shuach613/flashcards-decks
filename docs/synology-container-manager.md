# Synology Container Manager Deployment

This guide targets the Synology DS925+ with the newest DSM 7.x release available for the device and the newest compatible Container Manager package.

The application runs as one `linux/amd64` container with:

- Next.js and Node.js 22
- SQLite through Prisma
- Persistent application data under `/app/data`
- Automatic migrations on container startup
- Optional first-deployment administrator creation

## 1. Prepare DSM

1. Update the NAS to the newest DSM release available for the DS925+.
2. Install or update Container Manager from Package Center.
3. Create a shared folder for the project, for example:
   `docker/flashcards-decks`
4. Inside that folder, create a `data` subfolder.

The final layout should look like:

`text
docker/
└── flashcards-decks/
    ├── Dockerfile
    ├── docker-compose.yml
    ├── docker-compose.yml
    ├── data/
    └── application source
`

The `data` folder must remain on persistent storage. It contains the SQLite database.

## 2. Copy the project

Copy the contents of this repository branch into the project folder. The Compose file builds the image locally and targets `linux/amd64`, which matches the DS925+ CPU architecture.

The image build needs outbound internet access to download:

- Node.js base-image layers
- npm packages
- The Google font used by the application

The NAS does not need Node.js or npm installed on DSM. They are included inside the image.

The repository also includes `docker-compose.dev.yml` for local development. Do not use that file for Synology deployment; it mounts the source tree and runs the development server.

The GitHub Actions workflow publishes successful `main` builds and version tags to the public image `ghcr.io/shuach613/flashcards-decks`. Container Manager can pull it without GHCR credentials.

## DSM reverse proxy boundary

The repository intentionally contains no Nginx, Traefik, Caddy, ingress, TLS,
certificate, or reverse-proxy deployment configuration. Configure the public
hostname, HTTPS certificate, source port, and destination NAS port only in
DSM's built-in reverse-proxy service. Keep the container reachable on its
published NAS port and set `APP_URL` to the resulting HTTPS URL.

## 3. Configure the Compose YAML

No `.env` file is required. Open `docker-compose.yml` and replace the placeholder values in its `environment` section:

`text
DATABASE_URL=file:/app/data/flashcards.db
AUTH_SECRET=<at-least-32-character-random-secret>
APP_URL=https://<DSM-reverse-proxy-hostname>

ADMIN_INITIAL_EMAIL=<first-admin-email>
ADMIN_INITIAL_PASSWORD=<temporary-password>

ADMIN_API_KEY=<at-least-32-character-random-api-key>

SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<personal-email-address>
SMTP_PASSWORD=<smtp-password-or-app-password>
SMTP_FROM=ShuachCloud <personal-email-address>
`

Set `AUTH_TRUST_HOST=true` because DSM's internal reverse proxy supplies the public HTTPS endpoint. Keep the edited Compose file private because it contains passwords and API keys. The placeholder values in the repository are not usable credentials.

Use HTTPS through DSM's internal reverse proxy for any access outside your trusted local network. Configure the proxy in DSM itself; no reverse-proxy deployment rules are included in this repository. The application adds HSTS, clickjacking, MIME-sniffing, referrer, and browser-permission protections. The login, signup, and password-reset actions also apply per-process throttling.

## 4. Create the Container Manager project

In Container Manager:

1. Open **Project**.
2. Select **Create**.
3. Give the project a name such as `flashcards-decks`.
4. Set the project path to the folder containing `docker-compose.yml`.
5. Select the Compose file.
6. Build and start the project.

The Compose file:

- Publishes NAS port `3000` to container port `3000`
- Mounts the project `data` folder to `/app/data`
- Restarts the container automatically
- Installs and runs the Node.js application inside the container

## 5. First administrator

On the first startup, the container:

1. Applies all pending Prisma migrations.
2. Creates `ADMIN_INITIAL_EMAIL` as an administrator only when the database has no users.
3. Hashes `ADMIN_INITIAL_PASSWORD` with bcrypt.
4. Leaves the account and password unchanged on later restarts and skips bootstrap once any user exists.
5. Marks this account as the primary administrator.
6. Starts the application on port `3000`.

After successfully logging in, remove or blank both `ADMIN_INITIAL_EMAIL` and `ADMIN_INITIAL_PASSWORD` in `docker-compose.yml`, then recreate the project so the temporary password is no longer supplied to the container. The admin account remains in that local installation's persistent database.

The primary administrator can open the student administration page to grant or
revoke administrator access for other users. Other administrators cannot revoke
administrator access. When upgrading an older installation to this version,
leave `ADMIN_INITIAL_EMAIL` set to the existing initial administrator for the
first startup so the account can be marked as primary; remove the initial-admin
variables after verifying the upgrade.

Do not change the SQLite data folder during this process.

## 6. Password reset email

Password reset uses a personal SMTP email account. Gmail and other providers may require an app password rather than the normal account password.

Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`. The reset link is generated from `APP_URL` and expires after one hour. The NAS must be able to make outbound SMTP connections to the provider.

If the SMTP settings are missing or invalid, the application will not be able to deliver reset emails.

## 7. Backups

Back up this folder:

`text
/docker/flashcards-decks/data/
`

The important file is:

`text
flashcards.db
`

Use Hyper Backup or another SQLite-safe backup process. Before manually copying the database file, stop the project to avoid copying it during a write.

For the full backup and recovery procedure, see `docs/backup-recovery.md`.

## 8. Updates

For the prebuilt-image Compose deployment:

1. Back up `/volume1/flashcards/data/` before changing the image.
2. In Container Manager, edit the project YAML and change the image tag to the desired release.
3. Pull the new image and recreate the project. Do not select a build operation.
4. Keep the volume mapping pointed at `/volume1/flashcards/data:/app/data`.
5. Check the project logs. The container creates a pre-migration backup, applies pending migrations, and starts the application only when migrations succeed.
6. Verify the deployment with `https://<DSM-reverse-proxy-hostname>/api/health`. A healthy response has HTTP status `200`.

Never delete `/volume1/flashcards/data/` during an update. If the migration fails, leave the container stopped and keep the `.migration-backups` folder for the rollback procedure.

## 9. Rollback

Restore the image and database as a matching pair:

1. Stop the project in Container Manager.
2. Select the previous known-good image tag.
3. In `/volume1/flashcards/data/.migration-backups/`, identify the backup created immediately before the failed update.
4. Copy that backup to `/volume1/flashcards/data/flashcards.db`, preserving the filename and ownership.
5. Recreate the project without building and without changing the volume mapping.
6. Check the logs and open `/api/health`; it should return HTTP `200`.

Before replacing the current database, make a separate copy of it if you need to investigate the failed update. Never run an older image against a database that was already migrated by a newer image; restore the matching pre-migration database first.

## 10. Troubleshooting

- **Container exits immediately:** check the project logs. Missing ` AUTH_SECRET`, incomplete initial-admin variables, or an invalid `DATABASE_URL` are common causes.
- **Users or decks disappeared:** confirm that `./data` is still mounted to `/app/data`.
- **Password reset emails do not arrive:** verify the SMTP host, port, encryption mode, username, app password, sender address, and outbound SMTP access.
- **Login fails behind a reverse proxy:** verify `APP_URL`, HTTPS forwarding, and `AUTH_TRUST_HOST=true`.
- **Build is slow or fails on memory:** build the `linux/amd64` image on another machine and import it into Container Manager instead of building on the NAS.
