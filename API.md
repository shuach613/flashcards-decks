# Admin API

A REST API mirroring everything the admin UI can do: create/list/get/update/delete
decks, add or edit cards, and manage certificates.

**Base URL:** `<APP_URL>/api/v1`

## Auth

Every request requires an `Authorization` header with the admin API key:

```
Authorization: Bearer $ADMIN_API_KEY
```

The key is stored as the `ADMIN_API_KEY` environment variable on the server.
It is never committed to this repo — treat it like a password and rotate it
if it leaks.

Requests without a valid key get `401 Unauthorized`.

## Decks

| Action | Request |
|---|---|
| List decks | `GET /decks` |
| Create deck | `POST /decks` — `{"title", "certificate"?, "language": "EN"\|"DE", "description"?, "slug"?}` |
| Get one deck (incl. cards) | `GET /decks/:slug` |
| Rename/edit deck | `PATCH /decks/:slug` — `{"title"?, "description"?, "certificate"?, "language"?, "slug"?}` |
| Delete deck | `DELETE /decks/:slug` |

Decks are identified by `slug` (also the shareable-link identifier). Every
deck response includes a `shareUrl` field — there's no separate endpoint to
fetch the link.

`certificate` is a certificate **name** (e.g. `"Network+"`), not an ID. It's
optional on create — omitting it leaves the deck "Uncategorized". Passing an
unknown name returns `400` with the list of valid certificate names.

## Cards

| Action | Request |
|---|---|
| List cards in a deck | `GET /decks/:slug/cards` |
| Add cards | `POST /decks/:slug/cards` — `{"tsv": "front\tback\n..." }` or `{"cards": [{"front", "back"}]}` |
| Update a card | `PATCH /cards/:id` — `{"front"?, "back"?}` |
| Delete a card | `DELETE /cards/:id` |

## Certificates

| Action | Request |
|---|---|
| List certificates | `GET /certificates` |
| Create certificate | `POST /certificates` — `{"name" }` |

New certificates are appended to the end of the display order used on the
"All Decks" page.

## Example

```bash
curl -X POST http://nas-host:3000/api/v1/decks \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Deck","certificate":"Network+","language":"EN"}'
```
