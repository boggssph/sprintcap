# Quickstart: Scrum Master Member Hours Input Table

**Date**: October 14, 2025
**Feature**: 024-as-scrum-master

## Overview
This guide provides quick validation steps for the member hours input table feature. Run these tests to verify the implementation meets acceptance criteria.

## Prerequisites
- SprintCap application running locally or on staging
- User logged in as Scrum Master
- Active sprint with squad members assigned
- Database migrated with MemberHours model

## Test Scenarios

### Scenario 1: Table Display
**Given** a Scrum Master views the Capacity tab for an active sprint
**When** they navigate to the page
**Then** they should see:
- A table above the existing tickets table
- One row per squad member
- Columns: Member Name (read-only), Support and Incidents, PR Review, Others
- All editable cells are empty or show existing values

### Scenario 2: Valid Input and Auto-save
**Given** the member hours table is displayed
**When** the Scrum Master enters "2.5" in Support and Incidents for a member and clicks outside the cell
**Then**:
- The value saves automatically
- No error messages appear
- Value persists on page refresh

### Scenario 3: Blank Input Handling
**Given** an editable cell contains a value
**When** the Scrum Master clears the cell and moves focus away
**Then** the value is saved as 0

### Scenario 4: Invalid Input Prevention
**Given** the member hours table is displayed
**When** the Scrum Master attempts to enter "-1" in any column
**Then**:
- The negative value is rejected
- Cell shows error state or reverts to previous value
- No save occurs

### Scenario 5: Decimal Precision
**Given** the member hours table is displayed
**When** the Scrum Master enters "2.55" in PR Review
**Then** the value is accepted and saved

### Scenario 6: Sprint Isolation
**Given** hours are entered for Sprint A
**When** the Scrum Master switches to Sprint B
**Then**:
- Sprint B shows different/no hours
- Changes in Sprint B don't affect Sprint A

## Validation Commands

### API Tests
```bash
# Test GET endpoint
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/member-hours?sprintId=<sprint-id>"

# Test PUT endpoint
curl -X PUT -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"memberId":"<member-id>","sprintId":"<sprint-id>","supportIncidents":2.5}' \
  http://localhost:3000/api/member-hours
```

### E2E Test
```bash
npx playwright test e2e/member-hours-table.spec.ts
```

### Unit Tests
```bash
npm run test -- tests/unit/components/MemberHoursTable.test.ts
```

## Common Issues
- **Table not visible**: Ensure user has Scrum Master role for the squad
- **Save fails**: Check network connection and database connectivity
- **Validation errors**: Verify input is numeric and non-negative
- **Sprint data missing**: Ensure sprint exists and has assigned members

## Success Criteria
- All scenarios pass without errors
- Data persists correctly in database
- UI provides immediate feedback
- Performance meets "immediate" requirement (<500ms save time)