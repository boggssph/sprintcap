# Tasks: Sprint Creation for Squads

**Input**: Design documents from `/specs/004-as-scrum-master/`
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
- **Web app**: `app/`, `prisma/`, `lib/`, `components/`, `pages/api/`
- Paths follow Next.js App Router structure per plan.md

## Phase 3.1: Setup
- [x] T001 Create database migration for Sprint and SprintMember models in prisma/migrations/
- [x] T002 Update Prisma schema with Sprint and SprintMember models in prisma/schema.prisma
- [x] T003 Generate and run Prisma client update for new models

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test POST /api/sprints in test/contract/sprints.contract.test.ts
- [x] T005 [P] Contract test GET /api/sprints in test/contract/sprints-list.contract.test.ts
- [x] T006 [P] Contract test GET /api/sprints/{id} in test/contract/sprints-detail.contract.test.ts
- [x] T007 [P] Integration test happy path sprint creation in test/integration/sprint-creation.integration.test.ts
- [x] T008 [P] Integration test overlap prevention in test/integration/sprint-overlap.integration.test.ts
- [x] T009 [P] Integration test empty squad handling in test/integration/empty-squad.integration.test.ts
- [x] T010 [P] Integration test date validation in test/integration/date-validation.integration.test.ts
- [x] T011 [P] Integration test authorization in test/integration/sprint-authorization.integration.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T012 [P] Sprint model validation in lib/validations/sprint.ts
- [x] T013 [P] Sprint service with business logic in lib/services/sprintService.ts
- [x] T014 [P] SprintMember service for member management in lib/services/sprintMemberService.ts
- [x] T015 POST /api/sprints endpoint implementation in pages/api/sprints.ts
- [x] T016 GET /api/sprints endpoint implementation in pages/api/sprints.ts
- [x] T017 GET /api/sprints/[id] endpoint implementation in pages/api/sprints/[id].ts
- [x] T018 SprintCreationForm component implementation
- [x] T019 SprintList component implementation

## Phase 3.4: Integration
- [x] T020 Connect sprint services to Prisma database client in lib/services/sprintService.ts
- [x] T021 Add authentication middleware to sprint endpoints in pages/api/sprints.ts
- [x] T022 Add authorization checks for Scrum Master role in lib/services/sprintService.ts
- [x] T023 Integrate sprint creation form into Scrum Master dashboard in app/(admin)/scrum-master/page.tsx

## Phase 3.5: Polish
- [ ] T024 [P] Unit tests for date validation logic in test/unit/date-validation.test.ts
- [ ] T025 [P] Unit tests for overlap detection in test/unit/overlap-detection.test.ts
- [ ] T026 [P] Unit tests for sprint service methods in test/unit/sprint-service.test.ts
- [ ] T027 Performance tests for sprint creation (<500ms) in test/performance/sprint-creation.perf.test.ts
- [ ] T028 [P] Update API documentation in docs/API.md
- [ ] T029 [P] Add sprint creation user documentation in docs/scrum-master-guide.md
- [ ] T030 Run quickstart test scenarios manually in quickstart.md
- [x] T031 Add error handling and user-friendly messages in components/SprintCreationForm.tsx

## Dependencies
- Setup (T001-T003) before all other tasks
- Tests (T004-T011) before implementation (T012-T019)
- Core implementation (T012-T019) before integration (T020-T023)
- Integration (T020-T023) before polish (T024-T031)
- T012 blocks T013, T014 (validation needed for services)
- T013 blocks T015-T017 (service needed for endpoints)
- T015-T017 blocks T020-T022 (endpoints needed for integration)
- T018-T019 blocks T023 (components needed for dashboard integration)

## Parallel Example
```
# Launch T004-T011 together (all test tasks are independent):
Task: "Contract test POST /api/sprints in test/contract/sprints.contract.test.ts"
Task: "Contract test GET /api/sprints in test/contract/sprints-list.contract.test.ts"
Task: "Contract test GET /api/sprints/{id} in test/contract/sprints-detail.contract.test.ts"
Task: "Integration test happy path sprint creation in test/integration/sprint-creation.integration.test.ts"
Task: "Integration test overlap prevention in test/integration/sprint-overlap.integration.test.ts"
Task: "Integration test empty squad handling in test/integration/empty-squad.integration.test.ts"
Task: "Integration test date validation in test/integration/date-validation.integration.test.ts"
Task: "Integration test authorization in test/integration/sprint-authorization.integration.test.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing (TDD approach)
- Commit after each task completion
- All endpoints share the same base file (pages/api/sprints.ts) so not marked [P]
- Database migration must complete before any implementation
- Authentication and authorization are critical security requirements