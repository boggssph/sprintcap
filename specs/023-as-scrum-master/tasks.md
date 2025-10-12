# Tasks: Sprint Update Feature

**Input**: Design documents from `/specs/023-as-scrum-master/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
2. Load design documents ✓
3. Generate tasks by category ✓
4. Apply task rules ✓
5. Number tasks sequentially ✓
6. Generate dependency graph ✓
7. Create parallel execution examples ✓
8. Validate task completeness ✓
9. Return: SUCCESS (tasks ready for execution) ✓
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- Web app structure: `app/`, `components/`, `lib/`, `prisma/`
- API routes: `app/api/`
- Components: `components/`
- Tests: `test/` and `e2e/`

## Phase 3.1: Setup
- [x] T001 Create SprintUpdateDrawer component structure in components/SprintUpdateDrawer.tsx
- [x] T002 Add sprint update form validation utilities in lib/validations/sprintUpdate.ts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T003 [P] Contract test PUT /api/sprints/[id] in test/contract/api/sprint-update.test.ts
- [x] T004 [P] Integration test sprint update drawer in e2e/sprint-update-drawer.spec.ts
- [x] T005 [P] Integration test validation rules in test/integration/sprint-validation.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T006 [P] Sprint update validation schema in lib/validations/sprintUpdate.ts
- [x] T007 [P] Sprint update API route in app/api/sprints/[id]/route.ts
- [x] T008 SprintUpdateDrawer component in components/SprintUpdateDrawer.tsx
- [x] T009 Form integration with React Hook Form in components/SprintUpdateDrawer.tsx
- [x] T010 Update SprintList component to include edit triggers in components/SprintList.tsx
- [ ] T019 [P] Authorization middleware for Scrum Master access in lib/auth/scrumMasterAuth.ts
- [ ] T020 Squad ownership validation in API route app/api/sprints/[id]/route.ts

## Phase 3.4: Integration
- [ ] T011 Connect drawer to SprintList component integration
- [ ] T012 Add loading states and error handling
- [ ] T013 Implement optimistic updates for better UX

## Phase 3.5: Polish
- [ ] T014 [P] Unit tests for validation logic in test/unit/validation/sprintUpdate.test.ts
- [ ] T015 Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] T016 Mobile responsiveness testing and fixes
- [ ] T017 Update component documentation
- [ ] T018 Run quickstart.md validation scenarios

## Dependencies
- Tests (T003-T005) before implementation (T006-T010)
- T006 blocks T008, T009
- T007 blocks T011, T019, T020
- T008 blocks T010, T011
- T019 blocks T020
- Implementation before polish (T014-T018)

## Parallel Example
```
# Launch T003-T005 together:
Task: "Contract test PUT /api/sprints/[id] in test/contract/api/sprint-update.test.ts"
Task: "Integration test sprint update drawer in e2e/sprint-update-drawer.spec.ts"
Task: "Integration test validation rules in test/integration/sprint-validation.test.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Follow TDD: red → green → refactor
- Use shadcn/ui Drawer component for consistency
- Ensure WCAG AA accessibility compliance

## Task Generation Rules
*Applied during task creation*

1. **From Contracts**:
   - sprint-update-api.md → T003 contract test
   - PUT endpoint → T007 implementation task

2. **From Data Model**:
   - Sprint entity validation → T006 validation schema
   - Ceremony times validation → T006 validation schema

3. **From User Stories**:
   - Update sprint details → T008 drawer component
   - Form validation → T009 form integration
   - Quickstart scenarios → T018 validation

4. **Ordering**:
   - Setup → Tests → Validation → API → UI → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked before task execution*

- [x] All contracts have corresponding tests (T003)
- [x] All entities have validation tasks (T006)
- [x] All tests come before implementation (T003-T005 before T006-T010)
- [x] Parallel tasks are independent (T003,T004,T005,T019 no file conflicts)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task