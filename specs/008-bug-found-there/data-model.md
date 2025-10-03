# Data Model: Squad Member Display

## Overview
This feature enhances the sprint creation form to properly filter and display members based on the selected squad. The data model leverages existing Squad and Member entities with a clarified one-to-many relationship.

## Entity Definitions

### Squad Entity
```typescript
interface Squad {
  id: string;           // Primary key
  name: string;         // Display name (e.g., "Frontend Team")
  alias: string;        // Short code (e.g., "FE")
  memberCount: number;  // Computed field for dropdown display
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules:**
- `name`: Required, 1-100 characters
- `alias`: Required, 1-10 characters, unique
- `memberCount`: Computed from active members

### Member Entity
```typescript
interface Member {
  id: string;           // Primary key
  email: string;        // Unique identifier across system
  name: string;         // Display name
  isActive: boolean;    // Active status filter
  squadId: string;      // Foreign key to Squad
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules:**
- `email`: Required, valid email format, unique across system
- `name`: Required, 1-100 characters
- `isActive`: Boolean, defaults to true
- `squadId`: Required, references valid Squad

## Relationships

### One-to-Many: Squad → Members
- **Cardinality**: One squad can have multiple members
- **Ownership**: Squad owns its members
- **Cascading**: Deleting a squad should handle member reassignment
- **Query Pattern**: `squad.members.where(active: true)`

## Data Flow

### Squad Selection
1. User selects squad from dropdown
2. Frontend fetches members for selected squad
3. Members displayed in filtered list
4. Form validation ensures squad-member consistency

### State Transitions

#### Member Status
- **Active → Inactive**: Member hidden from squad lists
- **Inactive → Active**: Member appears in squad lists
- **Squad Change**: Member moves between squads (future feature)

#### Squad Changes
- **Member Added**: squad.memberCount increases
- **Member Removed**: squad.memberCount decreases
- **Squad Deleted**: Members need reassignment strategy

## Query Patterns

### Get Squad Members (API)
```sql
SELECT id, email, name
FROM members
WHERE squad_id = ? AND is_active = true
ORDER BY name ASC
```

### Get Squad with Member Count (Dropdown)
```sql
SELECT s.id, s.name, s.alias,
       COUNT(m.id) as member_count
FROM squads s
LEFT JOIN members m ON s.id = m.squad_id AND m.is_active = true
GROUP BY s.id, s.name, s.alias
ORDER BY s.name ASC
```

## Performance Considerations

### Indexes Required
- `members.squad_id` (for filtering)
- `members.is_active` (for filtering)
- `members.email` (for uniqueness)
- Composite: `(squad_id, is_active)` for member queries

### Caching Strategy
- **Squad List**: Cache for 5 minutes (infrequent changes)
- **Squad Members**: Cache per squad for 2 minutes (moderate changes)
- **Invalidation**: On member status changes

### Scale Limits
- **Max Members per Squad**: 100 (performance target)
- **Max Total Members**: 1000 (system scale)
- **Query Timeout**: 2 seconds (UX requirement)

## Error Scenarios

### Data Consistency Issues
- **Orphaned Members**: squadId references invalid squad
- **Count Mismatch**: memberCount doesn't match actual active members
- **Duplicate Emails**: Email uniqueness constraint violation

### Recovery Strategies
- **Validation**: API endpoints validate data consistency
- **Repair**: Background job to fix count mismatches
- **Fallback**: Graceful degradation for consistency errors

## Migration Notes

### Existing Data
- All existing members assumed active (isActive = true)
- Squad member counts need recalculation
- No breaking changes to existing API consumers

### Future Extensions
- Member roles within squads
- Member transfer between squads
- Squad hierarchies (nested squads)