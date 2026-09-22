# Synology Container Manager Deployment

This guide targets the Synology DS925+ with the newest DSM 7.x release available for the device and the newest compatible Container Manager package.

The application runs as one `linux/amd64` container with:

- Next.js and Node.js 20
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
    ├── .env
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

## 3. Create the environment file

Copy `.env.example` to `.env` in the project folder. Set real values for:

`text
DATABASE_URL=file:/app/data/flashcards.db
AUTH_SECRET=<long-random-secret>
APP_URL=http://<NAS-IP>:3000

ADMIN_INITIAL_EMAIL=<first-admin-email>
ADMIN_INITIAL_PASSWORD=<temporary-password>

ADMIN_API_KEY=<long-random-api-key>

RESEND_API_KEY=<Resend-api-key>
RESEND_FROM=<verified-sender-address>
`

Use the public HTTPS URL instead of `http://<NAS-IP>:3000` if the application is exposed through a DSM reverse proxy.

If a reverse proxy is used, set:

`text
AUTH_TRUST_HOST=true
`

Keep `.env` out of GitHub. It contains passwords and API keys.

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
2. Creates `ADMIN_INITIAL_EMAIL` as an administrator if it does not exist.
3. Hashes `ADMIN_INITIAL_PASSWORD` with bcrypt.
4. Leaves the account and password unchanged on later restarts.
5. Starts the application on port `3000`.

After successfully logging in, remove both `ADMIN_INITIAL_EMAIL` and `ADMIN_INITIAL_PASSWORD` from `.env`, then recreate the project so the temporary password is no longer supplied to the container.

Do not change the SQLite data folder during this process.

## 6. Password reset email

Password reset requires a Resend account and a verified sender address.

The reset link is generated from `APP_URL` and expires after one hour. The NAS must be able to make outbound HTTPS connections to Resend.

If the email settings are missing or invalid, the application will not be able to deliver reset emails.

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

## 8. Updates

Before updating:

1. Back up the `data` folder.
2. Replace the application source with the desired revision.
3. Rebuild the project in Container Manager.
4. Start the project.

Migrations run automatically before the application starts. Never delete the `data` folder during an update.

## 9. Troubleshooting

- **Container exits immediately:** check the project logs. Missing ` AUTH_SECRET`, incomplete initial-admin variables, or an invalid `DATABASE_URL` are common causes.
- **Users or decks disappeared:** confirm that `./data` is still mounted to `/app/data`.
- **Password reset emails do not arrive:** verify `RESEND_API_KEY`, `RESEND_FROM`, sender-domain verification, and outbound HTTPS access.
- **Login fails behind a reverse proxy:** verify `APP_URL`, HTTPS forwarding, and `AUTH_TRUST_HOST=true`.
- **Build is slow or fails on memory:** build the `linux/amd64` image on another machine and import it into Container Manager instead of building on the NAS.
