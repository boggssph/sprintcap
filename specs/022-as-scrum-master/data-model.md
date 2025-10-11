# Data Model: Squad Management Updates

**Feature**: Squad Management Updates
**Date**: October 11, 2025

## Overview

This feature extends the existing Squad entity with ceremony time defaults and updates validation rules for squad names and aliases.

## Entity: Squad

### Current Schema
```prisma
model Squad {
  id                String   @id @default(cuid())
  name              String
  alias             String?
  organizationId    String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  organization      Organization @relation(fields: [organizationId], references: [id])
  members           UserSquad[]
  sprints           Sprint[]

  @@unique([name, organizationId]) // Name unique per organization
  @@unique([alias]) // Alias unique globally (per squad)
}
```

### Updated Schema
```prisma
model Squad {
  id                String   @id @default(cuid())
  name              String
  alias             String?

  // Ceremony defaults (in minutes/hours as specified)
  dailyScrumMinutes     Int     @default(15)    // Default: 15 minutes
  refinementHours       Float   @default(1.0)   // Default: 1 hour per week
  reviewDemoMinutes     Int     @default(30)    // Default: 30 minutes per sprint
  planningHours         Float   @default(1.0)   // Default: 1 hour per week
  retrospectiveMinutes  Int     @default(30)    // Default: 30 minutes per week

  organizationId    String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  organization      Organization @relation(fields: [organizationId], references: [id])
  members           UserSquad[]
  sprints           Sprint[]

  @@unique([name, organizationId]) // Name unique per organization
  @@unique([alias]) // Alias unique globally (per squad)
}
```

### Field Details

#### Existing Fields
- `id`: CUID primary key
- `name`: Squad name (unique per organization)
- `alias`: Squad alias (unique globally, optional)
- `organizationId`: Foreign key to Organization
- `createdAt`/`updatedAt`: Audit timestamps

#### New Ceremony Default Fields
- `dailyScrumMinutes`: Default minutes for daily scrum (default: 15)
- `refinementHours`: Default hours per week for team refinement (default: 1.0)
- `reviewDemoMinutes`: Default minutes for review/demo per sprint (default: 30)
- `planningHours`: Default hours per week for sprint planning (default: 1.0)
- `retrospectiveMinutes`: Default minutes per week for retrospective (default: 30)

### Validation Rules

#### Squad Identity
- **Name**: Required, unique within organization, no format restrictions
- **Alias**: Optional, unique across all squads, no format restrictions

#### Ceremony Times
- **All time fields**: Must be positive numbers (> 0)
- **Integer fields**: `dailyScrumMinutes`, `reviewDemoMinutes`, `retrospectiveMinutes`
- **Float fields**: `refinementHours`, `planningHours` (support decimals like 0.5)
- **No upper limits**: Values can be arbitrarily large

### Relationships

#### Unchanged Relationships
- `organization`: Many-to-one with Organization
- `members`: One-to-many with UserSquad (squad membership)
- `sprints`: One-to-many with Sprint (sprints owned by squad)

#### Impact on Existing Sprints
- Ceremony defaults only apply to **new sprints**
- Existing sprints retain their original ceremony allocations
- No retroactive changes to historical data

## Calculation Logic

### Ceremony Time Calculations

The ceremony defaults are used to calculate total time allocations for new sprints:

```typescript
interface SprintDuration {
  weeks: number;        // Total weeks in sprint (e.g., 2.5 for partial weeks)
  workingDays: number;  // Working days in sprint (Mon-Fri only)
}

interface CeremonyTotals {
  dailyScrum: number;     // minutes
  refinement: number;     // minutes
  reviewDemo: number;     // minutes
  planning: number;       // minutes
  retrospective: number;  // minutes
}

function calculateCeremonyTimes(
  defaults: SquadDefaults,
  duration: SprintDuration
): CeremonyTotals {
  return {
    dailyScrum: defaults.dailyScrumMinutes * duration.workingDays,
    refinement: defaults.refinementHours * 60 * duration.weeks,  // Convert hours to minutes
    reviewDemo: defaults.reviewDemoMinutes,  // Fixed per sprint
    planning: defaults.planningHours * 60 * duration.weeks,
    retrospective: defaults.retrospectiveMinutes * duration.weeks
  };
}
```

### Working Days Calculation

Working days are calculated as Monday-Friday within the sprint period:
- Exclude weekends (Saturday, Sunday)
- Support partial weeks (e.g., 2.5 weeks = 12.5 working days)

## Migration Strategy

### Database Migration
```sql
-- Add new ceremony default columns with defaults
ALTER TABLE "Squad" ADD COLUMN "dailyScrumMinutes" INTEGER DEFAULT 15;
ALTER TABLE "Squad" ADD COLUMN "refinementHours" REAL DEFAULT 1.0;
ALTER TABLE "Squad" ADD COLUMN "reviewDemoMinutes" INTEGER DEFAULT 30;
ALTER TABLE "Squad" ADD COLUMN "planningHours" REAL DEFAULT 1.0;
ALTER TABLE "Squad" ADD COLUMN "retrospectiveMinutes" INTEGER DEFAULT 30;
```

### Backward Compatibility
- Existing squads automatically get default values
- No breaking changes to existing API contracts
- Existing sprints unaffected

## Data Integrity

### Constraints
- Database-level CHECK constraints for positive values
- Unique constraints maintained for name/alias
- Foreign key constraints preserved

### Validation Layers
1. **Database**: CHECK constraints, unique indexes
2. **Application**: Zod schemas for API validation
3. **UI**: Form validation with error messages

## Future Considerations

### Extensibility
- Ceremony types could be made configurable per organization
- Additional ceremony types could be added
- Time units could be made configurable (minutes vs hours)

### Performance
- Ceremony calculations are lightweight and client-side
- Database queries remain efficient with existing indexes
- No impact on existing sprint queries