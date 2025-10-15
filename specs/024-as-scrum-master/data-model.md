# Data Model: Scrum Master Member Hours Input Table

**Date**: October 14, 2025
**Feature**: 024-as-scrum-master

## Overview
The feature introduces member hours tracking with sprint isolation. Data model extends existing Member and Sprint entities with a new MemberHours entity.

## Entities

### Member (Existing)
- **Purpose**: Represents squad members
- **Fields**:
  - `id`: String (primary key)
  - `name`: String (display name)
  - `email`: String (unique)
  - `squadId`: String (foreign key to Squad)
- **Relationships**:
  - Belongs to Squad
  - Has many MemberHours
- **Validation**: Name required, email valid format

### Sprint (Existing)
- **Purpose**: Represents development sprints
- **Fields**:
  - `id`: String (primary key)
  - `name`: String (e.g., "Sprint 2025-10")
  - `startDate`: DateTime
  - `endDate`: DateTime
  - `squadId`: String (foreign key to Squad)
- **Relationships**:
  - Belongs to Squad
  - Has many MemberHours
- **Validation**: Dates valid range, name unique per squad

### MemberHours (New)
- **Purpose**: Stores hours allocated per member per sprint across categories
- **Fields**:
  - `id`: String (primary key)
  - `memberId`: String (foreign key to Member)
  - `sprintId`: String (foreign key to Sprint)
  - `supportIncidents`: Float (hours, default 0)
  - `prReview`: Float (hours, default 0)
  - `others`: Float (hours, default 0)
  - `createdAt`: DateTime
  - `updatedAt`: DateTime
- **Relationships**:
  - Belongs to Member
  - Belongs to Sprint
- **Validation**:
  - All hour fields >= 0
  - Composite unique constraint on (memberId, sprintId)
  - Float precision allows decimals (e.g., 2.5)
- **Business Rules**:
  - Isolated per sprint (no cross-sprint data sharing)
  - Auto-updated on cell blur
  - Preserved when member removed from squad

## Schema Changes
```prisma
model MemberHours {
  id               String   @id @default(cuid())
  memberId         String
  sprintId         String
  supportIncidents Float    @default(0)
  prReview         Float    @default(0)
  others           Float    @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)
  sprint Sprint @relation(fields: [sprintId], references: [id], onDelete: Cascade)

  @@unique([memberId, sprintId])
  @@map("member_hours")
}
```

## Data Flow
1. Load: Query MemberHours for current sprint's squad members
2. Create/Update: Upsert MemberHours records on cell blur
3. Delete: No explicit delete (preserved for history)
4. Validation: Client-side (numeric, >=0) + server-side (schema constraints)

## Migration Strategy
- Add MemberHours model to schema.prisma
- Generate Prisma migration
- Seed existing sprints with zero-hour records for current members
- Backward compatible (no breaking changes to existing data)