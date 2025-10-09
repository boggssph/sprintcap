# Tasks: Redesign the Entire Project UI/UX

**Input**: Design documents from `/specs/011-redesign-the-entire/`
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
- **Web app**: `app/`, `components/`, `lib/`, `test/`
- Paths based on existing Next.js structure

## Phase 3.1: Setup
- [X] T001 Setup shadcn MCP server and audit current components per quickstart.md
- [X] T002 [P] Configure performance monitoring tools for load time tracking

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [X] T003 [P] Contract test for Button component in test/contract/test_button.contract.test.tsx
- [ ] T004 [P] Contract test for Input component in test/contract/test_input_component.ts
- [ ] T005 [P] Contract test for Card component in test/contract/test_card_component.ts
- [ ] T006 [P] Contract test for NavigationMenu component in test/contract/test_navigation_component.ts
- [ ] T007 [P] Contract test for Form components in test/contract/test_form_components.ts
- [ ] T008 [P] E2E test for dashboard load time <20ms in e2e/test_dashboard_performance.spec.ts
- [ ] T009 [P] E2E test for mobile responsiveness in e2e/test_mobile_responsiveness.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T010 Redesign Scrum Master dashboard in app/dashboard/scrum-master/page.tsx
- [ ] T011 Redesign Member dashboard in app/dashboard/member/page.tsx
- [ ] T012 Redesign Admin panel in app/admin/page.tsx
- [ ] T013 Update SprintCreationForm component in components/SprintCreationForm.tsx
- [ ] T014 Update SprintList component in components/SprintList.tsx
- [ ] T015 Update MainShell layout in components/MainShell.tsx
- [ ] T016 [P] Optimize bundle size and loading in next.config.js
- [ ] T017 [P] Implement lazy loading for heavy components

## Phase 3.4: Integration
- [ ] T018 Integrate redesigned components with existing API calls
- [ ] T019 Update theme configuration in tailwind.config.js
- [ ] T020 Ensure accessibility compliance across redesigned pages

## Phase 3.5: Polish
- [ ] T021 [P] Update E2E tests for new UI selectors in e2e/*.spec.ts
- [ ] T022 Performance validation: verify <20ms load times
- [ ] T023 [P] Update component documentation in docs/
- [ ] T024 Final audit: eliminate unnecessary elements per "no bullshit" requirement

## Dependencies
- Tests (T003-T009) before implementation (T010-T017)
- T010-T012 can be parallel [P] (different pages)
- T013-T015 can be parallel [P] (different components)
- Implementation before integration (T018-T020)
- Integration before polish (T021-T024)

## Parallel Example
```
# Launch T003-T007 together:
Task: "Contract test for Button component in test/contract/test_button_component.ts"
Task: "Contract test for Input component in test/contract/test_input_component.ts"
Task: "Contract test for Card component in test/contract/test_card_component.ts"
Task: "Contract test for NavigationMenu component in test/contract/test_navigation_component.ts"
Task: "Contract test for Form components in test/contract/test_form_components.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
- Each contract → contract test task [P]
- Each user story → integration test [P]
- Different files = parallel [P]
- Tests before implementation (TDD)</content>
<parameter name="filePath">/Users/fseguerra/Projects/sprintCap/specs/011-redesign-the-entire/tasks.md