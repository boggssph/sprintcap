# Feature Specification: Add Jira Tickets to Sprints

**Feature Branch**: `020-as-scrum-master`  
**Created**: October 10, 2025  
**Status**: Draft  
**Input**: User description: "as scrum master i want to be able to add jira tickets to active or future sprint to any squad that is/are assigned to me. each ticket i can also assign the number of hours, a work type from the following: Backend, Frontend, Testing. also a field called Parent Type can be choosen from: Bug, Story, Task. And a field to choose: Planned, Unplanned. These fields are all mandatory. An optional field is to assign the ticket to any members of the squad using a combobox. We will use shadcn/ui drawer similar to our existing drawer implementations."

## Clarifications

### Session 2025-10-10
- Q: What is the expected format and validation rules for the Jira ticket ID field? → A: Free text input with no specific format requirements
- Q: What are the validation rules for the hours field (numeric constraints, minimum/maximum values)? → A: numeric, at least zero
- Q: How should duplicate Jira ticket IDs be handled across different sprints (same squad vs different squads)? → A: Allow duplicates across all sprints (no restrictions)
- Q: What is the expected approach for Jira integration (if any)? → A: No Jira integration - tickets are manually entered
- Q: What are the expected performance requirements for ticket operations (add/view/update within what timeframe)? → A: CRUD no time limit

## User Scenarios & Testing

### Primary User Story
As a Scrum Master, I want to add Jira tickets to active or future sprints for squads I manage, so that I can track work items and assign them to team members with appropriate categorization and time estimates.

### Acceptance Scenarios
1. **Given** I am a Scrum Master with assigned squads, **When** I access the sprint management interface, **Then** I can see all active and future sprints for my squads
2. **Given** I have selected a sprint, **When** I choose to add a Jira ticket, **Then** I see a form with all required fields (hours, work type, parent type, planned/unplanned) and optional member assignment
3. **Given** I have filled all mandatory fields, **When** I submit the ticket, **Then** the ticket is added to the sprint and appears in the sprint view
4. **Given** I have not filled all mandatory fields, **When** I attempt to submit, **Then** I receive validation errors for missing required fields
5. **Given** I want to assign a ticket to a specific team member, **When** I use the member combobox, **Then** I can select from available squad members or leave unassigned

### Edge Cases
- What happens when a Scrum Master tries to add tickets to sprints for squads they don't manage?
- How does the system handle duplicate Jira ticket IDs within the same sprint?
- What happens when sprint dates change after tickets are assigned?
- How are validation errors displayed for each field type?
- What happens if a squad member is removed after tickets are assigned to them?

## Requirements

### Functional Requirements
- **FR-001**: System MUST allow Scrum Masters to view all active and future sprints for squads they manage
- **FR-002**: System MUST provide a way for Scrum Masters to add Jira tickets to selected sprints
- **FR-003**: System MUST require hours (numeric input, minimum value 0) for each ticket
- **FR-004**: System MUST require work type selection from: Backend, Frontend, Testing
- **FR-005**: System MUST require parent type selection from: Bug, Story, Task
- **FR-006**: System MUST require planned/unplanned selection from: Planned, Unplanned
- **FR-007**: System MUST allow optional assignment of tickets to squad members via combobox
- **FR-008**: System MUST validate all mandatory fields before allowing ticket submission
- **FR-009**: System MUST display appropriate validation messages for missing or invalid data
- **FR-010**: System MUST show the ticket in the sprint view after successful addition
- **FR-011**: System MUST prevent duplicate Jira ticket IDs within the same sprint
- **FR-013**: System MUST allow duplicate Jira ticket IDs across different sprints

## Non-Functional Requirements

### Performance
- **NFR-001**: CRUD operations for tickets have no strict time limit requirements

### Key Entities
- **Jira Ticket**: Represents a manually entered work item with user-provided Jira ID reference, hours estimate, work type, parent type, planned/unplanned status, and optional member assignment
- **Sprint**: Contains tickets and belongs to a specific squad with date ranges
- **Squad**: Has members and is managed by Scrum Masters
- **Scrum Master**: Can manage multiple squads and add tickets to their sprints

## External Dependencies

- **Jira Integration**: None - tickets are manually entered by Scrum Masters

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed
