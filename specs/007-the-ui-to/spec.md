# Feature Specification: Sprint Creation UI - **FR-010**: System MUST ensure sprint names are unique within each squad
- **FR-011**: System MUST prevent sprint creation when the chosen number conflicts with an existing sprint in the same squad and display an error messageith Formatted Name Input

**Feature Branch**: `007-the-ui-to`
**Created**: 2025-09-30
**Status**: Draft
**Input**: User description: "the ui to create sprint must have an input field for Sprint Name (not Sprint Number). The input field will hae a gray (uneditable area) wherein it will show the <Sprint Alias> - Sprint - number, example if I the chosen squad is FMBS, then inside the input field left aligned is FMBS-Sprint-<insert number here>."

## Clarifications

### Session 2025-09-30
- Q: What other fields should be included in the sprint creation form? → A: A squad selector plus the formatted name input field (focused on name input as primary field)
- Q: How are squad aliases determined and what are their validation rules? → A: User-defined during squad creation, alphanumeric only, 2-10 characters
- Q: How should sprint numbers be determined? → A: System suggests next number but user can override
- Q: What should be the first suggested sprint number for a new squad? → A: 001
- Q: How should duplicate sprint numbers within the same squad be handled? → A: Prevent creation with error message

## User Scenarios & Testing

### Primary User Story
As a Scrum Master, I want to create a new sprint with a properly formatted name that includes my squad's alias, so that sprint names are consistent and easily identifiable across the organization.

### Acceptance Scenarios
1. **Given** I am a Scrum Master creating a new sprint for squad "FMBS", **When** I open the sprint creation form, **Then** I should see an input field with "FMBS-Sprint-" displayed in gray on the left side, followed by an editable number field
2. **Given** I am creating a sprint and enter "5" in the number field, **When** I submit the form, **Then** the sprint should be created with the name "FMBS-Sprint-5"
3. **Given** I select a different squad "DEV" from the squad dropdown, **When** the form updates, **Then** the input field should show "DEV-Sprint-" in gray followed by the editable number field

### Edge Cases
- What happens when the squad alias contains special characters or spaces?
- How does the system handle squad names that are very long?
- What happens if the user tries to edit the gray prefix area?
- How does the system prevent duplicate sprint names within the same squad?

## Requirements

### Functional Requirements
- **FR-001**: System MUST display a minimal sprint creation form containing only a formatted name input field
- **FR-002**: System MUST show the selected squad's alias followed by "-Sprint-" in a gray uneditable area within the input field
- **FR-003**: System MUST provide an editable number field immediately following the gray prefix
- **FR-004**: System MUST suggest the next available sprint number for the selected squad (starting with 001 for new squads)
- **FR-005**: System MUST allow users to override the suggested sprint number
- **FR-006**: System MUST construct the complete sprint name as "[SquadAlias]-Sprint-[Number]" when the form is submitted
- **FR-007**: System MUST update the gray prefix when a different squad is selected
- **FR-008**: System MUST validate that the entered number is a positive integer
- **FR-009**: System MUST prevent editing of the gray prefix area
- **FR-010**: System MUST ensure sprint names are unique within each squad

### Key Entities
- **Sprint**: Represents a development iteration with a unique name within its squad
- **Squad**: Represents a team with a user-defined alias (alphanumeric only, 2-10 characters) used as a prefix for sprint names

## Review & Acceptance Checklist

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [ ] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed