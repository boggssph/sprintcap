# Sprint Update API Contract

## PUT /api/sprints/[id]

Updates sprint details with validation.

### Request
```typescript
PUT /api/sprints/[id]
Authorization: Bearer {token}
Content-Type: application/json

{
  "startDate": "2025-01-15",        // Optional, ISO date string
  "endDate": "2025-01-29",          // Optional, ISO date string
  "status": "active",               // Optional, enum: planned|active|completed
  "ceremonyTimes": {                // Optional
    "dailyScrum": 15,               // Required if ceremonyTimes provided, number > 0
    "sprintPlanning": 120,          // Required if ceremonyTimes provided, number > 0
    "sprintReview": 60,             // Required if ceremonyTimes provided, number > 0
    "sprintRetrospective": 90       // Required if ceremonyTimes provided, number > 0
  }
}
```

### Successful Response (200)
```typescript
{
  "success": true,
  "data": {
    "id": "sprint-123",
    "name": "Sprint 1",
    "startDate": "2025-01-15T00:00:00.000Z",
    "endDate": "2025-01-29T00:00:00.000Z",
    "status": "active",
    "ceremonyTimes": {
      "dailyScrum": 15,
      "sprintPlanning": 120,
      "sprintReview": 60,
      "sprintRetrospective": 90
    },
    "squadId": "squad-456",
    "updatedAt": "2025-01-10T10:30:00.000Z"
  }
}
```

### Validation Error Response (400)
```typescript
{
  "success": false,
  "error": "ValidationError",
  "details": [
    {
      "field": "startDate",
      "message": "Start date cannot be in the past for active sprints"
    },
    {
      "field": "ceremonyTimes.dailyScrum",
      "message": "Ceremony time must be greater than 0"
    }
  ]
}
```

### Forbidden Error Response (403)
```typescript
{
  "success": false,
  "error": "ForbiddenError",
  "message": "Cannot modify completed sprints"
}
```

### Not Found Error Response (404)
```typescript
{
  "success": false,
  "error": "NotFoundError",
  "message": "Sprint not found"
}
```

### Business Rules
- Only Scrum Masters of the sprint's squad can update
- Completed sprints are immutable
- Active sprint dates cannot be set to past dates
- Ceremony times must be positive numbers
- Status transitions: planned → active → completed only