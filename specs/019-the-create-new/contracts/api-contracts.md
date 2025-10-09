# API Contracts: Update Create New Sprint Drawer

## Overview
This feature utilizes existing API endpoints and does not introduce new contracts. The following contracts document the existing endpoints used for squad and sprint management.

## Existing Contracts

### GET /api/squads
**Purpose**: Retrieve all squads assigned to the authenticated Scrum Master

**Request**:
```
GET /api/squads
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "squads": [
    {
      "id": "string",
      "name": "string",
      "scrumMasterId": "string",
      "createdAt": "2025-10-09T10:00:00Z",
      "updatedAt": "2025-10-09T10:00:00Z"
    }
  ]
}
```

**Error Responses**:
- 401 Unauthorized: Invalid or missing authentication
- 500 Internal Server Error: Database or server error

### POST /api/sprints
**Purpose**: Create a new sprint

**Request**:
```
POST /api/sprints
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "startDate": "2025-10-09T10:00:00Z",
  "endDate": "2025-10-16T10:00:00Z",
  "squadId": "string"
}
```

**Response** (201 Created):
```json
{
  "sprint": {
    "id": "string",
    "name": "string",
    "startDate": "2025-10-09T10:00:00Z",
    "endDate": "2025-10-16T10:00:00Z",
    "squadId": "string",
    "isActive": false,
    "createdAt": "2025-10-09T10:00:00Z",
    "updatedAt": "2025-10-09T10:00:00Z"
  }
}
```

**Error Responses**:
- 400 Bad Request: Invalid input data or validation error
- 401 Unauthorized: Invalid or missing authentication
- 403 Forbidden: User not authorized to create sprints for the specified squad
- 409 Conflict: Sprint name already exists for this squad
- 500 Internal Server Error: Database or server error

### GET /api/sprints
**Purpose**: Retrieve all sprints for squads assigned to the authenticated Scrum Master

**Request**:
```
GET /api/sprints
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "sprints": [
    {
      "id": "string",
      "name": "string",
      "startDate": "2025-10-09T10:00:00Z",
      "endDate": "2025-10-16T10:00:00Z",
      "squadId": "string",
      "squadName": "string",
      "isActive": false
    }
  ]
}
```

**Error Responses**:
- 401 Unauthorized: Invalid or missing authentication
- 500 Internal Server Error: Database or server error

## Contract Test Requirements

### Squads API Tests
- Verify 200 response with proper squad array structure
- Verify 401 response for unauthenticated requests
- Verify squad ownership (only assigned squads returned)
- Verify proper error handling for database failures

### Sprints POST API Tests
- Verify 201 response with created sprint data
- Verify 400 response for invalid input data
- Verify 401 response for unauthenticated requests
- Verify 403 response for unauthorized squad access
- Verify 409 response for duplicate sprint names
- Verify proper date validation (end after start)

### Sprints GET API Tests
- Verify 200 response with proper sprint array structure
- Verify 401 response for unauthenticated requests
- Verify only sprints from assigned squads are returned
- Verify proper squad name inclusion
- Verify proper error handling for database failures

## No New Contracts Required
This feature operates entirely within existing API contracts. All required functionality is available through the documented endpoints above.