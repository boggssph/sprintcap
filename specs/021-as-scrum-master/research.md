# Research: Capacity Plan Tab for Scrum Masters

**Date**: 2025-10-10
**Feature**: 021-as-scrum-master

## Research Questions & Findings

### 1. Jira Integration for Ticket CRUD
**Question**: How to implement CRUD operations on Jira tickets within the capacity plan cards?

**Findings**:
- Jira REST API provides endpoints for issue creation, update, deletion
- Authentication: OAuth 2.0 or API tokens
- Key endpoints:
  - POST /rest/api/2/issue - Create issue
  - PUT /rest/api/2/issue/{issueIdOrKey} - Update issue
  - DELETE /rest/api/2/issue/{issueIdOrKey} - Delete issue
  - GET /rest/api/2/search - Query issues
- Need to handle Jira project keys, issue types, custom fields
- Rate limiting: 1000 requests per hour for basic auth, higher for OAuth

**Decision**: Use Jira REST API v2 with OAuth authentication. Store Jira credentials securely in environment variables.

### 2. Sprint Active Status Management
**Question**: How should Scrum Masters mark sprints as active/inactive?

**Findings**:
- Need a database field on Sprint model: `isActive: boolean`
- UI toggle in sprint management interface
- Only Scrum Masters of the squad can change active status
- Active sprints determine which capacity plans are displayed

**Decision**: Add `isActive` boolean field to Sprint model. Provide toggle in sprint settings/management UI.

### 3. Capacity Plan Card UI Design
**Question**: What should the capacity plan card contain and how to layout CRUD operations?

**Findings**:
- Card should show: Sprint name, dates, ticket count, progress indicators
- CRUD operations: Add ticket button, ticket list with edit/delete actions
- Use shadcn/ui Card, Button, Dialog components
- Responsive grid layout for multiple cards
- Empty state when no tickets

**Decision**: Use shadcn/ui Card component with header (sprint info), content (ticket list), and footer (add ticket button).

### 4. Database Schema Extensions
**Question**: What database changes are needed for tickets and sprint active status?

**Findings**:
- Existing Sprint model needs `isActive` field
- Ticket model may need: id, title, description, status, assignee, sprintId, jiraKey
- Foreign key relationships: Ticket belongs to Sprint, Sprint belongs to Squad
- Indexes on sprintId for performance

**Decision**: Extend Prisma schema with Ticket model and add isActive to Sprint model.

### 5. Authentication & Authorization
**Question**: How to ensure only Scrum Masters can access and modify capacity plans?

**Findings**:
- Use existing NextAuth session with user roles
- Check if user is Scrum Master of the squad for each sprint
- API routes should validate user permissions
- Frontend should conditionally show edit controls

**Decision**: Leverage existing auth middleware and add squad membership checks in API routes.

## Integration Patterns

### Jira API Integration
- Use a service layer (lib/services/jiraService.ts) to abstract API calls
- Handle errors gracefully (connection issues, invalid credentials)
- Cache responses where appropriate to reduce API calls

### UI State Management
- Use React state for local CRUD operations
- Optimistic updates for better UX
- Error handling with toast notifications

## Best Practices Applied

### Performance
- Paginate ticket lists if large
- Lazy load capacity plan cards
- Optimize database queries with proper indexes

### Security
- Validate all user inputs
- Use parameterized queries
- Rate limit API calls

### Accessibility
- Keyboard navigation for CRUD operations
- Screen reader support with proper ARIA labels
- High contrast colors via shadcn/ui themes

## Open Questions
- Specific Jira custom fields to support?
- Bulk operations on tickets?
- Integration with Jira webhooks for real-time updates?