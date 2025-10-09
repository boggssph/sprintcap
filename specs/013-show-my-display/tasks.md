# Tasks: Display Name and Profile Picture

**Input**: Design documents from `/specs/013-show-my-display/`
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
- **Web app**: `app/`, `components/`, `lib/`, `e2e/`
- Paths shown below assume web application structure - adjust based on plan.md structure

## Phase 3.1: Setup
- [x] T001 Validate existing API contracts meet requirements in `/specs/013-show-my-display/contracts/profile-api.contract.md`
- [x] T002 [P] Configure test data helpers for authenticated user scenarios in `e2e/test-helpers/auth.ts`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T003 [P] Contract test GET /api/user/profile returns user data in `e2e/contracts/profile-get.contract.spec.ts`
- [ ] T004 [P] Contract test PUT /api/user/profile updates display name in `e2e/contracts/profile-update.contract.spec.ts`
- [ ] T005 [P] Contract test PUT /api/user/profile rejects empty display name in `e2e/contracts/profile-validation-empty.contract.spec.ts`
- [ ] T006 [P] Contract test PUT /api/user/profile rejects display name too short in `e2e/contracts/profile-validation-short.contract.spec.ts`
- [ ] T007 [P] Contract test PUT /api/user/profile rejects display name too long in `e2e/contracts/profile-validation-long.contract.spec.ts`
- [ ] T008 [P] Contract test PUT /api/user/profile requires authentication in `e2e/contracts/profile-auth.contract.spec.ts`
- [ ] T009 [P] Integration test user can see display name next to profile picture in `e2e/display-name-visible.spec.ts`
- [ ] T010 [P] Integration test display name is hidden on mobile devices in `e2e/display-name-mobile.spec.ts`
- [ ] T011 [P] Integration test user can edit display name via pencil icon in `e2e/display-name-edit.spec.ts`
- [ ] T012 [P] Integration test display name validation prevents invalid input in `e2e/display-name-validation.spec.ts`
- [ ] T013 [P] Integration test network errors are handled gracefully in `e2e/display-name-network-error.spec.ts`
- [ ] T014 [P] Integration test display name updates persist across page navigation in `e2e/display-name-session-update.spec.ts`
- [ ] T015 [P] Integration test fallback to Google name when display name not set in `e2e/display-name-fallback.spec.ts`
- [ ] T016 [P] Integration test display name is accessible to screen readers in `e2e/display-name-accessibility.spec.ts`
- [ ] T017 [P] Performance test display name loads within performance budget in `e2e/display-name-performance.spec.ts`
- [ ] T018 [P] Security test display name input prevents XSS attacks in `e2e/display-name-security.spec.ts`

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T019 [P] Create ProfileDisplay component for reusable profile display in `components/ProfileDisplay.tsx`
- [ ] T020 Update ScrumMasterHeader to include ProfileDisplay component in `components/ScrumMasterHeader.tsx`
- [ ] T021 Update MemberHeader to include ProfileDisplay component in `components/MemberHeader.tsx`
- [ ] T022 Adapt DisplayNameEditor for header integration in `components/DisplayNameEditor.tsx`

## Phase 3.4: Integration
- [ ] T023 Validate existing API endpoint meets contract requirements in `pages/api/user/profile.ts`
- [ ] T024 Ensure NextAuth session updates after display name changes in `lib/auth.ts`

## Phase 3.5: Polish
- [ ] T025 [P] Add unit tests for ProfileDisplay component in `test/components/ProfileDisplay.test.tsx`
- [ ] T026 [P] Add unit tests for display name validation logic in `test/lib/displayNameValidation.test.ts`
- [ ] T027 Update component documentation in `docs/components.md`
- [ ] T028 Run accessibility audit and fix any WCAG issues
- [ ] T029 Performance optimization for profile display loading

## Dependencies
- Tests (T003-T018) before implementation (T019-T022)
- T019 blocks T020, T021
- T022 depends on existing DisplayNameEditor
- Implementation before polish (T025-T029)

## Parallel Example
```
# Launch contract tests together:
Task: "Contract test GET /api/user/profile returns user data in e2e/contracts/profile-get.contract.spec.ts"
Task: "Contract test PUT /api/user/profile updates display name in e2e/contracts/profile-update.contract.spec.ts"
Task: "Contract test PUT /api/user/profile rejects empty display name in e2e/contracts/profile-validation-empty.contract.spec.ts"
Task: "Contract test PUT /api/user/profile rejects display name too short in e2e/contracts/profile-validation-short.contract.spec.ts"
Task: "Contract test PUT /api/user/profile rejects display name too long in e2e/contracts/profile-validation-long.contract.spec.ts"
Task: "Contract test PUT /api/user/profile requires authentication in e2e/contracts/profile-auth.contract.spec.ts"

# Launch integration tests together:
Task: "Integration test user can see display name next to profile picture in e2e/display-name-visible.spec.ts"
Task: "Integration test display name is hidden on mobile devices in e2e/display-name-mobile.spec.ts"
Task: "Integration test user can edit display name via pencil icon in e2e/display-name-edit.spec.ts"
Task: "Integration test display name validation prevents invalid input in e2e/display-name-validation.spec.ts"
Task: "Integration test network errors are handled gracefully in e2e/display-name-network-error.spec.ts"
Task: "Integration test display name updates persist across page navigation in e2e/display-name-session-update.spec.ts"
Task: "Integration test fallback to Google name when display name not set in e2e/display-name-fallback.spec.ts"
Task: "Integration test display name is accessible to screen readers in e2e/display-name-accessibility.spec.ts"
Task: "Performance test display name loads within performance budget in e2e/display-name-performance.spec.ts"
Task: "Security test display name input prevents XSS attacks in e2e/display-name-security.spec.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts</content>
<parameter name="filePath">/Users/fseguerra/Projects/sprintCap/specs/013-show-my-display/tasks.md