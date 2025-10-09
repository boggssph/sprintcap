# API Contract: POST /api/squads

**Feature**: 014-as-scrum-master
**Date**: October 9, 2025

## Endpoint
```
POST /api/squads
```

## Purpose
Create a new squad for the authenticated Scrum Master user.

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
```json
{
  "name": "string",
  "alias": "string"
}
```

### Field Requirements
- `name`: Required, 1-100 characters, trimmed
- `alias`: Required, 1-50 characters, lowercase, alphanumeric + hyphens only

## Response

### Success Response (201 Created)
```json
{
  "squad": {
    "id": "string",
    "name": "string",
    "alias": "string",
    "memberCount": 0,
    "createdAt": "2025-10-09T10:00:00.000Z"
  }
}
```

### Field Descriptions
- `id`: Auto-generated unique squad identifier (CUID)
- `name`: Squad name (as provided)
- `alias`: Squad alias (as provided, validated unique)
- `memberCount`: Always 0 for new squads
- `createdAt`: ISO 8601 timestamp of squad creation

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "error": "Validation Error",
  "message": "Invalid squad data",
  "details": {
    "name": ["Name is required", "Name must be less than 100 characters"],
    "alias": ["Alias is required", "Alias must contain only lowercase letters, numbers, and hyphens"]
  }
}
```

#### 409 Conflict - Duplicate Alias
```json
{
  "error": "Conflict",
  "message": "Squad alias already exists",
  "details": {
    "alias": "This alias is already taken"
  }
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

#### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Scrum Master role required"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to create squad"
}
```

## Implementation Notes

### Validation Rules
- **name**: `string().min(1).max(100).trim()`
- **alias**: `string().min(1).max(50).regex(/^[a-z0-9-]+$/).lowercase()`

### Database Operation
```sql
INSERT INTO "Squad" ("id", "name", "alias", "scrumMasterId", "createdAt", "updatedAt")
VALUES ($1, $2, $3, $4, NOW(), NOW())
ON CONFLICT ("alias") DO NOTHING
RETURNING *
```

### Uniqueness Constraint
- Database unique constraint on `alias` field
- Returns conflict error if alias already exists
- Case-sensitive uniqueness (enforced by regex validation)

### Security
- User authentication verified
- User role validated as Scrum Master
- `scrumMasterId` auto-populated from authenticated user
- No privilege escalation possible

### Performance
- Single INSERT operation
- Unique constraint check at database level
- No complex joins or aggregations