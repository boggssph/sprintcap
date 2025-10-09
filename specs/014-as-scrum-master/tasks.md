# Tasks: Squads Tab Redesign

**Input**: D## Phase 3.1: Setup
- [x] T001 Verify shadcn/ui Drawer component is installed and configured
- [x] T002 [P] Configure TypeScript paths for component imports
- [x] T003 [P] Update Tailwind config for responsive drawer breakpointsn documents from `/specs/014-as-scrum-master/`
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
- **Web app**: `app/`, `components/`, `lib/`, `tests/`
- Paths shown below assume Next.js App Router structure per plan.md

## Phase 3.1: Setup
- [x] T001 Verify shadcn/ui Drawer component is installed and configured
- [ ] T002 [P] Configure TypeScript paths for component imports
- [ ] T003 [P] Update Tailwind config for responsive drawer breakpoints

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test GET /api/squads in tests/contract/test_squads_get.spec.ts
- [x] T005 [P] Contract test POST /api/squads in tests/contract/test_squads_post.spec.ts
- [ ] T006 [P] E2E test empty squads tab display in e2e/squads-empty-state.spec.ts
- [ ] T007 [P] E2E test drawer opens on create button click in e2e/squads-drawer-open.spec.ts
- [ ] T008 [P] E2E test successful squad creation flow in e2e/squads-creation-success.spec.ts
- [ ] T009 [P] E2E test inline error messages on creation failure in e2e/squads-creation-error.spec.ts
- [ ] T010 [P] E2E test navigation confirmation dialog in e2e/squads-navigation-guard.spec.ts
- [ ] T011 [P] E2E test mobile full-screen drawer behavior in e2e/squads-mobile-drawer.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T012 [P] Create EmptyState component in components/EmptyState.tsx
- [ ] T013 [P] Create SquadCreationDrawer component in components/SquadCreationDrawer.tsx
- [ ] T014 [P] Create SquadsTab component in components/SquadsTab.tsx
- [ ] T015 Update scrum-master dashboard page in app/dashboard/scrum-master/page.tsx
- [ ] T016 [P] Add form validation schema in lib/validations/squad.ts
- [ ] T017 [P] Add navigation guard hook in hooks/use-navigation-guard.ts

## Phase 3.4: Integration
- [ ] T018 Integrate SquadCreationDrawer with existing SquadForm component
- [ ] T019 Connect drawer state management with form validation
- [ ] T020 Implement confirmation dialog for navigation away from open drawer
- [ ] T021 Add mobile responsive behavior for drawer component

## Phase 3.5: Polish
- [ ] T022 [P] Unit tests for EmptyState component in tests/unit/components/EmptyState.test.tsx
- [ ] T023 [P] Unit tests for SquadCreationDrawer component in tests/unit/components/SquadCreationDrawer.test.tsx
- [ ] T024 [P] Unit tests for SquadsTab component in tests/unit/components/SquadsTab.test.tsx
- [ ] T025 [P] Unit tests for navigation guard hook in tests/unit/hooks/use-navigation-guard.test.ts
- [ ] T026 Performance optimization: verify <20ms page load target
- [ ] T027 [P] Update component documentation in docs/components.md
- [ ] T028 Accessibility audit: verify WCAG AA compliance
- [ ] T029 [P] Add data-testid selectors for E2E test stability

## Dependencies
- Setup (T001-T003) before all other tasks
- Tests (T004-T011) before implementation (T012-T021)
- T012-T014 can run in parallel (different component files)
- T015 depends on T012-T014 (dashboard page uses new components)
- T016-T017 can run in parallel with T012-T014
- T018-T021 depend on T012-T017 (integration tasks)
- Implementation (T012-T021) before polish (T022-T029)
- T022-T025 can run in parallel (different test files)

## Parallel Example
```
# Launch T004-T011 together (all E2E and contract tests):
Task: "Contract test GET /api/squads in tests/contract/test_squads_get.spec.ts"
Task: "Contract test POST /api/squads in tests/contract/test_squads_post.spec.ts"
Task: "E2E test empty squads tab display in e2e/squads-empty-state.spec.ts"
Task: "E2E test drawer opens on create button click in e2e/squads-drawer-open.spec.ts"
Task: "E2E test successful squad creation flow in e2e/squads-creation-success.spec.ts"
Task: "E2E test inline error messages on creation failure in e2e/squads-creation-error.spec.ts"
Task: "E2E test navigation confirmation dialog in e2e/squads-navigation-guard.spec.ts"
Task: "E2E test mobile full-screen drawer behavior in e2e/squads-mobile-drawer.spec.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing (TDD approach)
- Commit after each task completion
- Existing Squad entity and API endpoints are reused (no new backend implementation needed)
- Focus on UI/UX implementation using existing shadcn/ui Drawer component
- Mobile-first responsive design with full-screen drawer on small screens
- All components must include proper TypeScript types and accessibility attributes