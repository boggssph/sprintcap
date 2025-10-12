# Quickstart: Sprint Update Feature

## Prerequisites
- SprintCap application running locally
- User logged in as Scrum Master
- At least one squad with an existing sprint

## Test Scenario: Complete Sprint Update Flow

### 1. Navigate to Dashboard
- Open the application at `http://localhost:3000`
- Log in as a Scrum Master user
- Navigate to the dashboard

### 2. Locate Sprint to Update
- Find a sprint card in the sprint list
- Verify the sprint is not in "completed" status
- Click the "Edit" or "Update" button on the sprint card

### 3. Open Sprint Update Drawer
- Drawer should open with current sprint details pre-populated
- Verify drawer is full-screen on mobile, side drawer on desktop

### 4. Update Sprint Dates
- Modify the start date to a future date
- Modify the end date to a date after the start date
- Verify validation prevents past dates for active sprints

### 5. Update Ceremony Times
- Change daily scrum time to a positive number (e.g., 20 minutes)
- Update sprint planning time
- Verify validation prevents zero or blank values

### 6. Change Sprint Status
- If sprint is "planned", change to "active"
- If sprint is "active", change to "completed"
- Verify one-way transition rules are enforced

### 7. Submit Updates
- Click "Save" or "Update Sprint" button
- Verify success message appears
- Verify drawer closes
- Verify sprint card reflects updated information

### 8. Verify Persistence
- Refresh the page
- Confirm changes are persisted in the database
- Verify audit trail shows update timestamp

## Error Scenarios to Test

### Attempt to Edit Completed Sprint
- Try to update a sprint with "completed" status
- Verify operation is rejected with appropriate error message

### Invalid Date Entry
- Try to set start date to a past date for active sprint
- Verify validation error prevents submission

### Invalid Ceremony Time
- Try to set ceremony time to 0 or blank
- Verify validation error prevents submission

### Status Transition Violation
- Try to change status from "active" back to "planned"
- Verify operation is rejected

## Success Criteria
- [ ] All form validations work correctly
- [ ] Business rules are enforced
- [ ] UI provides clear feedback for errors
- [ ] Changes persist after page refresh
- [ ] Mobile and desktop experiences are consistent