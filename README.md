# ☁️ ShuachCloud Flashcard Decks

Your own private place to turn knowledge into progress. Create decks, invite
learners, and study at your own pace — hosted on your own server or NAS.

Perfect for small study groups, classrooms, families, and private teams.

## ✨ What can it do?

- 📚 Create decks, cards, categories, and learning tracks
- 🎯 Assign learners the content they need
- 🧠 Study with "Good" and "Again" ratings
- 📈 Track personal progress and completion
- 🟢🟡🔴 Show deck difficulty at a glance
- 🛠️ Manage users, tracks, categories, decks, and cards as an admin
- ⚙️ Give every user personal account and progress settings
- 🔐 Protect new accounts with email verification
- 📧 Send verification and password-reset emails through Gmail or another SMTP provider
- 🌍 Use the interface in English or German
- ❤️ Keep everything in your own SQLite database

The included tracks and categories are neutral placeholders. Rename them and
make the app your own.

## 🐳 Quick deployment

The easiest production setup uses the prebuilt image:

```text
ghcr.io/shuach613/flashcards-decks:latest
```

On a Synology NAS:

1. Open **Container Manager → Projects**.
2. Paste the Compose YAML.
3. Add your URL, `AUTH_SECRET`, initial admin details, and SMTP app password.
4. Keep the persistent data mapped to:

   ```text
   /volume1/flashcards/data:/app/data
   ```

5. Start the project and check `/api/health`.

Use DSM's built-in reverse proxy for HTTPS. No separate proxy container is
needed, and no `.env` file is required when using the supplied YAML.

🔄 Updates replace the app image but keep your users, decks, cards, and progress
as long as `/volume1/flashcards/data` is not deleted. Back up `flashcards.db`
before updating.

## 💻 What does it need?

- 64-bit `linux/amd64` hardware
- Docker or Synology DSM Container Manager
- Around 2 GB of available memory for a small installation
- Persistent disk space for the database and backups
- Internet access for image downloads and SMTP email

A Synology DS925+ is suitable for this kind of private deployment.

## ⚠️ Good to know

- SQLite is intentionally simple: one container and a small number of users.
- It is not designed for high traffic, clustering, or high availability.
- Login is local; LDAP, SSO, and OAuth are not included.
- New users must verify their email before studying. Links last 48 hours.
- The initial administrator is available immediately so the installation can be
  configured before SMTP is tested.
- HTTPS, DNS, firewall rules, backups, and reverse-proxy settings remain under
  the operator's control.
- The published image currently supports `linux/amd64`, not ARM.

## 🧑‍💻 Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Before contributing, run:

```bash
npm run lint
npm test
npm run build
```

📖 Detailed Synology instructions: [`docs/synology-container-manager.md`](docs/synology-container-manager.md)

🛟 Backup and recovery: [`docs/backup-recovery.md`](docs/backup-recovery.md)
