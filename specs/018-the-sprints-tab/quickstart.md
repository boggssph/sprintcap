# Quickstart Test Scenarios: Sprints Tab Display

## Sprint Tab Navigation Test

**Purpose**: Verify Scrum Masters can access the Sprints tab

**Setup**:
1. Authenticate as a Scrum Master user
2. Navigate to dashboard

**Steps**:
1. Click on "Sprints" tab in navigation
2. Verify tab is accessible and loads

**Expected Results**:
- Sprints tab is visible and clickable
- Page loads without errors
- Squad cards are displayed (or empty state if no squads)

## Squad Cards Display Test

**Purpose**: Verify squad cards show sprint information correctly

**Setup**:
1. Authenticate as Scrum Master with at least one squad
2. Ensure squad has 1-3 sprints with various date ranges

**Steps**:
1. Navigate to Sprints tab
2. Observe squad cards layout
3. Check sprint ordering (active first, then by start date)

**Expected Results**:
- Each squad displays as a card
- Active sprint appears at top of list
- Sprint names show with dates opposite
- Maximum 3 sprints per squad

## Sprint Creation Flow Test

**Purpose**: Verify end-to-end sprint creation workflow

**Setup**:
1. Authenticate as Scrum Master
2. Have at least one squad available

**Steps**:
1. Click "Create New Sprint" button
2. Fill in sprint details (name, dates, squad)
3. Submit the form
4. Verify sprint appears in squad card

**Expected Results**:
- Drawer opens with form
- Form validates input
- Sprint is created and appears in list
- Active status updates if applicable

## Empty State Test

**Purpose**: Verify behavior when Scrum Master has no squads

**Setup**:
1. Authenticate as Scrum Master with no squad assignments

**Steps**:
1. Navigate to Sprints tab

**Expected Results**:
- Empty state message displays
- "Create Squad" call-to-action is visible
- No squad cards shown

## Responsive Design Test

**Purpose**: Verify layout works across screen sizes

**Setup**:
1. Authenticate as Scrum Master with squads

**Steps**:
1. View Sprints tab on desktop (>1024px)
2. Resize to tablet (768-1024px)
3. Resize to mobile (<768px)

**Expected Results**:
- Layout adapts appropriately
- Cards remain readable
- Drawer behavior adjusts for mobile

## Performance Test

**Purpose**: Verify page loads within performance targets

**Setup**:
1. Authenticate as Scrum Master
2. Have multiple squads with sprints

**Steps**:
1. Navigate to Sprints tab
2. Measure page load time

**Expected Results**:
- Page loads in <20ms (desktop)
- Mobile load <15ms
- No blocking operations

## Accessibility Test

**Purpose**: Verify WCAG AA compliance

**Setup**:
1. Use screen reader or keyboard navigation

**Steps**:
1. Navigate Sprints tab with keyboard
2. Test form interactions
3. Verify ARIA labels and semantic markup

**Expected Results**:
- All interactive elements keyboard accessible
- Screen reader announces content correctly
- Color contrast meets WCAG AA standards