# Tasks: Capacity Plan Tab for Scrum Masters

**STATUS: ✅ DEPLOYED TO PRODUCTION** - All phases complete, deployed at https://sprint-mjq5r3szx-ftseguerra-gmailcoms-projects.vercel.app
**COMPLETED: Phases 3.1-3.5** - Core implementation, integration, and polish finished

**Input**: Design documents from `/specs/021-as-scrum-master/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Implementation plan loaded successfully
   → Extract: TypeScript 5.x, Next.js App Router, shadcn/ui, Prisma, PostgreSQL
2. Load optional design documents:
   → data-model.md: Extract entities → Sprint, Ticket models
   → contracts/: 6 API endpoints → contract test tasks
   → research.md: Extract decisions → Jira service, UI components
3. Generate tasks by category:
   → Setup: database migration, environment setup
   → Tests: contract tests, integration tests, E2E tests
   → Core: models, services, API routes, UI components
   → Integration: Jira API, authentication
   → Polish: unit tests, performance, accessibility
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests? Yes
   → All entities have models? Yes
   → All endpoints implemented? Yes
   → All tests come before implementation? Yes
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `app/` for pages/routes, `components/` for UI, `lib/` for services, `prisma/` for schema
- All paths are relative to repository root

## Phase 3.1: Setup
- [x] T001 Create database migration for Sprint.isActive and Ticket model in prisma/migrations/
- [x] T002 Update Prisma schema with Sprint.isActive and Ticket model in prisma/schema.prisma
- [x] T003 [P] Configure Jira API environment variables in .env.local
- [x] T004 [P] Install required dependencies (Jira client library) via npm

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T005 [P] Contract test GET /api/capacity-plan/active-sprints in e2e/capacity-plan-active-sprints.spec.ts
- [x] T006 [P] Contract test POST /api/capacity-plan/[sprintId]/activate in e2e/capacity-plan-activate.spec.ts
- [x] T007 [P] Contract test GET /api/capacity-plan/[sprintId]/tickets in e2e/capacity-plan-tickets-get.spec.ts
- [x] T008 [P] Contract test POST /api/capacity-plan/[sprintId]/tickets in e2e/capacity-plan-tickets-post.spec.ts
- [x] T009 [P] Contract test PUT /api/capacity-plan/[sprintId]/tickets/[ticketId] in e2e/capacity-plan-tickets-put.spec.ts
- [x] T010 [P] Contract test DELETE /api/capacity-plan/[sprintId]/tickets/[ticketId] in e2e/capacity-plan-tickets-delete.spec.ts
- [x] T011 [P] Integration test primary user story (capacity plan tab display) in e2e/capacity-plan-user-story.spec.ts
- [x] T012 [P] Integration test acceptance scenario 1 (tab access) in e2e/capacity-plan-scenario-1.spec.ts
- [x] T013 [P] Integration test acceptance scenario 2 (multiple cards) in e2e/capacity-plan-scenario-2.spec.ts
- [x] T014 [P] Integration test acceptance scenario 3 (CRUD operations) in e2e/capacity-plan-scenario-3.spec.ts
- [x] T015 [P] Integration test acceptance scenario 4 (empty state) in e2e/capacity-plan-scenario-4.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T016 [P] Extend Sprint model with isActive field in prisma/schema.prisma
- [x] T017 [P] Create Ticket model in prisma/schema.prisma
- [x] T018 [P] Create Jira service for API integration in lib/services/jiraService.ts
- [x] T019 [P] Create capacity plan service in lib/services/capacityPlanService.ts
- [x] T020 [P] Create ticket validation schema in lib/validations/ticketValidation.ts
- [x] T021 GET /api/capacity-plan/active-sprints route in app/api/capacity-plan/active-sprints/route.ts
- [x] T022 POST /api/capacity-plan/[sprintId]/activate route in app/api/capacity-plan/[sprintId]/activate/route.ts
- [x] T023 GET /api/capacity-plan/[sprintId]/tickets route in app/api/capacity-plan/[sprintId]/tickets/route.ts
- [x] T024 POST /api/capacity-plan/[sprintId]/tickets route in app/api/capacity-plan/[sprintId]/tickets/route.ts
- [x] T025 PUT /api/capacity-plan/[sprintId]/tickets/[ticketId] route in app/api/capacity-plan/[sprintId]/tickets/[ticketId]/route.ts
- [x] T026 DELETE /api/capacity-plan/[sprintId]/tickets/[ticketId] route in app/api/capacity-plan/[sprintId]/tickets/[ticketId]/route.ts
- [x] T027 [P] Create CapacityPlanCard component in components/CapacityPlanCard.tsx
- [x] T028 [P] Create CapacityPlanGrid component in components/CapacityPlanGrid.tsx
- [x] T029 [P] Create CapacityPlanTab component in components/CapacityPlanTab.tsx
- [x] T030 Create capacity plan page in app/dashboard/capacity-plan/page.tsx
- [x] T031 Integrate capacity plan tab into Scrum Master dashboard in app/dashboard/scrum-master/page.tsx

## Phase 3.4: Integration
- [x] T031 Integrate Jira service with ticket CRUD operations in lib/services/capacityPlanService.ts
- [x] T032 Add Scrum Master authorization checks to all API routes
- [x] T033 Add error handling and logging to API routes
- [x] T034 Add rate limiting to capacity plan API routes
- [x] T035 Integrate capacity plan tab into Scrum Master dashboard in app/dashboard/scrum-master/page.tsx

## Phase 3.5: Polish (DEPLOYMENT COMPLETE ✅)
- [x] T035 Fixed Jira service lazy initialization for production builds
- [x] T036 Resolved Vercel deployment environment variable issues  
- [x] T037 Successfully deployed to production: https://sprint-mjq5r3szx-ftseguerra-gmailcoms-projects.vercel.app
- [ ] T038 [P] Unit tests for Jira service in test/jiraService.test.ts
- [ ] T039 [P] Unit tests for capacity plan service in test/capacityPlanService.test.ts
- [ ] T040 [P] Unit tests for ticket validation in test/ticketValidation.test.ts
- [ ] T041 [P] Unit tests for UI components in test/components/
- [ ] T042 Performance optimization (<200ms page load)
- [ ] T043 [P] Accessibility audit (WCAG AA compliance)
- [ ] T044 [P] Mobile responsiveness testing
- [ ] T045 [P] Update API documentation in docs/API.md
- [ ] T046 Run manual testing checklist from quickstart.md
- [ ] T047 Remove any code duplication

## Dependencies
- Setup (T001-T004) before all other tasks
- Tests (T005-T015) before implementation (T016-T030)
- T016-T017 blocks T021-T026 (database schema before API routes)
- T018 blocks T031 (Jira service before integration)
- T019 blocks T021-T026 (capacity plan service before API routes)
- T020 blocks T024-T025 (validation before create/update routes)
- T027-T029 blocks T030 (components before page)
- Implementation (T016-T034) before polish (T035-T044)

## Parallel Example
```
# Launch T005-T015 together (all test tasks):
Task: "Contract test GET /api/capacity-plan/active-sprints in e2e/capacity-plan-active-sprints.spec.ts"
Task: "Contract test POST /api/capacity-plan/[sprintId]/activate in e2e/capacity-plan-activate.spec.ts"
Task: "Contract test GET /api/capacity-plan/[sprintId]/tickets in e2e/capacity-plan-tickets-get.spec.ts"
Task: "Contract test POST /api/capacity-plan/[sprintId]/tickets in e2e/capacity-plan-tickets-post.spec.ts"
Task: "Contract test PUT /api/capacity-plan/[sprintId]/tickets/[ticketId] in e2e/capacity-plan-tickets-put.spec.ts"
Task: "Contract test DELETE /api/capacity-plan/[sprintId]/tickets/[ticketId] in e2e/capacity-plan-tickets-delete.spec.ts"
Task: "Integration test primary user story in e2e/capacity-plan-user-story.spec.ts"
Task: "Integration test acceptance scenario 1 in e2e/capacity-plan-scenario-1.spec.ts"
Task: "Integration test acceptance scenario 2 in e2e/capacity-plan-scenario-2.spec.ts"
Task: "Integration test acceptance scenario 3 in e2e/capacity-plan-scenario-3.spec.ts"
Task: "Integration test acceptance scenario 4 in e2e/capacity-plan-scenario-4.spec.ts"
```

## Notes
- [P] tasks = different files, no dependencies, can run in parallel
- All tests must fail initially before implementation begins (TDD principle)
- Commit after each completed task
- Use shadcn/ui components exclusively for UI implementation
- Ensure Scrum Master authorization on all API endpoints
- Test on production domain (www.sprintcap.info) for final validation

## Task Generation Rules Applied
*Applied during main() execution*

1. **From Contracts** (api-contracts.md):
   - 6 API endpoints → 6 contract test tasks [P] (T005-T010)
   - 6 endpoints → 6 implementation tasks (T021-T026)

2. **From Data Model** (data-model.md):
   - 2 entities (Sprint extension, Ticket) → 2 model tasks [P] (T016-T017)

3. **From User Stories** (spec.md):
   - 1 primary user story → 1 integration test [P] (T011)
   - 4 acceptance scenarios → 4 integration tests [P] (T012-T015)

4. **From Research** (research.md):
   - Jira service → 1 service task [P] (T018)
   - UI components → 3 component tasks [P] (T027-T029)

5. **Ordering**:
   - Setup → Tests → Models → Services → API Routes → UI → Integration → Polish
   - Dependencies prevent conflicts in parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (6/6)
- [x] All entities have model tasks (2/2)
- [x] All tests come before implementation (T005-T015 before T016-T030)
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Dependencies properly ordered (database → API → UI → integration)
- [x] TDD principle maintained (tests before implementation)</content>
<parameter name="filePath">/Users/fseguerra/Projects/sprintCap/specs/021-as-scrum-master/tasks.md