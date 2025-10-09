# Quickstart: Stack Squad Cards Vertically with Member List

## Feature Overview
This feature changes the squad cards layout from a responsive grid to vertical stacking, and displays all squad members with their join dates within each card.

## Manual Testing Scenarios

### Scenario 1: View Squads with Members
1. **Given** a Scrum Master with existing squads containing members
2. **When** navigating to the dashboard Squads tab
3. **Then** squad cards should display in a single vertical column
4. **And** each card should show all members with names and join dates
5. **And** member lists should be scrollable if they exceed card height

### Scenario 2: View Empty Squad
1. **Given** a Scrum Master with a squad that has no members
2. **When** viewing the squad card
3. **Then** the card should display "No members yet" message
4. **And** maintain the same card styling as squads with members

### Scenario 3: Mobile Responsiveness
1. **Given** viewing the dashboard on a mobile device (< 768px width)
2. **When** the Squads tab is displayed
3. **Then** cards should stack vertically with full width
4. **And** member lists should be touch-friendly and readable

### Scenario 4: Large Squad (25 members)
1. **Given** a squad with the maximum 25 members
2. **When** viewing the squad card
3. **Then** all 25 members should be displayed
4. **And** the member list should be scrollable within the card
5. **And** member names should be displayed clearly

## Automated Test Validation

### Contract Tests
Run the existing contract tests to ensure API compatibility:
```bash
npm test -- tests/contract/test_squads_get.spec.ts
```

### E2E Tests
Execute the squad-related E2E tests:
```bash
npm run test:e2e -- --grep "squads"
```

## Performance Validation

### Load Testing
1. Create squads with varying member counts (1, 5, 10, 25 members)
2. Verify page load times remain under 20ms target
3. Check memory usage with large member lists
4. Validate scrolling performance on mobile devices

### Accessibility Testing
1. Verify keyboard navigation works with scrollable member lists
2. Check screen reader compatibility with member information
3. Ensure proper ARIA labels for member data
4. Validate color contrast for member text

## Deployment Checklist

- [ ] Contract tests pass
- [ ] E2E tests pass (after dev server setup)
- [ ] Manual testing scenarios validated
- [ ] Performance targets met
- [ ] Accessibility requirements satisfied
- [ ] Mobile responsiveness confirmed
- [ ] No console errors in browser
- [ ] Vercel deployment successful</content>
<parameter name="filePath">/Users/fseguerra/Projects/sprintCap/specs/015-stack-the-squad/quickstart.md