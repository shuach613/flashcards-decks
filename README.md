# Flashcard Decks

A Next.js application for studying and managing flashcard decks.

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

The application uses SQLite through Prisma. Set `DATABASE_URL` to the database file location, then apply migrations:

```bash
npx prisma migrate deploy
```

For a persistent production deployment, keep the SQLite file on persistent storage.

## Authentication

Set a stable, long random `AUTH_SECRET`. Administrator accounts are selected during signup by listing their email addresses in `ADMIN_EMAILS`.

## Password reset emails

Password reset emails use Resend. Configure:

```text
APP_URL=https://your-app.example.com
RESEND_API_KEY=...
RESEND_FROM=...
```

The reset-token link expires after one hour.

## Production

Run the production build and server with:

```bash
npm run build
npm run start
```
