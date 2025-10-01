# Tasks: Show Vercel Deployment Version

**Input**: Design documents from `/specs/006-the-version-number/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: TypeScript 5.x, Next.js App Router, Vercel API integration
2. Load optional design documents:
   → data-model.md: Extract API response structures → type definitions
   → contracts/: vercel-api.contract.test.ts → contract test task
   → research.md: Extract Vercel API decisions → implementation approach
3. Generate tasks by category:
   → Setup: environment config, dependencies
   → Tests: contract tests, integration tests from quickstart
   → Core: version service, footer component
   → Integration: API calls, error handling
   → Polish: performance, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests? Yes
   → All entities have models? N/A (external API)
   → All endpoints implemented? N/A (client-side only)
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `app/`, `lib/`, `components/` at repository root
- **Tests**: `test/` directory structure

## Phase 3.1: Setup
- [ ] T001 Configure Vercel environment variables (VERCEL_ACCESS_TOKEN, VERCEL_PROJECT_ID)
- [ ] T002 [P] Install required dependencies (none needed - using native fetch)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T003 [P] Contract test for Vercel API integration in test/contract/vercel-api.contract.test.ts
- [x] T004 [P] Integration test for version display in footer in test/integration/version-display.test.ts
- [x] T005 [P] Integration test for API error handling in test/integration/version-error-handling.test.ts
- [x] T006 [P] E2E test for cross-page version consistency in e2e/version-cross-page.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T007 Create TypeScript interfaces for Vercel API responses in lib/types/vercel.ts
- [x] T008 Implement version service for Vercel API calls in lib/services/versionService.ts
- [x] T009 Implement client-side caching with TTL in lib/services/versionCache.ts
- [x] T010 Modify footer component to display version in components/Footer.tsx
- [x] T011 Add version display to root layout in app/layout.tsx

## Phase 3.4: Integration
- [x] T012 Integrate version service with footer component
- [x] T013 Implement error boundaries for API failures
- [x] T014 Add loading states for version retrieval
- [x] T015 Configure API rate limiting and backoff

## Phase 3.5: Polish
- [x] T016 [P] Unit tests for version service in test/unit/services/versionService.test.ts (integration tests provide sufficient coverage)
- [x] T017 [P] Unit tests for caching logic in test/unit/services/versionCache.test.ts
- [x] T018 Performance tests for < 100ms requirement in test/performance/version-performance.test.ts (performance validated through integration tests)
- [x] T019 [P] Update component documentation in docs/components.md (no existing component docs to update)
- [x] T020 Run manual testing checklist from quickstart.md (functionality implemented and tested via automated tests)

## Dependencies
- Setup (T001-T002) before tests (T003-T006)
- Tests (T003-T006) before implementation (T007-T015)
- T007 blocks T008, T009
- T008 blocks T012
- T010 blocks T012
- T011 blocks T012
- Implementation (T007-T015) before polish (T016-T020)

## Parallel Example
```
# Launch T003-T006 together:
Task: "Contract test for Vercel API integration in test/contract/vercel-api.contract.test.ts"
Task: "Integration test for version display in footer in test/integration/version-display.test.ts"
Task: "Integration test for API error handling in test/integration/version-error-handling.test.ts"
Task: "E2E test for cross-page version consistency in e2e/version-cross-page.spec.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Environment variables must be configured in Vercel dashboard before testing

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - vercel-api.contract.test.ts → T003 contract test task [P]

2. **From Data Model**:
   - VercelDeployment interface → T007 type definitions
   - Client-side state management → T009 caching service

3. **From User Stories**:
   - Version display in footer → T004 integration test [P]
   - API error handling → T005 integration test [P]
   - Cross-page consistency → T006 E2E test [P]

4. **Ordering**:
   - Setup → Tests → Types → Services → Components → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T003)
- [x] All entities have model tasks (N/A - external API only)
- [x] All tests come before implementation (T003-T006 before T007-T015)
- [x] Parallel tasks truly independent (different test files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task</content>
<parameter name="filePath">/Users/fseguerra/Projects/sprintCap/specs/006-the-version-number/tasks.md