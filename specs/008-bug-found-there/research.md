# Research: Squad Member Display Bug Fix

## Current State Analysis

### Existing Implementation
- **SprintCreationForm.tsx**: React component handling squad selection and sprint creation
- **Squad Selection**: Uses shadcn/ui Select component to display squads with member counts
- **Member Display**: Currently shows all members regardless of selected squad (the bug)
- **Data Flow**: Squads fetched via API, but member filtering not implemented

### Database Schema (from Prisma)
- **Squad Model**: id, name, alias, createdAt, updatedAt
- **Member Model**: id, email, name, isActive, squadId, createdAt, updatedAt
- **Relationship**: One-to-many (Squad has many Members)

### API Endpoints
- **GET /api/squads**: Returns list of squads with member counts
- **POST /api/sprints**: Creates sprints (existing functionality)

## Research Findings

### Decision: API Endpoint Design
**Chosen**: Create new `GET /api/squads/[id]/members` endpoint
**Rationale**: Clean separation of concerns, allows for future squad-specific member operations
**Alternatives Considered**:
- Extend existing `/api/squads` to include member details (rejected: would bloat response)
- Client-side filtering (rejected: exposes all member data unnecessarily)

### Decision: Loading States
**Chosen**: Show loading spinner in Members section during data fetch
**Rationale**: Provides immediate feedback, prevents confusion during squad switching
**Alternatives Considered**:
- Skeleton loading (too complex for simple list)
- Disable squad selection during load (poor UX for rapid switching)

### Decision: Error Handling
**Chosen**: Show error message with retry button
**Rationale**: Allows recovery from network failures without losing form state
**Alternatives Considered**:
- Silent failure with fallback to empty state (hides problems)
- Modal error dialogs (disrupts workflow)

### Decision: Performance Optimization
**Chosen**: Cache member data per squad with 5-minute TTL
**Rationale**: Reduces API calls for frequently accessed squads, handles >10 members gracefully
**Alternatives Considered**:
- No caching (unnecessary API load)
- Full client-side caching (complex state management)

### Decision: Member Display Format
**Chosen**: Simple list with name and email
**Rationale**: Matches existing UI patterns, provides essential information
**Alternatives Considered**:
- Avatar + name only (insufficient for identification)
- Complex cards (overkill for member selection)

## Technical Approach

### Frontend Changes
1. **SprintCreationForm.tsx**: Add state management for selected squad and member loading
2. **Member Display Component**: Create filtered member list with loading/error states
3. **API Integration**: Fetch members when squad is selected

### Backend Changes
1. **New API Route**: `/api/squads/[id]/members` with authentication and authorization
2. **Database Query**: Filter active members by squad ID
3. **Error Handling**: Proper HTTP status codes and error messages

### Testing Strategy
1. **Unit Tests**: Component state management and API calls
2. **Integration Tests**: End-to-end squad selection and member display
3. **Contract Tests**: API endpoint validation

## Dependencies & Risks

### Dependencies
- Existing squad/member database schema
- shadcn/ui components (Select, loading spinner)
- Next.js API routes pattern

### Risks
- **Data Consistency**: Ensure member counts in squad dropdown match actual filtered results
- **Performance**: Large squads (>50 members) may need pagination
- **Caching**: Stale data if members are added/removed during session

## Implementation Notes

### Phase 1 Deliverables
- Data model documentation
- API contract specifications
- Component interface definitions
- Test scenarios outline

### Success Criteria
- Members display correctly filters by selected squad
- Loading states provide good UX
- Error handling allows recovery
- Performance acceptable for target scale