# Quickstart: Squad Management Updates

**Feature**: Squad Management Updates
**Date**: October 11, 2025

## Overview

This quickstart guide provides end-to-end test scenarios for the squad management updates feature. These scenarios validate that Scrum Masters can successfully update squad information and ceremony time defaults.

## Prerequisites

1. **User Account**: Scrum Master role in an organization
2. **Test Squad**: At least one squad in the organization
3. **Access**: Dashboard access with squad management permissions

## Test Scenarios

### Scenario 1: Update Squad Name and Alias

**Given** a Scrum Master is logged in and viewing squad details
**When** they update the squad name to "Frontend Team" and alias to "frontend"
**Then** the squad information is saved successfully
**And** the changes are reflected in the UI
**And** no other squads can use the same name in the organization

**Validation Steps**:
1. Navigate to squad management page
2. Click edit button on squad card/form
3. Update name field to "Frontend Team"
4. Update alias field to "frontend"
5. Save changes
6. Verify success message displayed
7. Verify updated name/alias shown in UI
8. Attempt to create another squad with same name (should fail)
9. Attempt to update different squad with same alias (should fail)

### Scenario 2: Configure Ceremony Time Defaults

**Given** a Scrum Master is editing squad settings
**When** they set ceremony defaults:
- Daily Scrum: 20 minutes
- Team Refinement: 1.5 hours per week
- Review and Demo: 45 minutes per sprint
- Sprint Planning: 1.5 hours per week
- Sprint Retrospective: 45 minutes per week
**Then** the defaults are saved successfully
**And** new sprints will use these calculations

**Validation Steps**:
1. Access squad ceremony settings
2. Update each ceremony time field
3. Save settings
4. Verify success confirmation
5. Create a new sprint for the squad
6. Verify ceremony times match calculations:
   - 2-week sprint: Daily Scrum = 20 × 10 working days = 200 minutes
   - 2-week sprint: Refinement = 1.5 × 2 × 60 = 180 minutes
   - 2-week sprint: Review/Demo = 45 minutes (fixed)
   - 2-week sprint: Planning = 1.5 × 2 × 60 = 180 minutes
   - 2-week sprint: Retrospective = 45 × 2 = 90 minutes

### Scenario 3: Validation Error Handling

**Given** a Scrum Master is updating squad information
**When** they enter invalid data:
- Negative daily scrum minutes (-5)
- Zero refinement hours (0)
- Duplicate squad name
**Then** appropriate error messages are displayed
**And** the invalid data is not saved

**Validation Steps**:
1. Attempt to set dailyScrumMinutes to -5
2. Verify error: "Must be positive number"
3. Attempt to set refinementHours to 0
4. Verify error: "Must be greater than 0"
5. Attempt to use existing squad name
6. Verify error: "Name already exists in organization"
7. Attempt to use existing squad alias
8. Verify error: "Alias already exists"
9. Verify no changes were saved to database

### Scenario 4: Partial Updates

**Given** a Scrum Master wants to update only ceremony defaults
**When** they submit a partial update with only time fields
**Then** only the specified fields are updated
**And** other fields remain unchanged

**Validation Steps**:
1. Record current squad name and alias
2. Update only ceremony time fields
3. Save changes
4. Verify name and alias unchanged
5. Verify ceremony defaults updated
6. Verify updatedAt timestamp changed

### Scenario 5: Sprint Creation with New Defaults

**Given** a squad has updated ceremony defaults
**When** a new sprint is created for that squad
**Then** the sprint uses the new ceremony calculations
**And** existing sprints are unaffected

**Validation Steps**:
1. Set squad ceremony defaults
2. Create new sprint with 3-week duration
3. Verify ceremony allocations:
   - Daily Scrum: 15 × 15 working days = 225 minutes
   - Refinement: 1 × 3 × 60 = 180 minutes
   - Review/Demo: 30 minutes
   - Planning: 1 × 3 × 60 = 180 minutes
   - Retrospective: 30 × 3 = 90 minutes
4. Check existing sprint ceremony times (should be unchanged)
5. Verify new sprint calculations are correct

## Manual Testing Checklist

### Functional Testing
- [ ] Squad name updates work correctly
- [ ] Squad alias updates work correctly
- [ ] Ceremony default updates work correctly
- [ ] Validation prevents invalid data
- [ ] Uniqueness constraints enforced
- [ ] Partial updates work correctly
- [ ] New sprints use updated defaults
- [ ] Existing sprints unaffected

### UI/UX Testing
- [ ] Form displays current values correctly
- [ ] Error messages are clear and helpful
- [ ] Success messages displayed appropriately
- [ ] Loading states handled properly
- [ ] Mobile responsive design works
- [ ] Accessibility standards met (WCAG AA)

### Performance Testing
- [ ] Page loads within 200ms
- [ ] Form submissions complete within 150ms
- [ ] No performance degradation with large datasets

### Security Testing
- [ ] Only Scrum Masters can access squad updates
- [ ] Input validation prevents injection attacks
- [ ] Authentication required for all operations
- [ ] Authorization checks prevent cross-organization access

## Automated Test Coverage

### Unit Tests
- Ceremony calculation utilities
- Form validation schemas
- API input/output validation

### Integration Tests
- Full squad update workflow
- Database constraint validation
- Authentication/authorization checks

### E2E Tests
- Complete user journeys from login to update
- Error handling and recovery
- Cross-browser compatibility

## Troubleshooting

### Common Issues

**"Squad not found" error**:
- Verify squad ID is correct
- Check user has access to the organization
- Confirm squad wasn't deleted

**"Name already exists" error**:
- Choose a different name unique to the organization
- Check for case sensitivity in name comparison

**"Permission denied" error**:
- Verify user has Scrum Master role
- Check organization membership
- Confirm authentication token is valid

**Ceremony calculations incorrect**:
- Verify sprint duration calculation
- Check working days logic (Mon-Fri only)
- Confirm partial week handling

## Success Criteria

The feature is complete when:
- All manual test scenarios pass
- Automated test coverage > 95%
- Performance benchmarks met
- Security review passed
- Accessibility audit passed
- No outstanding bugs in production