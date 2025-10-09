# API Contract: POST /api/sprints

**Purpose**: Create a new sprint for a squad managed by the authenticated Scrum Master

**Method**: POST
**Path**: /api/sprints
**Authentication**: Required (NextAuth session)

**Request**:
- Headers:
  - Authorization: Bearer token (handled by NextAuth)
  - Content-Type: application/json
- Body:
```json
{
  "name": "Sprint 2025.10",
  "startDate": "2025-10-09T00:00:00.000Z",
  "endDate": "2025-10-23T23:59:59.999Z",
  "squadId": "uuid-of-squad"
}
```

**Request Validation**:
- `name`: Required, string, 1-100 characters
- `startDate`: Required, ISO date string, must be before endDate
- `endDate`: Required, ISO date string, must be after startDate
- `squadId`: Required, valid UUID of existing squad

**Response** (201 Created):
```json
{
  "sprint": {
    "id": "string",
    "name": "string",
    "startDate": "2025-10-09T00:00:00.000Z",
    "endDate": "2025-10-23T23:59:59.999Z",
    "squadId": "string",
    "createdAt": "2025-10-09T10:30:00.000Z",
    "updatedAt": "2025-10-09T10:30:00.000Z"
  }
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Validation failed",
  "details": {
    "name": "Name is required",
    "startDate": "Start date must be before end date"
  }
}
```

**Response** (403 Forbidden):
```json
{
  "error": "Forbidden",
  "message": "Only Scrum Masters can create sprints"
}
```

**Response** (404 Not Found):
```json
{
  "error": "Not Found",
  "message": "Squad not found or access denied"
}
```

**Business Logic**:
- Verify user is Scrum Master of the specified squad
- Validate date ranges (start before end)
- Create sprint record
- Return created sprint data

**Error Cases**:
- 400: Validation errors (invalid dates, missing fields)
- 401: Not authenticated
- 403: Not a Scrum Master or not owner of squad
- 404: Squad doesn't exist
- 409: Sprint name already exists in squad (optional)
- 500: Database error