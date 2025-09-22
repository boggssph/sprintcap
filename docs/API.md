# API Reference

This file documents server API endpoints relevant to invites and acceptance.

## POST /api/invite

Create / manage invites.

- Methods supported via POST body:
  - Create: `{ email, role?, squadId? }` -> 201 { id, token }
  - Regenerate: `{ action: 'regenerate', inviteId }` -> 200 { id, token }
  - Revoke: `{ action: 'revoke', inviteId }` -> 200 { id }

- Authentication: requires a valid NextAuth session. For development only, a dev bypass is accepted by providing `x-test-user` header or `?test_user=` query param when `NODE_ENV !== 'production'`.

- Notes: plaintext token is returned only once on create or regenerate. The database stores a hashed token.

Examples (curl)

Create invite

```bash
curl -X POST "http://localhost:3000/api/invite" \
  -H "Content-Type: application/json" \
  -H "x-test-user: admin@example.com" \
  -d '{"email":"new.user@example.com","role":"MEMBER"}'
```

Regenerate token

```bash
curl -X POST "http://localhost:3000/api/invite" \
  -H "Content-Type: application/json" \
  -H "x-test-user: admin@example.com" \
  -d '{"action":"regenerate","inviteId":"inv-abc123"}'
```

Revoke invite

```bash
curl -X POST "http://localhost:3000/api/invite" \
  -H "Content-Type: application/json" \
  -H "x-test-user: admin@example.com" \
  -d '{"action":"revoke","inviteId":"inv-abc123"}'
```

List invites

```bash
curl "http://localhost:3000/api/invite?limit=20" -H "x-test-user: admin@example.com"
```

## POST /api/accept-invite

Example (curl)

```bash
curl -X POST "http://localhost:3000/api/accept-invite" \
  -H "Content-Type: application/json" \
  -d '{"token":"token-abc123","userEmail":"new.user@example.com"}'
```

OpenAPI spec

There is a minimal OpenAPI spec in `docs/openapi.yaml` which describes the main invite endpoints.

## GET /api/invite

List invites with pagination, optional filters:
- Query params: `limit`, `cursor`, `status`, `q` (search string)
- Returns: `{ invites: [], nextCursor: string | null }`

## POST /api/accept-invite

- Request body: `{ token, userEmail }` (both required)
- Verifies token by hashing and matching the stored tokenHash
- If valid and not expired, updates invitation status to `ACCEPTED` and returns 200

Security
- Token comparisons use sha256 hashes; tokens are never stored in plaintext in the DB.
