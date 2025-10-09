# Data Model: Update Create New Sprint Drawer

## Overview
This feature does not introduce new data entities or modify existing database schema. It operates on existing Sprint and Squad entities with established relationships.

## Existing Entities

### Sprint Entity
- **Purpose**: Represents a time-boxed period for completing work
- **Key Fields**:
  - `id`: Unique identifier (String)
  - `name`: Sprint name (String)
  - `startDate`: Sprint start date (DateTime)
  - `endDate`: Sprint end date (DateTime)
  - `squadId`: Reference to associated squad (String)
  - `isActive`: Whether sprint is currently active (Boolean)
  - `createdAt`: Creation timestamp (DateTime)
  - `updatedAt`: Last update timestamp (DateTime)

### Squad Entity
- **Purpose**: Represents a team of members working together
- **Key Fields**:
  - `id`: Unique identifier (String)
  - `name`: Squad name (String)
  - `scrumMasterId`: Reference to Scrum Master user (String)
  - `createdAt`: Creation timestamp (DateTime)
  - `updatedAt`: Last update timestamp (DateTime)

### User Entity (Referenced)
- **Purpose**: Represents system users including Scrum Masters
- **Key Fields**:
  - `id`: Unique identifier (String)
  - `name`: Display name (String)
  - `email`: User email (String)
  - `role`: User role (SCRUM_MASTER, MEMBER, ADMIN)

## Relationships
- **Sprint → Squad**: Many-to-one (sprints belong to squads)
- **Squad → User**: Many-to-one (squads belong to Scrum Masters)
- **Squad → User**: One-to-many (squads have multiple members via separate relationship table)

## Validation Rules
- **Sprint Creation**: Squad must exist and be assigned to the authenticated Scrum Master
- **Date Validation**: End date must be after start date
- **Name Validation**: Sprint name must be non-empty and unique within the squad
- **Squad Assignment**: Only squads assigned to the Scrum Master can be selected

## State Transitions
- **Sprint Lifecycle**: Created → Active → Completed
- **Active Sprint**: Only one sprint can be active per squad at a time

## Data Access Patterns
- **Scrum Master View**: Retrieve all sprints for all assigned squads
- **Squad Selection**: List all squads assigned to authenticated Scrum Master
- **Sprint Creation**: Validate squad ownership before creation

## No Schema Changes Required
This feature operates entirely within the existing data model. All required entities, relationships, and validation rules are already established in the current schema.