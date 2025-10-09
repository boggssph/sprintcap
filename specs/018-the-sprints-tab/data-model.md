# Data Model: Sprints Tab Display

## Sprint Entity

**Purpose**: Represents a time-boxed development period associated with a squad

**Fields**:
- `id`: String (UUID, Primary Key)
- `name`: String (Required, 1-100 characters)
- `startDate`: DateTime (Required)
- `endDate`: DateTime (Required)
- `squadId`: String (Foreign Key to Squad.id, Required)
- `createdAt`: DateTime (Auto-generated)
- `updatedAt`: DateTime (Auto-generated)

**Validation Rules**:
- `name`: Non-empty, trimmed, max 100 characters
- `startDate`: Must be before `endDate`
- `endDate`: Must be after `startDate`
- `squadId`: Must reference existing squad

**Relationships**:
- Belongs to: Squad (many-to-one)
- Squad can have multiple sprints

**Business Rules**:
- Active sprint: Current date falls between startDate and endDate (inclusive)
- Display order: Active sprint first, then by startDate ascending
- Maximum 3 sprints displayed per squad (most recent)

## Squad Entity (Existing)

**Extension Notes**:
- No changes required to existing Squad model
- Sprint queries will filter by squadId and user permissions

## Data Access Patterns

**Sprint Queries**:
- Get sprints by squad ID with permission check
- Order by: active status (active first), then start_date ascending
- Limit to 3 most recent sprints

**Sprint Creation**:
- Validate squad ownership (Scrum Master only)
- Check for overlapping date ranges (optional - not required for MVP)
- Auto-assign to authenticated user's squad

**Permission Model**:
- Only Scrum Masters can view/create sprints
- Sprints are scoped to squad membership
- Empty state when user manages no squads