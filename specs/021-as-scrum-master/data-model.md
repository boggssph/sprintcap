# Data Model: Capacity Plan Tab

**Feature**: 021-as-scrum-master
**Date**: 2025-10-10

## Overview
This feature extends the existing Sprint and Squad models to support capacity planning with Jira ticket management.

## Schema Changes

### Sprint Model Extensions
```prisma
model Sprint {
  // ... existing fields ...
  isActive Boolean @default(false)  // NEW: Determines if sprint appears in capacity plans
  tickets   Ticket[]               // NEW: One-to-many relationship with tickets
}
```

### New Ticket Model
```prisma
model Ticket {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      String   // e.g., "To Do", "In Progress", "Done"
  assignee    String?  // User name or email
  jiraKey     String?  // JIRA-123 format
  sprintId    String
  sprint      Sprint   @relation(fields: [sprintId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([sprintId])
  @@map("tickets")
}
```

## Relationships
- **Sprint → Tickets**: One-to-many (cascade delete)
- **Squad → Sprints**: Existing relationship (squad membership determines access)
- **User → Squads**: Existing Scrum Master role relationship

## Migration Strategy
1. Add `isActive` column to Sprint table with default `false`
2. Create new `Ticket` table
3. Add foreign key constraint from Ticket to Sprint
4. Update application code to handle new fields

## Data Integrity
- Only Scrum Masters of a squad can modify sprints/tickets for that squad
- Active sprints are filtered by `isActive = true`
- Tickets are scoped to their sprint (no cross-sprint tickets)

## Performance Considerations
- Index on `sprintId` for efficient ticket queries
- Consider compound indexes if filtering by status/assignee becomes common
- Monitor query performance for capacity plan loading (multiple sprints per user)