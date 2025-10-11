# Tasks: Squad Management Updates

**Input**: Design documents from `/specs/022-as-scrum-master/`
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
- **Web app**: `app/`, `components/`, `lib/`, `prisma/`, `tests/`
- Paths based on plan.md structure: Next.js App Router with Prisma

## Phase 3.1: Setup
- [x] T001 Update Prisma schema with ceremony default fields in prisma/schema.prisma
- [x] T002 Generate and run database migration for new squad fields
- [x] T003 Update Zod validation schemas for squad updates in lib/validations/

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test for PATCH /api/squads/[id] in specs/022-as-scrum-master/contracts/update-squad.contract.test.ts
- [x] T005 [P] Integration test: Update squad name and alias in tests/integration/test-squad-name-alias-update.spec.ts
- [x] T006 [P] Integration test: Configure ceremony time defaults in tests/integration/test-squad-ceremony-defaults.spec.ts
- [x] T007 [P] Integration test: Validation error handling in tests/integration/test-squad-validation-errors.spec.ts
- [x] T008 [P] Integration test: Partial updates in tests/integration/test-squad-partial-updates.spec.ts
- [ ] T009 [P] Integration test: Sprint creation with new defaults in tests/integration/test-squad-sprint-creation.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T010 Create ceremony calculation utilities in lib/ceremony-calculations.ts
- [ ] T011 Implement PATCH /api/squads/[id] endpoint in app/api/squads/[id]/route.ts
- [ ] T012 Update SquadFormFields component with ceremony defaults in components/SquadFormFields.tsx
- [ ] T013 Add ceremony defaults section to squad management UI in app/dashboard/squads/[id]/page.tsx

## Phase 3.4: Integration
- [ ] T014 Connect ceremony calculations to sprint creation logic in lib/sprint-utils.ts
- [ ] T015 Update sprint creation to use squad ceremony defaults
- [ ] T016 Add authorization checks for Scrum Master role in API routes

## Phase 3.5: Polish
- [ ] T017 [P] Unit tests for ceremony calculation utilities in tests/unit/test-ceremony-calculations.test.ts
- [ ] T018 [P] Unit tests for squad validation schemas in tests/unit/test-squad-validation.test.ts
- [ ] T019 Performance validation: API response times <150ms
- [ ] T020 [P] Update API documentation in docs/API.md
- [ ] T021 Accessibility audit: WCAG AA compliance for new form fields
- [ ] T022 Run quickstart.md manual test scenarios

## Dependencies
- Setup (T001-T003) before all other tasks
- Tests (T004-T009) before implementation (T010-T016)
- T001 blocks T002
- T010 blocks T014, T015
- T011 blocks T016
- Implementation (T010-T016) before polish (T017-T022)

## Parallel Example
```
# Launch T004-T009 together (all test tasks):
Task: "Contract test for PATCH /api/squads/[id] in specs/022-as-scrum-master/contracts/update-squad.contract.test.ts"
Task: "Integration test: Update squad name and alias in tests/integration/test-squad-name-alias-update.spec.ts"
Task: "Integration test: Configure ceremony time defaults in tests/integration/test-squad-ceremony-defaults.spec.ts"
Task: "Integration test: Validation error handling in tests/integration/test-squad-validation-errors.spec.ts"
Task: "Integration test: Partial updates in tests/integration/test-squad-partial-updates.spec.ts"
Task: "Integration test: Sprint creation with new defaults in tests/integration/test-squad-sprint-creation.spec.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing core features
- Commit after each task completion
- Database migration (T002) requires careful testing in staging
- Ceremony calculations must handle partial weeks correctly
- UI components must maintain responsive design and accessibility

## Task Generation Rules
- Each contract file → contract test task marked [P]
- Each entity field update → database migration task
- Each API endpoint → implementation task
- Each user story scenario → integration test task marked [P]
- Different files = can be parallel [P]
- Same file = sequential (no [P])
- Tests before implementation (TDD)
- Total: 22 tasks across 5 phases