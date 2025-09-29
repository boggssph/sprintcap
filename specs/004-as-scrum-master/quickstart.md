# Sprint Creation Quickstart Test Scenarios

## Overview
This document outlines the key test scenarios for validating the sprint creation functionality. These scenarios cover the core user journey and edge cases identified during specification and clarification.

## Test Environment Setup
- Database: PostgreSQL with Prisma schema
- Authentication: NextAuth.js with Scrum Master role
- API: Next.js API routes
- Testing: Vitest for unit tests, Playwright for E2E tests

## Core User Journey Tests

### TC-001: Happy Path Sprint Creation
**Objective:** Verify Scrum Master can create a sprint with valid data

**Preconditions:**
- User authenticated as Scrum Master
- Squad exists with active members
- No overlapping sprints for the squad

**Steps:**
1. Navigate to Scrum Master dashboard
2. Select squad from dropdown
3. Enter sprint name: "Sprint 2025.10"
4. Set start date: 2025-10-01 09:00:00
5. Set end date: 2025-10-15 17:00:00
6. Click "Create Sprint"

**Expected Results:**
- Sprint created successfully
- Success message displayed
- Sprint appears in sprint list
- All active squad members automatically added to sprint
- Sprint status shows as "upcoming"

### TC-002: Sprint with Empty Squad
**Objective:** Verify behavior when squad has no active members

**Preconditions:**
- User authenticated as Scrum Master
- Squad exists but has no active members

**Steps:**
1. Attempt to create sprint for empty squad
2. Enter valid sprint details
3. Submit form

**Expected Results:**
- Sprint created successfully
- Warning message: "Sprint created with no members. Add members to the squad first."
- Sprint appears in list with member count = 0

### TC-003: Overlapping Sprint Prevention
**Objective:** Verify system prevents overlapping sprints

**Preconditions:**
- Existing sprint: "Sprint 2025.09" (2025-09-16 to 2025-09-30)
- User attempts to create overlapping sprint

**Steps:**
1. Try to create sprint: 2025-09-20 to 2025-10-04
2. Submit form

**Expected Results:**
- Creation blocked
- Error message: "Sprint dates overlap with existing sprint 'Sprint 2025.09'"
- Form remains open for correction

## Edge Case Tests

### TC-004: End Date Before Start Date
**Objective:** Validate date range validation

**Steps:**
1. Enter start date: 2025-10-15 17:00:00
2. Enter end date: 2025-10-01 09:00:00
3. Submit form

**Expected Results:**
- Validation error: "End date must be after start date"
- Form submission blocked

### TC-005: Past Start Date
**Objective:** Allow creation of sprints starting in the past

**Steps:**
1. Enter start date: yesterday's date
2. Enter valid end date in future
3. Submit form

**Expected Results:**
- Sprint created successfully
- Status shows as "active" (since start date is past)

### TC-006: Very Short Sprint (1 day)
**Objective:** Allow minimum viable sprint duration

**Steps:**
1. Enter start: 2025-10-01 09:00:00
2. Enter end: 2025-10-01 17:00:00
3. Submit form

**Expected Results:**
- Sprint created successfully
- Duration validation allows same-day sprints

### TC-007: Very Long Sprint (6 months)
**Objective:** Allow extended sprint durations

**Steps:**
1. Enter start: 2025-10-01 09:00:00
2. Enter end: 2026-04-01 17:00:00
3. Submit form

**Expected Results:**
- Sprint created successfully
- No upper limit on sprint duration

## API Contract Tests

### TC-008: API Direct Creation
**Objective:** Test API endpoint directly

**Request:**
```http
POST /api/sprints
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "API Sprint",
  "squadId": "squad-uuid",
  "startDate": "2025-10-01T09:00:00Z",
  "endDate": "2025-10-15T17:00:00Z"
}
```

**Expected Response:**
```json
{
  "id": "sprint-uuid",
  "name": "API Sprint",
  "squadId": "squad-uuid",
  "squadName": "Test Squad",
  "startDate": "2025-10-01T09:00:00Z",
  "endDate": "2025-10-15T17:00:00Z",
  "memberCount": 3,
  "createdAt": "2025-09-26T10:00:00Z"
}
```

### TC-009: API List Sprints
**Objective:** Test sprint listing endpoint

**Request:**
```http
GET /api/sprints?squadId=squad-uuid&status=active
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "sprints": [
    {
      "id": "sprint-uuid",
      "name": "Active Sprint",
      "squadName": "Test Squad",
      "startDate": "2025-09-20T09:00:00Z",
      "endDate": "2025-10-04T17:00:00Z",
      "memberCount": 5,
      "status": "active"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

## Performance Tests

### TC-010: Large Squad Sprint Creation
**Objective:** Verify performance with large squads

**Preconditions:**
- Squad with 50+ active members

**Steps:**
1. Create sprint for large squad
2. Monitor creation time

**Expected Results:**
- Sprint created within 5 seconds
- All members added correctly
- No performance degradation

## Security Tests

### TC-011: Unauthorized Access
**Objective:** Verify proper authentication and authorization

**Steps:**
1. Attempt to create sprint without authentication
2. Attempt to create sprint as regular user (not Scrum Master)
3. Attempt to create sprint for squad owned by different Scrum Master

**Expected Results:**
- All attempts blocked with appropriate error codes
- 401 for unauthenticated, 403 for unauthorized

## Data Integrity Tests

### TC-012: Concurrent Sprint Creation
**Objective:** Verify race condition handling

**Steps:**
1. Two Scrum Masters attempt to create overlapping sprints simultaneously
2. Submit both requests at same time

**Expected Results:**
- Only one sprint created
- Second request fails with overlap error
- Data consistency maintained