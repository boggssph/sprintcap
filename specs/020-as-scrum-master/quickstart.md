# Quickstart Guide: Add Jira Tickets to Sprints

**Date**: October 10, 2025
**Feature**: 020-as-scrum-master

## Overview

This guide provides step-by-step instructions for testing the Jira ticket addition feature for Scrum Masters.

## Prerequisites

1. **User Account**: Must be logged in as a Scrum Master
2. **Squad Access**: Must have at least one squad assigned
3. **Active Sprint**: At least one active or future sprint must exist in assigned squads

## Test Scenarios

### Scenario 1: Add Ticket to Active Sprint

**Given**: I am logged in as a Scrum Master with an active sprint in my squad

1. Navigate to the Scrum Master dashboard
2. Click on "Sprints" tab
3. Find an active sprint for your squad
4. Click "Add Ticket" button (or equivalent UI element)
5. Fill in the ticket form:
   - Jira ID: "PROJ-123"
   - Hours: 8
   - Work Type: "BACKEND"
   - Parent Type: "STORY"
   - Planned/Unplanned: "PLANNED"
   - Member: (leave unassigned)
6. Click "Create Ticket"
7. **Expected**: Ticket appears in the sprint view with all entered details

### Scenario 2: Validation Error Handling

**Given**: I am logged in as a Scrum Master with an active sprint

1. Navigate to ticket creation form
2. Leave all required fields empty
3. Click "Create Ticket"
4. **Expected**: Form shows validation errors for all required fields

### Scenario 3: Duplicate Jira ID Prevention

**Given**: I have already created a ticket with Jira ID "PROJ-123" in a sprint

1. Try to create another ticket with the same Jira ID "PROJ-123" in the same sprint
2. Fill all other required fields
3. Click "Create Ticket"
4. **Expected**: Error message indicating duplicate Jira ID in this sprint

### Scenario 4: Cross-Sprint Duplicate Allowance

**Given**: I have a ticket with Jira ID "PROJ-123" in Sprint A

1. Create a new ticket with Jira ID "PROJ-123" in Sprint B (different sprint)
2. Fill all other required fields
3. Click "Create Ticket"
4. **Expected**: Ticket created successfully (duplicates allowed across sprints)

### Scenario 5: Member Assignment

**Given**: I have a squad with multiple members

1. Open ticket creation form
2. Fill all required fields
3. Select a squad member from the member dropdown
4. Click "Create Ticket"
5. **Expected**: Ticket created and assigned to the selected member

### Scenario 6: Hours Validation

**Given**: I am creating a ticket

1. Enter negative hours value (e.g., -1)
2. Fill all other required fields
3. Click "Create Ticket"
4. **Expected**: Validation error for invalid hours value

### Scenario 7: Access Control

**Given**: I am logged in as a Scrum Master

1. Try to access ticket creation for a sprint in a squad I don't manage
2. **Expected**: Access denied or sprint not visible in available sprints list

## Manual Testing Checklist

- [ ] Ticket creation form accessible from sprint view
- [ ] All required fields properly validated
- [ ] Hours field accepts decimal values and rejects negatives
- [ ] Work Type dropdown shows BACKEND, FRONTEND, TESTING
- [ ] Parent Type dropdown shows BUG, STORY, TASK
- [ ] Planned/Unplanned dropdown works correctly
- [ ] Member assignment is optional
- [ ] Duplicate detection works within same sprint
- [ ] Duplicates allowed across different sprints
- [ ] Tickets appear in sprint view after creation
- [ ] Scrum Master access control enforced
- [ ] Form validation provides clear error messages

## Automated Test Hooks

When implementing, ensure these data-testid attributes are added for E2E testing:

- `data-testid="add-ticket-button"`
- `data-testid="ticket-form"`
- `data-testid="jira-id-input"`
- `data-testid="hours-input"`
- `data-testid="work-type-select"`
- `data-testid="parent-type-select"`
- `data-testid="planned-unplanned-select"`
- `data-testid="member-select"`
- `data-testid="create-ticket-submit"`
- `data-testid="ticket-list"`
- `data-testid="ticket-item-{id}"`

## Performance Expectations

- Form load time: < 500ms
- Ticket creation: < 1000ms
- Ticket list load: < 500ms
- No strict performance requirements for CRUD operations