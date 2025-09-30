# Tasks: Add Version Number Display

**Input**: Design documents from `/specs/005-add-a-version/`
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
- **Web app**: `app/`, `components/`, `lib/` at repository root
- Paths based on Next.js App Router structure from plan.md

## Phase 3.1: Setup
- [x] T001 Configure Vercel build command to inject NEXT_PUBLIC_VERSION environment variable
- [x] T002 [P] Create version utility function in lib/version.ts for version retrieval and fallback handling

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T003 [P] Unit test for version utility function in test/unit/lib/test_version.test.ts
- [x] T004 [P] Integration test for non-authenticated version display in test/integration/test_version_display_unauth.spec.ts
- [x] T005 [P] Integration test for authenticated version display in test/integration/test_version_display_auth.spec.ts
- [x] T006 [P] Integration test for version unavailable fallback in test/integration/test_version_fallback.spec.ts
- [x] T007 [P] Integration test for mobile responsive version display in test/integration/test_version_mobile.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T008 Modify app/page.tsx to display version below "Built with focus" text for non-authenticated users
- [x] T009 Modify app/page.tsx to display version below sign out button for authenticated users
- [x] T010 Add responsive font sizing (6px desktop, smaller mobile) to version display in app/page.tsx

## Phase 3.4: Integration
- [x] T011 Update Vercel deployment configuration to include version injection in vercel.json
- [x] T012 Test version injection in local development environment

## Phase 3.5: Polish
- [x] T013 [P] Add version display documentation to docs/README.md
- [x] T014 Performance validation: ensure version display renders in <100ms
- [x] T015 [P] Update quickstart.md with final validation steps
- [x] T016 Run full test suite and validate all acceptance criteria

## Dependencies
- Setup (T001-T002) before tests (T003-T007)
- Tests (T003-T007) before implementation (T008-T010)
- Implementation (T008-T010) before integration (T011-T012)
- Integration (T011-T012) before polish (T013-T016)
- T008, T009, T010 modify the same file (app/page.tsx) so must be sequential

## Parallel Example
```
# Launch T003-T007 together:
Task: "Unit test for version utility function in test/unit/lib/test_version.test.ts"
Task: "Integration test for non-authenticated version display in test/integration/test_version_display_unauth.spec.ts"
Task: "Integration test for authenticated version display in test/integration/test_version_display_auth.spec.ts"
Task: "Integration test for version unavailable fallback in test/integration/test_version_fallback.spec.ts"
Task: "Integration test for mobile responsive version display in test/integration/test_version_mobile.spec.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing core functionality
- Commit after each task completion
- Version display is UI-only, no API changes required
- Build configuration changes needed for version injection

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - No new API contracts - UI-only feature

2. **From Data Model**:
   - VersionInfo entity → version utility function (T002)

3. **From User Stories**:
   - 4 test scenarios from quickstart.md → 4 integration tests (T004-T007)
   - Non-authenticated display → T008
   - Authenticated display → T009
   - Mobile responsive → T010

4. **Ordering**:
   - Setup → Tests → Core Implementation → Integration → Polish
   - Same file modifications are sequential (app/page.tsx tasks)

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (N/A - no new contracts)
- [x] All entities have model tasks (VersionInfo → version utility)
- [x] All tests come before implementation (TDD approach)
- [x] Parallel tasks truly independent (different test files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task (only app/page.tsx sequential tasks)</content>
<parameter name="filePath">/Users/fseguerra/Projects/sprintCap/specs/005-add-a-version/tasks.md