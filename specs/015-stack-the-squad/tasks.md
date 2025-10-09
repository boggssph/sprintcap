# Tasks: Stack Squad Cards Vertically with Member List

**Input**: Design documents from `/specs/015-stack-the-squad/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: UI-only changes to SquadsTab.tsx, existing API/data model
2. Load design documents:
   → contracts/get-squads-members.md: Existing API contract (no new tests needed)
   → research.md: Layout changes from grid to vertical stack
   → quickstart.md: 4 manual testing scenarios → integration validation tasks
3. Generate tasks by category:
   → Setup: Environment preparation and existing test validation
   → Tests: Integration tests for new UI behavior (existing contract tests sufficient)
   → Core: Modify SquadsTab.tsx layout and member display logic
   → Polish: Accessibility, performance, and documentation updates
4. Apply task rules:
   → UI-only changes = focus on single component
   → Tests before implementation (TDD)
   → All changes to SquadsTab.tsx = sequential tasks
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All quickstart scenarios covered?
   → Component changes isolated to SquadsTab.tsx?
   → No backend changes required?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `components/`, `app/`, `tests/` at repository root
- All changes isolated to `components/SquadsTab.tsx`

## Phase 3.1: Setup
- [x] T001 Validate existing contract tests pass for GET /api/squads
- [x] T002 [P] Review current SquadsTab.tsx implementation and layout structure
- [x] T003 Set up development environment with existing dependencies

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: Integration tests for new UI behavior MUST be written before implementation**
- [x] T004 Integration test: Squad cards display in vertical stack layout
- [x] T005 Integration test: Squad cards show member lists with names and join dates
- [x] T006 Integration test: Empty squad displays "No members yet" message
- [x] T007 Integration test: Large squad (25 members) shows scrollable member list
- [x] T008 Integration test: Squad cards maintain current visual design (name, alias, member count, creation date)

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T009 Modify SquadsTab.tsx: Change grid layout to vertical stack (remove md:grid-cols-2 lg:grid-cols-3)
- [x] T010 Modify SquadsTab.tsx: Add member list display within each card
- [x] T011 Modify SquadsTab.tsx: Implement scrollable container for member lists
- [x] T012 Modify SquadsTab.tsx: Add empty state handling ("No members yet")
- [x] T013 Modify SquadsTab.tsx: Format and display member join dates
- [x] T014 Modify SquadsTab.tsx: Ensure mobile responsiveness (full-width cards)

## Phase 3.4: Integration
- [x] T015 Verify SquadsTab.tsx integrates with existing GET /api/squads endpoint
- [x] T016 Test member data fetching and error handling in SquadsTab.tsx

## Phase 3.5: Polish
- [x] T017 [P] Accessibility: Add proper ARIA labels for member information
- [x] T018 [P] Accessibility: Verify keyboard navigation with scrollable lists
- [x] T019 Performance: Validate page load times remain under 20ms target
- [x] T020 Performance: Test scrolling performance with 25-member lists
- [x] T021 [P] Update component documentation in SquadsTab.tsx
- [x] T022 Execute manual testing scenarios from quickstart.md
- [x] T023 Run existing E2E tests to ensure no regressions

## Dependencies
- Setup (T001-T003) before tests (T004-T008)
- Tests (T004-T008) before implementation (T009-T016)
- Implementation (T009-T016) before polish (T017-T023)
- T009-T014 are sequential (all modify same file: SquadsTab.tsx)
- T017-T018 can run in parallel with T019-T020

## Parallel Example
```
# Launch T016-T017 together:
Task: "Accessibility: Add proper ARIA labels for member information"
Task: "Accessibility: Verify keyboard navigation with scrollable lists"
```

## Notes
- [P] tasks = different concerns, no file conflicts
- All core implementation tasks modify the same file (SquadsTab.tsx) = sequential
- Verify integration tests fail before implementing UI changes
- Commit after each task completion
- Focus on UI-only changes - no backend modifications needed

## Task Generation Rules Applied
*Validated during generation*

1. **From Contracts**:
   - Existing GET /api/squads contract already tested - no new contract tests needed

2. **From Quickstart Scenarios**:
   - 4 manual testing scenarios → 5 integration tests (T004-T008)
   - Performance and accessibility requirements → polish tasks (T017-T022)

3. **From Research Decisions**:
   - Vertical stack layout → T008
   - Member list with scrollable container → T009-T010
   - Empty state handling → T011
   - Mobile responsiveness → T013

4. **Ordering**:
   - Setup → Tests → Core Implementation → Integration → Polish
   - UI component changes isolated to single file = sequential within core phase

## Validation Checklist
*GATE: Checked before completion*

- [x] All quickstart scenarios have corresponding integration tests
- [x] All UI changes isolated to SquadsTab.tsx (single component)
- [x] No backend changes required (existing API sufficient)
- [x] Tests come before implementation (TDD compliance)
- [x] Parallel tasks are truly independent (accessibility vs performance)
- [x] Each task specifies exact file path (SquadsTab.tsx for core changes)
- [x] No task modifies same file as another [P] task</content>
<parameter name="filePath">/Users/fseguerra/Projects/sprintCap/specs/015-stack-the-squad/tasks.md