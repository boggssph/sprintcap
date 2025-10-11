# API Contracts: Capacity Plan Tab

**Feature**: 021-as-scrum-master
**Date**: 2025-10-10

## Overview
RESTful API endpoints for capacity planning functionality.

## Authentication
All endpoints require authentication via NextAuth session.
User must be a Scrum Master of the relevant squad(s).

## Endpoints

### GET /api/capacity-plan/active-sprints
Get all active sprints for the authenticated Scrum Master.

**Authorization**: User must be Scrum Master of at least one squad.

**Response**:
```json
{
  "sprints": [
    {
      "id": "string",
      "name": "string",
      "startDate": "2025-01-01T00:00:00Z",
      "endDate": "2025-01-15T00:00:00Z",
      "squadId": "string",
      "squadName": "string",
      "ticketCount": 5
    }
  ]
}
```

**Error Responses**:
- 401: Unauthorized
- 403: Not a Scrum Master

### POST /api/capacity-plan/[sprintId]/activate
Mark a sprint as active (or inactive).

**Authorization**: User must be Scrum Master of the sprint's squad.

**Request Body**:
```json
{
  "isActive": true
}
```

**Response**: 200 OK

**Error Responses**:
- 401: Unauthorized
- 403: Forbidden (not Scrum Master of squad)
- 404: Sprint not found

### GET /api/capacity-plan/[sprintId]/tickets
Get all tickets for a specific sprint.

**Authorization**: User must be Scrum Master of the sprint's squad.

**Response**:
```json
{
  "tickets": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "status": "To Do",
      "assignee": "user@example.com",
      "jiraKey": "PROJ-123"
    }
  ]
}
```

### POST /api/capacity-plan/[sprintId]/tickets
Create a new ticket in the sprint.

**Authorization**: User must be Scrum Master of the sprint's squad.

**Request Body**:
```json
{
  "title": "Implement login feature",
  "description": "Add OAuth login with Google",
  "status": "To Do",
  "assignee": "developer@example.com"
}
```

**Response**:
```json
{
  "ticket": {
    "id": "string",
    "jiraKey": "PROJ-124"
  }
}
```

### PUT /api/capacity-plan/[sprintId]/tickets/[ticketId]
Update an existing ticket.

**Authorization**: User must be Scrum Master of the sprint's squad.

**Request Body**: Same as POST, partial updates allowed.

**Response**: 200 OK with updated ticket data.

### DELETE /api/capacity-plan/[sprintId]/tickets/[ticketId]
Delete a ticket.

**Authorization**: User must be Scrum Master of the sprint's squad.

**Response**: 204 No Content

## Common Error Responses
- 400: Bad Request (validation errors)
- 500: Internal Server Error

## Rate Limiting
- 100 requests per minute per user
- Applies to all endpoints