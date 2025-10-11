# Data Model: Add Jira Tickets to Sprints

**Date**: October 10, 2025
**Feature**: 020-as-scrum-master

## Overview

This feature extends the existing Sprint Management system to include Jira ticket tracking. Tickets are manually entered by Scrum Masters and associated with active or future sprints.

## Entity Definitions

### Ticket Entity

**Purpose**: Represents a manually entered Jira work item associated with a sprint

**Fields**:
- `id`: String (UUID, Primary Key)
- `jiraId`: String (Free text, manually entered reference)
- `hours`: Float (Numeric, minimum value 0)
- `workType`: Enum (`BACKEND`, `FRONTEND`, `TESTING`)
- `parentType`: Enum (`BUG`, `STORY`, `TASK`)
- `plannedUnplanned`: Enum (`PLANNED`, `UNPLANNED`)
- `memberId`: String? (Optional, references User.id for assignment)
- `sprintId`: String (Foreign Key to Sprint.id)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships**:
- Belongs to: Sprint (many-to-one)
- Belongs to: User (many-to-one, optional for member assignment)

**Validation Rules**:
- `jiraId`: Required, free text format
- `hours`: Required, numeric ≥ 0
- `workType`: Required, one of: BACKEND, FRONTEND, TESTING
- `parentType`: Required, one of: BUG, STORY, TASK
- `plannedUnplanned`: Required, one of: PLANNED, UNPLANNED
- `sprintId`: Required, must reference existing sprint
- `memberId`: Optional, must reference existing user in the same squad

**Business Rules**:
- Duplicate `jiraId` values are allowed across different sprints
- Duplicate `jiraId` values are NOT allowed within the same sprint
- Only Scrum Masters can create tickets for sprints in their squads
- Tickets can only be added to active or future sprints (not completed sprints)

### Extended Sprint Entity

**Existing Fields**: (unchanged)
- `id`, `name`, `startDate`, `endDate`, `squadId`, etc.

**New Relationships**:
- Has many: Tickets (one-to-many)

### Extended User Entity

**Existing Fields**: (unchanged)
- `id`, `name`, `email`, `role`, etc.

**New Relationships**:
- Has many: Tickets (one-to-many, for member assignments)

## Database Schema Changes

```sql
-- Add Ticket table
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jiraId" TEXT NOT NULL,
    "hours" REAL NOT NULL CHECK ("hours" >= 0),
    "workType" TEXT NOT NULL CHECK ("workType" IN ('BACKEND', 'FRONTEND', 'TESTING')),
    "parentType" TEXT NOT NULL CHECK ("parentType" IN ('BUG', 'STORY', 'TASK')),
    "plannedUnplanned" TEXT NOT NULL CHECK ("plannedUnplanned" IN ('PLANNED', 'UNPLANNED')),
    "memberId" TEXT,
    "sprintId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("memberId") REFERENCES "User" ("id") ON DELETE SET NULL,
    FOREIGN KEY ("sprintId") REFERENCES "Sprint" ("id") ON DELETE CASCADE
);

-- Add unique constraint for jiraId within same sprint
CREATE UNIQUE INDEX "Ticket_sprintId_jiraId_key" ON "Ticket"("sprintId", "jiraId");
```

## Migration Strategy

1. **Schema Migration**: Add Ticket table with constraints
2. **Data Migration**: None required (new feature)
3. **Rollback Plan**: Drop Ticket table if needed

## Security Considerations

- Row Level Security (RLS) policies to ensure Scrum Masters can only access tickets for their squads
- Input validation on all fields to prevent injection attacks
- Audit logging for ticket creation/modification