# API Contract: GET /api/squads

**Feature**: 014-as-scrum-master
**Date**: October 9, 2025

## Endpoint
```
GET /api/squads
```

## Purpose
Retrieve all squads for the authenticated Scrum Master user.

## Authentication
Required: Bearer token in Authorization header

## Request

### Headers
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Query Parameters
None

### Body
None

## Response

### Success Response (200 OK)
```json
{
  "squads": [
    {
      "id": "string",
      "name": "string",
      "alias": "string",
      "memberCount": "number",
      "createdAt": "2025-10-09T10:00:00.000Z"
    }
  ]
}
```

### Field Descriptions
- `id`: Unique squad identifier (CUID)
- `name`: Human-readable squad name
- `alias`: URL-friendly unique identifier
- `memberCount`: Number of team members in squad
- `createdAt`: ISO 8601 timestamp of squad creation

### Error Responses

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to retrieve squads"
}
```

## Implementation Notes

### Database Query
```sql
SELECT
  s.id,
  s.name,
  s.alias,
  s."createdAt",
  COUNT(sm."userId") as "memberCount"
FROM "Squad" s
LEFT JOIN "SquadMembers" sm ON s.id = sm."squadId"
WHERE s."scrumMasterId" = $1
GROUP BY s.id, s.name, s.alias, s."createdAt"
ORDER BY s."createdAt" DESC
```

### Performance
- Uses indexed query on `scrumMasterId`
- Single query with JOIN for member count
- Response cached at application level if needed

### Validation
- Authentication token validated
- User role verified as Scrum Master
- No input validation required (GET request)