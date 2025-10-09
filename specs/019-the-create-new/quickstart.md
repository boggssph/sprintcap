# Quickstart: Update Create New Sprint Drawer

## Overview
This guide provides step-by-step instructions for testing the updated "Create New Sprint" drawer functionality.

## Prerequisites
- User account with SCRUM_MASTER role
- At least one squad assigned to the Scrum Master
- Access to the Scrum Master dashboard

## Test Scenarios

### Scenario 1: Verify Drawer Appearance and Behavior
1. **Navigate to Dashboard**: Log in as a Scrum Master and access `/dashboard/scrum-master`
2. **Open Sprints Tab**: Click on the "Sprints" tab in the dashboard
3. **Click Create Sprint**: Click the "Create New Sprint" button
4. **Verify Drawer Appearance**:
   - Drawer opens with maximum width of 768px on desktop
   - Drawer uses full screen width on mobile devices (< 768px)
   - Visual styling matches the "Create New Squad" drawer
   - All UI elements (buttons, icons, animations) are consistent

### Scenario 2: Test Dropdown Behavior
1. **Open Sprint Creation Drawer**: Follow steps 1-3 from Scenario 1
2. **Observe Dropdown State**: Verify the squad selection dropdown is closed by default
3. **Click Dropdown**: Click on the squad selection dropdown
4. **Verify Opening**: Dropdown opens and displays all assigned squads
5. **Select Squad**: Choose a squad from the dropdown
6. **Verify Member Display**: Confirm that squad member names are NOT displayed after selection

### Scenario 3: Test Form Submission
1. **Open Sprint Creation Drawer**: Follow steps 1-3 from Scenario 1
2. **Fill Form**:
   - Select a squad from dropdown
   - Enter sprint name
   - Set start and end dates (end date after start date)
3. **Submit Form**: Click "Create Sprint" button
4. **Verify Success**: Sprint is created and appears in the sprint list
5. **Verify UI Update**: Sprint list refreshes to show the new sprint

### Scenario 4: Test Responsive Behavior
1. **Desktop View**: Follow Scenario 1 on desktop (≥ 768px width)
   - Verify drawer max width is 768px
2. **Mobile View**: Resize browser or use mobile device (< 768px width)
   - Verify drawer uses full screen width
   - Verify no horizontal scrolling issues

### Scenario 5: Test Edge Cases
1. **Empty Squad Scenario**: Attempt to create sprint for squad with no members
   - Verify creation is allowed (members can be added later)
2. **Long Squad List**: Test with Scrum Master having many assigned squads
   - Verify dropdown handles large lists without performance issues
   - Verify scrolling works if dropdown exceeds viewport

## Expected Results
- ✅ Drawer opens with correct dimensions and styling
- ✅ Dropdown behavior is controlled (closed until clicked)
- ✅ No squad member names displayed after selection
- ✅ Form submission works correctly
- ✅ Responsive behavior works across device sizes
- ✅ Edge cases handled appropriately

## Troubleshooting
- **Drawer not opening**: Check user permissions and squad assignments
- **Styling inconsistencies**: Compare with "Create New Squad" drawer
- **Form validation errors**: Ensure all required fields are filled correctly
- **Performance issues**: Check browser console for errors

## Success Criteria
- All test scenarios pass without errors
- Visual consistency maintained with existing drawer patterns
- Responsive behavior works across all target devices
- No regression in existing sprint creation functionality