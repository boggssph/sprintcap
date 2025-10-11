# Tasks: Add Jira Tickets to Sprints

**Input**: Design docum## Ph## Phase## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T013 Create TicketService with CRUD operations in `lib/services/ticketService.ts`
- [x] T014 Create ticket validation schema in `lib/validations/ticket.ts`
- [x] T015 API route GET /sprints/[sprintId]/tickets in `app/api/sprints/[sprintId]/tickets/route.ts`
- [x] T016 API route POST /sprints/[sprintId]/tickets in `app/api/sprints/[sprintId]/tickets/route.ts`
- [x] T017 API route GET /sprints/[sprintId]/tickets/[ticketId] in `app/api/sprints/[sprintId]/tickets/[ticketId]/route.ts`
- [x] T018 API route PUT /sprints/[sprintId]/tickets/[ticketId] in `app/api/sprints/[sprintId]/tickets/[ticketId]/route.ts`
- [x] T019 API route DELETE /sprints/[sprintId]/tickets/[ticketId] in `app/api/sprints/[sprintId]/tickets/[ticketId]/route.ts`
- [x] T020 API route GET /scrum-master/sprints/available in `app/api/scrum-master/sprints/available/route.ts`

## Phase 3.4: UI ComponentsImplementation (ONLY after tests are failing)
- [x] T013 Create TicketService with CRUD operations in `lib/services/ticketService.ts`
- [x] T014 Create ticket validation schema in `lib/validations/ticket.ts`
- [x] T015 API route GET /sprints/[sprintId]/tickets in `app/api/sprints/[sprintId]/tickets/route.ts`
- [x] T016 API route POST /sprints/[sprintId]/tickets in `app/api/sprints/[sprintId]/tickets/route.ts`
- [x] T017 API route GET /sprints/[sprintId]/tickets/[ticketId] in `app/api/sprints/[sprintId]/tickets/[ticketId]/route.ts`
- [x] T018 API route PUT /sprints/[sprintId]/tickets/[ticketId] in `app/api/sprints/[sprintId]/tickets/[ticketId]/route.ts`
- [x] T019 API route DELETE /sprints/[sprintId]/tickets/[ticketId] in `app/api/sprints/[sprintId]/tickets/[ticketId]/route.ts`
- [ ] T020 API route GET /scrum-master/sprints/available in `app/api/scrum-master/sprints/available/route.ts`Core Implementation (ONLY after tests are failing)
- [x] T013 Create TicketService with CRUD operations in `lib/services/ticketService.ts`
- [x] T014 Create ticket validation schema in `lib/validations/ticket.ts`
- [x] T015 API route GET /sprints/[sprintId]/tickets in `app/api/sprints/[sprintId]/tickets/route.ts`
- [x] T016 API route POST /sprints/[sprintId]/tickets in `app/api/sprints/[sprintId]/tickets/route.ts`
- [ ] T017 API route GET /sprints/[sprintId]/tickets/[ticketId] in `app/api/sprints/[sprintId]/tickets/[ticketId]/route.ts`rom `/specs/020-as-scrum-master/`
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
- **Web app**: `app/`, `components/`, `lib/`, `prisma/`, `tests/` at repository root
- Paths shown below follow the established Next.js App Router structure

## Phase 3.1: Setup
- [x] T001 Update Prisma schema with Ticket model in `prisma/schema.prisma`
- [x] T002 Generate and run database migration for Ticket table
- [x] T003 [P] Create TypeScript types for Ticket entity in `lib/types/ticket.ts`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test GET /sprints/{sprintId}/tickets in `tests/contract/test_sprints_tickets_get.spec.ts`
- [x] T005 [P] Contract test POST /sprints/{sprintId}/tickets in `tests/contract/test_sprints_tickets_post.spec.ts`
- [x] T006 [P] Contract test GET /sprints/{sprintId}/tickets/{ticketId} in `tests/contract/test_sprints_ticket_get.spec.ts`
- [x] T007 [P] Contract test PUT /sprints/{sprintId}/tickets/{ticketId} in `tests/contract/test_sprints_ticket_put.spec.ts`
- [x] T008 [P] Contract test DELETE /sprints/{sprintId}/tickets/{ticketId} in `tests/contract/test_sprints_ticket_delete.spec.ts`
- [x] T009 [P] Contract test GET /scrum-master/sprints/available in `tests/contract/test_scrum_master_sprints_available.spec.ts`
- [x] T010 [P] Integration test ticket creation workflow in `tests/integration/test_ticket_creation_flow.spec.ts`
- [x] T011 [P] Integration test duplicate prevention in `tests/integration/test_ticket_duplicate_prevention.spec.ts`
- [x] T012 [P] Integration test member assignment in `tests/integration/test_ticket_member_assignment.spec.ts`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T013 Create TicketService with CRUD operations in `lib/services/ticketService.ts`
- [x] T014 Create ticket validation schema in `lib/validations/ticket.ts`
- [ ] T015 API route GET /sprints/[sprintId]/tickets in `app/api/sprints/[sprintId]/tickets/route.ts`
- [ ] T016 API route POST /sprints/[sprintId]/tickets in `app/api/sprints/[sprintId]/tickets/route.ts`
- [ ] T017 API route GET /sprints/[sprintId]/tickets/[ticketId] in `app/api/sprints/[sprintId]/tickets/[ticketId]/route.ts`
- [ ] T018 API route PUT /sprints/[sprintId]/tickets/[ticketId] in `app/api/sprints/[sprintId]/tickets/[ticketId]/route.ts`
- [ ] T019 API route DELETE /sprints/[sprintId]/tickets/[ticketId] in `app/api/sprints/[sprintId]/tickets/[ticketId]/route.ts`
- [ ] T020 API route GET /scrum-master/sprints/available in `app/api/scrum-master/sprints/available/route.ts`

