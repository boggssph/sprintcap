# Research: Squad Management Updates

**Feature**: Squad Management Updates
**Date**: October 11, 2025
**Researcher**: GitHub Copilot

## Research Summary

This feature enables Scrum Masters to update squad information and configure default ceremony time allocations. The research focused on understanding the existing codebase structure, validation requirements, and implementation patterns.

## Key Findings

### Existing Codebase Analysis

**Database Schema**:
- Current `Squad` model exists in Prisma schema
- Fields: `id`, `name`, `alias`, `organizationId`, `createdAt`, `updatedAt`
- No existing ceremony default fields

**Authentication & Authorization**:
- NextAuth handles authentication with role-based access
- Scrum Master role exists and controls squad management
- API routes use middleware for authorization

**UI Patterns**:
- shadcn/ui components used throughout application
- Drawer components used for forms (SquadFormFields.tsx exists)
- Form validation using react-hook-form + zod schemas

### Ceremony Calculation Logic

**Requirements Analysis**:
- Daily Scrum: 15 minutes × working days (Mon-Fri) in sprint
- Team Refinement: 1 hour × number of weeks in sprint
- Review and Demo: 30 minutes per sprint (fixed)
- Sprint Planning: 1 hour × number of weeks in sprint
- Sprint Retrospective: 30 minutes × number of weeks in sprint

**Technical Decisions**:
- Store defaults in minutes (integer) for precision
- Calculate totals based on sprint duration and working days
- Handle partial weeks with fractional calculations
- Only apply defaults to new sprints

### Validation Rules

**Squad Names/Aliases**:
- Names must be unique per organization
- Aliases must be unique per squad
- No length/format restrictions beyond database constraints

**Time Values**:
- Must be positive numbers
- Decimals allowed (e.g., 0.5 hours = 30 minutes)
- No upper limits enforced

## Implementation Approach

### Database Changes
- Add ceremony default fields to Squad model:
  - `dailyScrumMinutes: Int` (default: 15)
  - `refinementHours: Float` (default: 1.0)
  - `reviewDemoMinutes: Int` (default: 30)
  - `planningHours: Float` (default: 1.0)
  - `retrospectiveMinutes: Int` (default: 30)

### API Design
- `PATCH /api/squads/[id]` - Update squad with ceremony defaults
- Include validation for uniqueness and positive values
- Return updated squad data

### UI Components
- Extend existing SquadFormFields component
- Add ceremony defaults section with number inputs
- Use shadcn/ui Form components for validation
- Display current defaults and allow editing

### Calculation Logic
- Create utility functions for ceremony time calculations
- Handle sprint duration (weeks) and working days
- Support fractional weeks for partial sprints

## Dependencies & Integrations

**Existing Dependencies** (no changes needed):
- Next.js App Router
- Prisma ORM with PostgreSQL
- shadcn/ui components
- react-hook-form + zod for validation
- NextAuth for authentication

**New Dependencies**: None required

## Testing Strategy

**Unit Tests**:
- Ceremony calculation utilities
- Validation schemas
- API route handlers

**Integration Tests**:
- Full squad update flow
- Calculation accuracy
- Uniqueness constraints

**E2E Tests**:
- Scrum Master squad management workflow
- Form validation and error handling

## Security Considerations

- Role-based access control (Scrum Master only)
- Input validation and sanitization
- Database constraints for data integrity
- No sensitive data exposure in API responses

## Performance Impact

- Minimal impact expected
- Database queries remain efficient
- UI changes contained to squad management pages
- Calculation logic is lightweight (client-side)

## Migration Strategy

- Database migration for new ceremony fields
- Backward compatibility maintained
- Default values applied automatically
- Existing sprints unaffected

## Conclusion

The feature implementation is straightforward and aligns with existing patterns. No significant technical challenges identified. The research confirms the approach outlined in the feature specification is viable and follows constitutional guidelines.