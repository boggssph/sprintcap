# Data Model: Stack Squad Cards Vertically with Member List

## Existing Data Model (No Changes Required)

### Squad Entity
**Source**: Already implemented in Neon PostgreSQL database
**Fields**:
- `id`: Unique identifier
- `name`: Squad name (string)
- `alias`: Squad alias/short name (string)
- `createdAt`: Creation timestamp
- `scrumMasterId`: Reference to Scrum Master user

### Squad Member Entity
**Source**: Already implemented in Neon PostgreSQL database
**Fields**:
- `id`: Unique identifier
- `squadId`: Reference to squad
- `userId`: Reference to user
- `joinedAt`: Join date timestamp
- `user`: Relationship to User entity (name, email, etc.)

### User Entity
**Source**: Existing NextAuth user model
**Fields**:
- `id`: Unique identifier
- `name`: Display name
- `email`: Email address

## Data Access Patterns

### Squad Retrieval
- **API**: `GET /api/squads` (existing)
- **Response**: Array of squads with member counts
- **Usage**: Populates squad list in dashboard

### Squad Details with Members
- **API**: `GET /api/squads` with member expansion (existing)
- **Response**: Squads with full member details including join dates
- **Usage**: Displays member list within each card

## Validation Rules

### Squad Constraints
- Maximum 25 members per squad (enforced in UI and API)
- Squad name: 1-100 characters, required
- Squad alias: 1-50 characters, unique, required

### Member Constraints
- Join date automatically set on membership creation
- Members can only be added by Scrum Master
- No duplicate members in same squad

## UI Data Requirements

### Card Display Data
- Squad name and alias (header)
- Member count (summary)
- Creation date (existing field)
- Member list with names and join dates (new)

### Member List Format
- Member name (from User entity)
- Join date formatted as readable date string
- Displayed in chronological order (oldest first)
- Scrollable container when list exceeds card height</content>
<parameter name="filePath">/Users/fseguerra/Projects/sprintCap/specs/015-stack-the-squad/data-model.md