# API Reference

This file documents server API endpoints relevant to invites, acceptance, and sprint management.

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

## GET /api/sprints

List sprints with filtering and pagination.

- Query parameters:
  - `squadId` (optional): Filter by specific squad
  - `status` (optional): Filter by sprint status (`active`, `upcoming`, `completed`)
  - `limit` (optional): Number of sprints to return (default: 20)
  - `offset` (optional): Pagination offset (default: 0)

- Authentication: Required. Uses NextAuth session or `x-test-user` header in development.

- Response: `{ sprints: [], total: number, limit: number, offset: number }`

Example (curl)

```bash
curl "http://localhost:3000/api/sprints?limit=10&status=active" \
  -H "x-test-user: scrum.master@example.com"
```

## POST /api/sprints

Create a new sprint.

- Request body: `{ name, squadId, startDate, endDate }` (all required)
  - `name`: Sprint name (string)
  - `squadId`: ID of the squad to create the sprint for (string)
  - `startDate`: ISO 8601 date string for sprint start
  - `endDate`: ISO 8601 date string for sprint end

- Authentication: Required. Only Scrum Masters can create sprints.

- Response: `201` with sprint details on success

- Error responses:
  - `400`: Validation error (invalid dates, missing fields, overlap with existing sprint)
  - `403`: Permission denied (not a Scrum Master or not owner of the squad)
  - `404`: Squad not found
  - `409`: Sprint dates overlap with existing sprint

Example (curl)

```bash
curl -X POST "http://localhost:3000/api/sprints" \
  -H "Content-Type: application/json" \
  -H "x-test-user: scrum.master@example.com" \
  -d '{
    "name": "Sprint 2025-10",
    "squadId": "squad-123",
    "startDate": "2025-10-01T09:00:00Z",
    "endDate": "2025-10-15T17:00:00Z"
  }'
```

## GET /api/sprints/[id]

Get detailed information about a specific sprint.

- Path parameter: `id` (sprint ID)

- Authentication: Required. Users must have access to the sprint's squad.

- Response: `200` with detailed sprint information including members

- Error responses:
  - `403`: Access denied
  - `404`: Sprint not found

Example (curl)

```bash
curl "http://localhost:3000/api/sprints/sprint-123" \
  -H "x-test-user: scrum.master@example.com"
```

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

OpenAPI spec

There is a minimal OpenAPI spec in `docs/openapi.yaml` which describes the main invite endpoints.

## GET /api/member-hours

Retrieve member hours for a specific sprint.

- Query parameters: `sprintId` (required)
- Authentication: requires Scrum Master role for the sprint's squad
- Response: 200 with array of member hours objects

Example

```bash
curl "http://localhost:3000/api/member-hours?sprintId=sprint-123" \
  -H "x-test-user: scrum@example.com"
```

## PUT /api/member-hours

Update or create member hours for a team member in a sprint.

- Request body: `{ memberId, sprintId, supportIncidents, prReview, others }`
- Authentication: requires Scrum Master role for the sprint's squad
- Validation: all hour values must be non-negative numbers
- Response: 200 with updated member hours object

Example

```bash
curl -X PUT "http://localhost:3000/api/member-hours" \
  -H "Content-Type: application/json" \
  -H "x-test-user: scrum@example.com" \
  -d '{"memberId":"user-123","sprintId":"sprint-123","supportIncidents":2.5,"prReview":1.0,"others":0.5}'
```

Security
