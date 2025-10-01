# Tasks: Sprint Creation UI with Formatted Name Input

**Input**: Design documents from `/specs/007-the-ui-to/`
**Prerequisites**: plan.md (required), spec.md
**Status**: Feature already implemented - tasks focus on validation

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: tech stack, libraries, structure
2. Load spec.md for requirements validation
3. Generate validation tasks for existing implementation:
   → Test existing SprintCreationForm component
   → Validate formatted name input behavior
   → Confirm duplicate prevention works
   → Verify API integration
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Validation tasks can run in parallel
5. Number tasks sequentially (T001, T002...)
6. Focus on validation rather than new implementation
7. Return: SUCCESS (validation tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `app/`, `components/`, `lib/`, `test/`
- Paths based on existing Next.js structure

## Phase 3.1: Validation Setup
- [x] T001 Verify existing SprintCreationForm component structure in components/SprintCreationForm.tsx
- [x] T002 Confirm API endpoint functionality in pages/api/sprints.ts

## Phase 3.2: Component Validation (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These validations MUST confirm existing functionality works**
- [ ] T003 [P] Validate formatted name input displays correctly in test/unit/components/test_SprintCreationForm.test.tsx
- [ ] T004 [P] Test squad selection updates prefix in test/unit/components/test_SprintCreationForm.test.tsx
- [ ] T005 [P] Verify duplicate name prevention in test/integration/sprint-creation.integration.test.ts
- [ ] T006 [P] Confirm API validation works in test/contract/sprints.contract.test.ts

## Phase 3.3: Integration Validation (ONLY after component tests pass)
- [ ] T007 Validate end-to-end sprint creation flow in test/integration/sprint-creation.integration.test.ts
- [ ] T008 Test error handling for invalid inputs in test/unit/services/test_sprintService.test.ts
- [ ] T009 Confirm database constraints work in test/integration/sprint-overlap.integration.test.ts

## Phase 3.4: UI/UX Validation
- [ ] T010 [P] Verify gray prefix is uneditable in e2e/sprint-creation.e2e.spec.ts
- [ ] T011 [P] Test number field accepts user input in e2e/sprint-creation.e2e.spec.ts
- [ ] T012 [P] Validate form submission creates sprint in e2e/sprint-creation.e2e.spec.ts

## Phase 3.5: Documentation & Polish
- [ ] T013 [P] Update component documentation in components/SprintCreationForm.tsx
- [ ] T014 [P] Add usage examples to docs/SPRINT_CREATION.md
- [ ] T015 Run full test suite to confirm no regressions
- [ ] T016 [P] Validate sprint number auto-suggestion logic in test/unit/components/test_SprintCreationForm.test.tsx

## Dependencies
- Component validation (T003-T006) before integration (T007-T009)
- Integration before UI validation (T010-T012)
- All validation before documentation (T013-T015)

## Parallel Example
```
# Launch T003-T006 together:
Task: "Validate formatted name input displays correctly in test/unit/components/test_SprintCreationForm.test.tsx"
Task: "Test squad selection updates prefix in test/unit/components/test_SprintCreationForm.test.tsx"
Task: "Verify duplicate name prevention in test/integration/sprint-creation.integration.test.ts"
Task: "Confirm API validation works in test/contract/sprints.contract.test.ts"
```

## Notes
- [P] tasks = different test files, no dependencies
- Focus on validating existing implementation
- Commit after each validation task
- Avoid: modifying existing code unless bugs found

## Task Generation Rules
*Applied during main() execution*

1. **From Spec Requirements**:
   - Each functional requirement → validation test task [P]
   - Each acceptance scenario → integration test task

2. **From Existing Implementation**:
   - Each component → unit test validation task [P]
   - Each API endpoint → contract test validation task
   - Each service → integration test validation task

3. **Ordering**:
   - Component validation → Integration → UI → Documentation
   - Parallel where files are independent

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All spec requirements have validation tasks
- [ ] All existing components have validation tasks
- [ ] Validation tasks come before any potential fixes
- [ ] Parallel tasks test different components
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task</content>
<parameter name="filePath">/Users/fseguerra/Projects/sprintCap/specs/007-the-ui-to/tasks.md