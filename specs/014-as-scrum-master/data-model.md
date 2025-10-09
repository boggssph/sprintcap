# Data Model: Squads Tab Redesign

**Feature**: 014-as-scrum-master
**Date**: October 9, 2025

## Existing Squad Entity

**Location**: `prisma/schema.prisma`

```prisma
model Squad {
  id          String   @id @default(cuid())
  name        String
  alias       String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  scrumMasterId String
  scrumMaster   User     @relation(fields: [scrumMasterId], references: [id])
  members       User[]   @relation("SquadMembers")

  // Indexes
  @@index([scrumMasterId])
  @@index([alias])
}
```

## Data Flow

### Read Operations
1. **Squad List**: `GET /api/squads`
   - Filters by `scrumMasterId` (current user)
   - Returns: `id`, `name`, `alias`, `memberCount`
   - Orders by: `createdAt DESC`

### Write Operations
1. **Create Squad**: `POST /api/squads`
   - Input: `name`, `alias`
   - Validation: `alias` uniqueness, required fields
   - Creates: New squad with current user as scrum master

## Validation Rules

### Squad Creation
- **name**: Required, 1-100 characters, trimmed
- **alias**: Required, 1-50 characters, lowercase, unique, alphanumeric + hyphens only
- **scrumMasterId**: Auto-populated from authenticated user

### Business Rules
- Squad alias must be unique across all squads (not just per scrum master)
- Scrum master can create unlimited squads
- Squad name can be changed after creation
- Squad alias cannot be changed after creation

## Computed Fields

### memberCount
```sql
SELECT COUNT(*) FROM "User" WHERE "squadId" = $1
```

**Usage**: Displayed in squad list to show team size

## Migration Considerations

**Status**: No schema changes required
- Existing `Squad` model supports all required fields
- Existing API contracts remain compatible
- No data migration needed

## Performance Considerations

### Indexes
- `@@index([scrumMasterId])`: Fast squad listing per scrum master
- `@@index([alias])`: Fast uniqueness validation
- Composite indexes not needed (simple queries)

### Query Optimization
- Squad list: Single query with JOIN to count members
- Create squad: Single INSERT with uniqueness constraint check
- No N+1 queries anticipated