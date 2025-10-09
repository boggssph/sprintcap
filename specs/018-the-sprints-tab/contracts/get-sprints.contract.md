# API Contract: GET /api/sprints

**Purpose**: Retrieve sprints for all squads managed by the authenticated Scrum Master

**Method**: GET
**Path**: /api/sprints
**Authentication**: Required (NextAuth session)

**Request**:
- Headers:
  - Authorization: Bearer token (handled by NextAuth)
- Query Parameters: None
- Body: None

**Response** (200 OK):
```json
{
  "sprints": [
    {
      "id": "string",
      "name": "string",
      "startDate": "2025-10-09T00:00:00.000Z",
      "endDate": "2025-10-23T23:59:59.999Z",
      "squadId": "string",
      "squadName": "string",
      "isActive": true
    }
  ]
}
```

**Response** (401 Unauthorized):
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**Business Logic**:
- Filter sprints by squads where user is Scrum Master
- Include only last 3 sprints per squad
- Mark active sprint (current date within start/end dates)
- Sort: active sprint first, then by start date ascending
- Include squad name for display

**Error Cases**:
- 401: Not authenticated
- 500: Database error