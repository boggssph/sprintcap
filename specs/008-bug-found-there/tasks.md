# Tasks: Squad Member Display Bug Fix

**Input## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: Contract tests exist but MUST FAIL until implementation is complete**
- [x] T004 [P] Implement squad-members.contract.test.ts to validate API contract
- [x] T005 [P] Add integration test for member filtering in test/integration/
- [x] T006 [P] Add unit test for SprintCreationForm member display logic

## Phase 3.3: Core Implementation (ONLY after tests are failing)ign documents from `/specs/008-bug-found-there/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: Next.js App Router, TypeScript 5.x, Prisma + PostgreSQL, shadcn/ui, NextAuth
2. Load design documents:
   → data-model.md: Squad/Member entities, one-to-many relationship, active filtering
   → contracts/: squad-members-api.yaml, squad-members.contract.test.ts
   → quickstart.md: Filtering validation, loading states, error handling
3. Generate tasks by category:
   → Setup: Project structure verification
   → Tests: Contract tests (already exist, need implementation to pass)
   → Core: API endpoint, frontend member filtering
   → Integration: Auth validation, database queries
   → Polish: Unit tests, performance validation, quickstart testing
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → Contract tests implemented and passing?
   → API endpoint returns filtered members?
   → Frontend shows correct member list?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `app/api/`, `components/`, `lib/`
- **Tests**: `specs/[feature]/contracts/`, `test/`

## Phase 3.1: Setup
- [x] T001 Verify project structure matches implementation plan
- [~] T002 Confirm database schema has Squad and Member tables with relationships - SCHEMA DISCREPANCY: No isActive field on SquadMember
- [x] T003 [P] Validate existing dependencies (Prisma, NextAuth, shadcn/ui)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: Contract tests exist but MUST FAIL until implementation is complete**
- [x] T004 [P] Implement squad-members.contract.test.ts to validate API contract
- [x] T005 [P] Add integration test for member filtering in test/integration/
- [ ] T006 [P] Add unit test for SprintCreationForm member display logic

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T007 Create GET /api/squads/[id]/members/route.ts with authentication
- [x] T008 Implement squad ownership validation in API endpoint
- [x] T009 Add Prisma query for active members by squad ID
- [x] T010 Return formatted response with members array and squad summary
- [ ] T011 Modify components/SprintCreationForm.tsx to fetch filtered members
- [ ] T012 Add loading state to Members section with spinner
- [ ] T013 Add error handling with retry button for API failures
- [ ] T014 Display "No Members Found" for empty squads
- [ ] T015 Update member list on squad selection change

## Phase 3.4: Integration
- [ ] T016 Connect API to existing NextAuth session validation
- [ ] T017 Integrate with existing Prisma client and database connection
- [ ] T018 Add proper error logging using existing logger service
- [ ] T019 Ensure API response matches OpenAPI contract schema

## Phase 3.5: Polish
- [ ] T020 [P] Add unit tests for member filtering logic
- [ ] T021 [P] Add performance test for member loading (< 2 seconds)
- [ ] T022 [P] Update API documentation in docs/API.md
- [ ] T023 Run quickstart.md validation scenarios
- [ ] T024 Test error recovery and loading states manually
- [ ] T025 Verify member counts in squad dropdown match actual filtered members

## Dependencies
- Tests (T004-T006) before implementation (T007-T015)
- T007 blocks T008-T010 (API implementation sequence)
- T011 blocks T012-T015 (frontend implementation sequence)
- T016-T019 can run after T010 (integration after core API)
- Implementation before polish (T020-T025)

## Parallel Example
```
# Launch T004-T006 together:
Task: "Implement squad-members.contract.test.ts to validate API contract"
Task: "Add integration test for member filtering in test/integration/"
Task: "Add unit test for SprintCreationForm member display logic"
```

## Notes
- [P] tasks = different files, no dependencies
- Contract tests already exist but will fail until API is implemented
- Focus on TDD: tests first, then implementation to make them pass
- Commit after each task completion
- Validate against quickstart.md scenarios

## Task Generation Rules Applied
*Validated during generation*

1. **From Contracts**:
   - squad-members.contract.test.ts → T004 contract test implementation
   - GET /api/squads/[id]/members → T007-T010 API implementation tasks
   
2. **From Data Model**:
   - Squad/Member entities → T009 Prisma query task
   - One-to-many relationship → filtering logic in T011-T015
   
3. **From User Stories**:
   - Squad selection filtering → T011, T015 integration tasks
   - Quickstart scenarios → T023-T025 validation tasks

4. **Ordering**:
   - Setup → Tests → API → Frontend → Integration → Polish
   - Dependencies prevent conflicts in parallel execution</content>
<parameter name="filePath">/Users/fseguerra/Projects/sprintCap/specs/008-bug-found-there/tasks.md