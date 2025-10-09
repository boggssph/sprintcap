# Tasks: Update Create New Sprint Drawer

**Input**: Design documents from `/specs/019-the-create-new/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `app/`, `components/`, `lib/`
- Paths shown below assume web application structure per plan.md

## Phase 3.1: Setup
- [x] T001 Analyze existing SprintCreationDrawer and SquadCreationDrawer components for styling differences

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T002 [P] Integration test for drawer appearance and responsive behavior in test/integration/sprint-drawer-appearance.test.tsx
- [x] T003 [P] Integration test for dropdown behavior (closed by default) in test/integration/sprint-dropdown-behavior.test.tsx
- [x] T004 [P] Integration test for squad member display removal in test/integration/sprint-member-display.test.tsx
- [x] T005 [P] Integration test for form submission and success feedback in test/integration/sprint-form-submission.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T006 Update SprintCreationDrawer component styling to match SquadCreationDrawer (max-width, responsive behavior) in components/SprintCreationDrawer.tsx
- [x] T007 Modify dropdown behavior to remain closed until clicked in components/SprintCreationDrawer.tsx
- [x] T008 Remove squad member display logic from form in components/SprintCreationDrawer.tsx
- [x] T009 Ensure proper spacing and scroll behavior when content exceeds drawer height in components/SprintCreationDrawer.tsx

## Phase 3.4: Integration
- [x] T010 Verify drawer does not overlap with other page components in app/dashboard/scrum-master/page.tsx

## Phase 3.5: Polish
- [x] T011 [P] Unit tests for SprintCreationDrawer component behavior in test/unit/components/SprintCreationDrawer.test.tsx
- [x] T012 Run quickstart test scenarios to validate all acceptance criteria
- [x] T013 [P] Update component documentation if needed

## Dependencies
- Tests (T002-T005) before implementation (T006-T010)
- T006-T009 must be completed sequentially (same file: SprintCreationDrawer.tsx)
- T010 depends on T006-T009 completion
- Implementation before polish (T011-T013)

## Parallel Example
```
# Launch T002-T005 together:
Task: "Integration test for drawer appearance and responsive behavior in test/integration/sprint-drawer-appearance.test.tsx"
Task: "Integration test for dropdown behavior (closed by default) in test/integration/sprint-dropdown-behavior.test.tsx"
Task: "Integration test for squad member display removal in test/integration/sprint-member-display.test.tsx"
Task: "Integration test for form submission and success feedback in test/integration/sprint-form-submission.test.tsx"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- This is a UI-only feature with no new APIs, models, or services required

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Existing API contracts documented - no new contract tests needed

2. **From Data Model**:
   - Existing entities (Sprint, Squad) - no new model tasks needed

3. **From User Stories**:
   - Each acceptance scenario → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Component Updates → Integration → Polish
   - Sequential updates to same component file

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All acceptance scenarios have corresponding tests
- [x] Component update tasks properly sequenced
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task</content>
<parameter name="filePath">/Users/fseguerra/Projects/sprintCap/specs/019-the-create-new/tasks.md