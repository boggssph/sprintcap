# Tasks: Sprints Tab Display

**Input**: Design documents from `/specs/018-the-sprints-tab/`
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
- **Web app**: `app/`, `components/`, `lib/`, `prisma/`, `test/`, `e2e/`
- All paths are absolute from repository root

## Phase 3.1: Setup
- [ ] T001 Extend Prisma schema with Sprint model in prisma/schema.prisma
- [ ] T002 Generate and run database migration for Sprint model

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T003 [P] Contract test GET /api/sprints in tests/contract/test_sprints_get.spec.ts
- [ ] T004 [P] Contract test POST /api/sprints in tests/contract/test_sprints_post.spec.ts
- [ ] T005 [P] Integration test sprint tab navigation in tests/integration/sprint-tab-navigation.test.ts
- [ ] T006 [P] Integration test squad cards display in tests/integration/sprint-cards-display.test.ts
- [ ] T007 [P] Integration test sprint creation flow in tests/integration/sprint-creation-flow.test.ts
- [ ] T008 [P] Integration test empty state handling in tests/integration/sprint-empty-state.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T009 [P] Sprint model and validation in lib/validations/sprintValidation.ts
- [ ] T010 Sprint service with business logic in lib/services/sprintService.ts
- [ ] T011 GET /api/sprints endpoint in app/api/sprints/route.ts
- [ ] T012 POST /api/sprints endpoint in app/api/sprints/route.ts
- [ ] T013 SprintList component in components/SprintList.tsx
- [ ] T014 SprintCard component in components/SprintCard.tsx
- [ ] T015 SprintCreationDrawer component in components/SprintCreationDrawer.tsx
- [ ] T016 Add Sprints tab to dashboard in app/dashboard/page.tsx

## Phase 3.4: Integration
- [ ] T017 Connect sprint queries to database via Prisma
- [ ] T018 Implement Scrum Master permission checks
- [ ] T019 Add active sprint determination logic
- [ ] T020 Implement sprint ordering (active first, then by start date)

## Phase 3.5: Polish
- [ ] T021 [P] Unit tests for SprintList component in test/unit/components/SprintList.test.tsx
- [ ] T022 [P] Unit tests for SprintCard component in test/unit/components/SprintCard.test.tsx
- [ ] T023 [P] Unit tests for SprintCreationDrawer component in test/unit/components/SprintCreationDrawer.test.tsx
- [ ] T024 [P] Unit tests for sprintService in test/unit/services/sprintService.test.ts
- [ ] T025 [P] Unit tests for sprint validation in test/unit/validations/sprintValidation.test.ts
- [ ] T026 [P] E2E test sprint tab display in e2e/sprint-tab-display.spec.ts
- [ ] T027 [P] E2E test sprint creation flow in e2e/sprint-creation-flow.spec.ts
- [ ] T028 Performance validation (<20ms page load)
- [ ] T029 Accessibility testing (WCAG AA compliance)
- [ ] T030 Responsive design validation across screen sizes

## Dependencies
- Setup (T001-T002) before everything
- Tests (T003-T008) before implementation (T009-T016)
- T009 blocks T010, T017-T020
- T010 blocks T011-T012
- T011-T012 blocks T016
- T013-T015 blocks T016, T021-T023
- Implementation (T009-T020) before polish (T021-T030)

## Parallel Example
```
# Launch T003-T008 together (all test creation tasks):
Task: "Contract test GET /api/sprints in tests/contract/test_sprints_get.spec.ts"
Task: "Contract test POST /api/sprints in tests/contract/test_sprints_post.spec.ts"
Task: "Integration test sprint tab navigation in tests/integration/sprint-tab-navigation.test.ts"
Task: "Integration test squad cards display in tests/integration/sprint-cards-display.test.ts"
Task: "Integration test sprint creation flow in tests/integration/sprint-creation-flow.test.ts"
Task: "Integration test empty state handling in tests/integration/sprint-empty-state.test.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Follow TDD: red → green → refactor
- All components must use shadcn/ui exclusively
- Maintain responsive design and accessibility standards

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task

2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks

3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (2/2)
- [x] All entities have model tasks (1/1)
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task