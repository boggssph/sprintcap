# Data Model: Sprint Creation for Squads

## Overview
This document defines the data entities, relationships, and validation rules required to support sprint creation functionality.

## Entity Definitions

### Sprint Entity
Represents a time-boxed work period for a squad.

**Fields:**
- `id`: String (UUID, Primary Key)
- `name`: String (Required, 1-100 characters)
- `startDate`: DateTime (Required, must be in future for new sprints)
- `endDate`: DateTime (Required, must be after startDate)
- `squadId`: String (Foreign Key to Squad, Required)
- `createdAt`: DateTime (Auto-generated)
- `updatedAt`: DateTime (Auto-generated on updates)

**Validation Rules:**
- Name: Required, non-empty, max 100 characters
- Start Date: Required, must be valid datetime
- End Date: Required, must be after start date, reasonable duration (1-12 weeks)
- Squad ID: Must reference existing squad owned by current Scrum Master

**Relationships:**
- Belongs to Squad (many-to-one)
- Has many SprintMembers (one-to-many)

**Indexes:**
- Primary: id
- Foreign: squadId
- Performance: (squadId, startDate) for overlap queries
- Performance: (squadId, endDate) for overlap queries

### SprintMember Entity
Junction table representing the many-to-many relationship between sprints and users.

**Fields:**
- `id`: String (UUID, Primary Key)
- `sprintId`: String (Foreign Key to Sprint, Required)
- `userId`: String (Foreign Key to User, Required)
- `createdAt`: DateTime (Auto-generated)

**Validation Rules:**
- Sprint ID: Must reference existing sprint
- User ID: Must reference existing user who is active member of sprint's squad
- Unique constraint: (sprintId, userId) - user can only be in sprint once

**Relationships:**
- Belongs to Sprint (many-to-one)
- Belongs to User (many-to-one)

**Indexes:**
- Primary: id
- Foreign: sprintId, userId
- Unique: (sprintId, userId)
- Performance: sprintId for member queries

## Business Rules

### Sprint Creation Rules
1. **Ownership**: Only Scrum Masters can create sprints for squads they own
2. **Date Validation**:
   - Start date must be in the future (or present for immediate starts)
   - End date must be after start date
   - Sprint duration should be reasonable (1-12 weeks recommended)
3. **Overlap Prevention**: No overlapping sprints allowed for the same squad
4. **Member Population**: All active squad members automatically added to new sprints

### Sprint Membership Rules
1. **Auto-Population**: Sprint members default to all active squad members at creation time
2. **Active Members Only**: Only users with active status in the squad are included
3. **Immutable Membership**: Sprint membership is fixed at creation time (future features may allow adjustments)

## Schema Extensions

### Prisma Schema Additions
```prisma
model Sprint {
  id        String   @id @default(uuid())
  name      String
  startDate DateTime
  endDate   DateTime
  squadId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  squad     Squad         @relation(fields: [squadId], references: [id])
  members   SprintMember[]

  @@unique([squadId, name]) // Prevent duplicate sprint names within squad
}

model SprintMember {
  id        String   @id @default(uuid())
  sprintId  String
  userId    String
  createdAt DateTime @default(now())

  sprint    Sprint @relation(fields: [sprintId], references: [id])
  user      User   @relation(fields: [userId], references: [id])

  @@unique([sprintId, userId]) // User can only be in sprint once
}

// Update Squad model to include sprints relationship
model Squad {
  // ... existing fields ...
  sprints   Sprint[]
}

// Update User model to include sprintMembers relationship
model User {
  // ... existing fields ...
  sprintMembers SprintMember[]
}
```

## Data Flow

### Sprint Creation Process
1. **Validation Phase**:
   - Verify user is Scrum Master for the selected squad
   - Validate sprint name, dates, and squad ownership
   - Check for date overlaps with existing sprints

2. **Creation Phase**:
   - Create Sprint record
   - Query active squad members
   - Create SprintMember records for each active member

3. **Confirmation Phase**:
   - Return sprint details with member count
   - Log creation event for audit trail

### Query Patterns

#### Get Sprints for Squad
```sql
SELECT * FROM Sprint WHERE squadId = ? ORDER BY startDate DESC
```

#### Get Sprint with Members
```sql
SELECT s.*, u.name, u.email
FROM Sprint s
JOIN SprintMember sm ON s.id = sm.sprintId
JOIN User u ON sm.userId = u.id
WHERE s.id = ?
```

#### Check for Overlapping Sprints
```sql
SELECT COUNT(*) as overlap_count
FROM Sprint
WHERE squadId = ?
  AND (
    (startDate <= ? AND endDate > ?) OR  -- New sprint starts during existing
    (startDate < ? AND endDate >= ?) OR  -- New sprint ends during existing
    (startDate >= ? AND endDate <= ?)    -- New sprint encompasses existing
  )
```

## Migration Strategy

### Database Migration
1. Create Sprint table with indexes
2. Create SprintMember table with constraints
3. Add foreign key relationships
4. Add unique constraints
5. Update existing Squad and User models

### Data Migration
- No existing data to migrate (new feature)
- Ensure referential integrity with existing Squad and User data

## Performance Considerations

### Indexes for Common Queries
- Sprint lookups by squad: (squadId, startDate)
- Member lookups by sprint: sprintId
- Overlap checks: (squadId, startDate, endDate)

### Query Optimization
- Use database indexes for range queries on dates
- Consider read replicas for reporting queries
- Implement pagination for large result sets

## Security Considerations

### Access Control
- Sprint creation: Scrum Master role required
- Sprint viewing: Squad membership required
- Sprint modification: Scrum Master ownership required

### Data Validation
- Input sanitization for all text fields
- Date range validation to prevent abuse
- Foreign key constraints prevent orphaned records

## Testing Data Strategy

### Test Data Creation
- Create test squads with known member counts
- Generate sprints with various date ranges
- Include edge cases: empty squads, single members, large squads

### Validation Test Cases
- Overlap detection accuracy
- Member population correctness
- Permission enforcement
- Data integrity constraints