## Phase 3.4: UI Components
- [ ] T021 Create TicketForm component in `components/TicketForm.tsx`
- [ ] T022 Create TicketList component in `components/TicketList.tsx`
- [ ] T023 Create AddTicketDrawer component in `components/AddTicketDrawer.tsx`
- [ ] T024 Integrate ticket components into ScrumMasterDashboard in `app/dashboard/scrum-master/page.tsx`
- [ ] T025 Update SprintList to show tickets in `components/SprintList.tsx`

## Phase 3.5: Integration & Middleware
- [ ] T026 Add Scrum Master authorization middleware for ticket routes
- [ ] T027 Implement squad membership validation for ticket operations
- [ ] T028 Add error handling and logging for ticket operations

## Phase 3.6: Polish
- [ ] T029 [P] Unit tests for TicketService in `tests/unit/services/test_ticketService.spec.ts`
- [ ] T030 [P] Unit tests for ticket validation in `tests/unit/validations/test_ticket.spec.ts`
- [ ] T031 [P] Unit tests for ticket components in `tests/unit/components/test_ticket_components.spec.ts`
- [ ] T032 E2E test complete ticket creation flow in `e2e/ticket-creation-flow.spec.ts`
- [ ] T033 E2E test ticket management in sprint view in `e2e/ticket-management.spec.ts`
- [ ] T034 Performance validation for ticket operations
- [ ] T035 Update API documentation in `docs/API.md`
- [ ] T036 Run manual testing scenarios from quickstart.md

## Dependencies
- Setup (T001-T003) before all other tasks
- Tests (T004-T012) before implementation (T013-T028)
- T001 blocks T013 (database schema needed for service)
- T013 blocks T015-T020 (service needed for API routes)
- T014 blocks T013 (validation needed for service)
- T021-T025 can run in parallel after T013-T020
- T026-T028 depend on T015-T020 (API routes needed for middleware)
- Implementation (T013-T028) before polish (T029-T036)

## Parallel Example
```
# Launch T004-T012 together (all contract and integration tests):
Task: "Contract test GET /sprints/{sprintId}/tickets in tests/contract/test_sprints_tickets_get.spec.ts"
Task: "Contract test POST /sprints/{sprintId}/tickets in tests/contract/test_sprints_tickets_post.spec.ts"
Task: "Contract test GET /sprints/{sprintId}/tickets/{ticketId} in tests/contract/test_sprints_ticket_get.spec.ts"
Task: "Contract test PUT /sprints/{sprintId}/tickets/{ticketId} in tests/contract/test_sprints_ticket_put.spec.ts"
Task: "Contract test DELETE /sprints/{sprintId}/tickets/{ticketId} in tests/contract/test_sprints_ticket_delete.spec.ts"
Task: "Contract test GET /scrum-master/sprints/available in tests/contract/test_scrum_master_sprints_available.spec.ts"
Task: "Integration test ticket creation workflow in tests/integration/test_ticket_creation_flow.spec.ts"
Task: "Integration test duplicate prevention in tests/integration/test_ticket_duplicate_prevention.spec.ts"
Task: "Integration test member assignment in tests/integration/test_ticket_member_assignment.spec.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Follow TDD: write failing tests first, then implement
- Use existing patterns from codebase (auth middleware, error handling, validation)
- All ticket operations require Scrum Master role and squad membership validation