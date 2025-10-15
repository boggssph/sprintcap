# Tasks: Scrum Master Member Hours Input Table

**Input**: Design documents from `/specs/024-as-scrum-master/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

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
- **Web app**: `app/`, `components/`, `prisma/`, `tests/`
- Paths based on plan.md structure

## Phase 3.1: Setup
- [x] T001 Update Prisma schema with MemberHours model in prisma/schema.prisma
- [x] T002 Generate and run database migration for MemberHours

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T003 [P] Contract test GET /api/member-hours in specs/024-as-scrum-master/contracts/get-member-hours.contract.test.ts
- [x] T004 [P] Contract test PUT /api/member-hours in specs/024-as-scrum-master/contracts/put-member-hours.contract.test.ts
- [x] T005 [P] Integration test table display in e2e/member-hours-table-display.spec.ts
- [x] T006 [P] Integration test valid input auto-save in e2e/member-hours-valid-input.spec.ts
- [x] T007 [P] Integration test blank input handling in e2e/member-hours-blank-input.spec.ts
- [x] T008 [P] Integration test invalid input prevention in e2e/member-hours-invalid-input.spec.ts
- [x] T009 [P] Integration test decimal precision in e2e/member-hours-decimal-precision.spec.ts
- [x] T010 [P] Integration test sprint isolation in e2e/member-hours-sprint-isolation.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T011 Create MemberHours API route GET /api/member-hours in app/api/member-hours/route.ts
- [x] T012 Create MemberHours API route PUT /api/member-hours in app/api/member-hours/route.ts
- [x] T013 Create MemberHoursTable component in components/MemberHoursTable.tsx
- [x] T014 Integrate MemberHoursTable into Capacity tab in app/dashboard/capacity-plan/page.tsx

## Phase 3.4: Integration
- [x] T015 Add authentication checks to member-hours API routes
- [x] T016 Add database connection and Prisma client usage in API routes
- [x] T017 Add error handling and validation in API routes

## Phase 3.5: Polish
- [x] T018 [P] Unit tests for MemberHoursTable component in tests/unit/components/MemberHoursTable.test.tsx
- [x] T019 [P] Unit tests for member-hours API routes in tests/unit/api/member-hours.test.ts
- [x] T020 Performance validation (<500ms save time)
- [x] T021 Update API documentation in docs/API.md
- [x] T022 Run E2E tests and validate all scenarios pass

## Dependencies
- Setup (T001-T002) before everything
- Tests (T003-T010) before implementation (T011-T017)
- T011 blocks T012 (same file)
- T013 blocks T014
- Implementation (T011-T017) before polish (T018-T022)

## Parallel Example
```
# Launch T003-T010 together:
Task: "Contract test GET /api/member-hours in specs/024-as-scrum-master/contracts/get-member-hours.contract.test.ts"
Task: "Contract test PUT /api/member-hours in specs/024-as-scrum-master/contracts/put-member-hours.contract.test.ts"
Task: "Integration test table display in e2e/member-hours-table-display.spec.ts"
Task: "Integration test valid input auto-save in e2e/member-hours-valid-input.spec.ts"
Task: "Integration test blank input handling in e2e/member-hours-blank-input.spec.ts"
Task: "Integration test invalid input prevention in e2e/member-hours-invalid-input.spec.ts"
Task: "Integration test decimal precision in e2e/member-hours-decimal-precision.spec.ts"
Task: "Integration test sprint isolation in e2e/member-hours-sprint-isolation.spec.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
- Each contract file → contract test task [P]
- Each entity → model creation task [P]
- Each endpoint → implementation task (sequential for same file)
- Each user story → integration test [P]
- Different files = parallel [P]
- Same file = sequential