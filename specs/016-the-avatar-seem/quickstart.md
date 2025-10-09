# Quickstart Tests: Avatar Display Fix

**Feature**: `016-the-avatar-seem` | **Date**: October 9, 2025
**Purpose**: Validate avatar display consistency across browsers

## Test Environment Setup

### Prerequisites
- Next.js application running locally or on staging
- Test user accounts with and without Google profile pictures
- Multiple browsers: Chrome, Firefox, Safari, Edge

### Test Data Setup
1. **User with Google Avatar**: Account linked to Google with profile picture
2. **User without Google Avatar**: Account with only email/name, no Google picture
3. **User with Failed Image**: Account where Google image URL is invalid/broken

## Quickstart Test Scenarios

### Scenario 1: Google Avatar Display (Chrome)
**Given** a user is logged in with a Google profile picture
**When** they view their profile or any page showing their avatar
**Then** only the Google profile picture should be displayed
**And** no initials should be visible

**Test Steps**:
1. Log in with Google account that has profile picture
2. Navigate to dashboard or profile page
3. Verify avatar shows Google profile picture
4. Verify no text initials are visible
5. Confirm in browser dev tools that only AvatarImage is rendered

### Scenario 2: Initials Display (Chrome)
**Given** a user is logged in without a Google profile picture
**When** they view their profile or any page showing their avatar
**Then** only user initials should be displayed
**And** no image element should be visible

**Test Steps**:
1. Log in with account that has no Google profile picture
2. Navigate to dashboard or profile page
3. Verify avatar shows user initials (e.g., "JD" for "John Doe")
4. Verify no image element is rendered
5. Confirm initials are derived correctly from display name

### Scenario 3: Firefox Avatar Consistency
**Given** a user is logged in with a Google profile picture
**When** they view their avatar in Firefox
**Then** only the Google profile picture should be displayed
**And** no initials should be visible (regression test for original issue)

**Test Steps**:
1. Open Firefox browser
2. Log in with Google account that has profile picture
3. Navigate to dashboard or profile page
4. Verify avatar shows Google profile picture
5. Verify no text initials are visible
6. Confirm behavior matches Chrome behavior

### Scenario 4: Firefox Initials Display
**Given** a user is logged in without a Google profile picture
**When** they view their avatar in Firefox
**Then** only user initials should be displayed
**And** no image element should be visible

**Test Steps**:
1. Open Firefox browser
2. Log in with account that has no Google profile picture
3. Navigate to dashboard or profile page
4. Verify avatar shows user initials
5. Verify no image element is rendered
6. Confirm behavior matches Chrome behavior

### Scenario 5: Image Load Failure Fallback
**Given** a user with a Google profile picture
**When** the Google image fails to load
**Then** the avatar should fall back to showing initials
**And** no broken image icon should be displayed

**Test Steps**:
1. Log in with Google account
2. Use browser dev tools to simulate network failure for image URL
3. Verify avatar falls back to initials
4. Verify smooth transition without broken image display

## Automated Test Commands

### E2E Tests (Playwright)
```bash
# Run all avatar display tests
npm run test:e2e -- --grep "avatar"

# Run Firefox-specific tests
npm run test:e2e -- --grep "firefox" --project firefox

# Run cross-browser avatar tests
npm run test:e2e -- --grep "avatar" --project "chromium firefox webkit"
```

### Unit Tests (Vitest)
```bash
# Run avatar utility function tests
npm run test:unit -- avatar.test.ts

# Run component tests
npm run test:unit -- ProfileDisplay.test.tsx
```

## Success Criteria

### Functional Success
- [ ] Google avatar displays correctly in all browsers
- [ ] Initials display correctly when no Google avatar available
- [ ] No simultaneous display of avatar and initials
- [ ] Smooth fallback when image fails to load

### Performance Success
- [ ] Avatar loads within 2 seconds
- [ ] No layout shift when avatar loads
- [ ] Initials display instantly (no loading delay)

### Accessibility Success
- [ ] Avatar has proper alt text
- [ ] Screen readers announce avatar correctly
- [ ] Keyboard navigation works properly

## Troubleshooting

### Common Issues
1. **Avatar shows both image and initials**: Check conditional rendering logic
2. **Wrong initials displayed**: Verify initial generation from correct name field
3. **Image doesn't load**: Check Google OAuth image URL validity
4. **Firefox-specific issues**: Test CSS rendering and JavaScript execution

### Debug Commands
```bash
# Check user session data
console.log(session.user)

# Inspect avatar DOM elements
document.querySelectorAll('[data-testid="avatar"] *')

# Test initial generation
getInitials("John Doe") // Should return "JD"
```