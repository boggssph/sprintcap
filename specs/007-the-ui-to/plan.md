
# Implementation Plan: Sprint Creation UI with Formatted Name Input

**Branch**: `007-the-ui-to` | **Date**: 2025-09-30 | **Spec**: [link]
**Input**: Feature specification from `/specs/007-the-ui-to/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
**VALIDATION PLAN**: Confirm existing sprint creation UI implementation meets all requirements for formatted name input field displaying "SquadAlias-Sprint-Number" with gray prefix, duplicate prevention, and proper validation. Feature appears fully implemented - focus on validation tasks to ensure spec compliance.

## Technical Context
**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js App Router, Tailwind CSS, shadcn/ui, Prisma, PostgreSQL  
**Storage**: PostgreSQL (via Prisma ORM)  
**Testing**: Vitest (unit), Playwright (E2E)  
**Target Platform**: Web application (Vercel hosting)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: <100ms form response time  
**Constraints**: Must integrate with existing sprint creation workflow  
**Scale/Scope**: Single form component with squad-based sprint numbering

## Tech Stack & Visual Design Principles
Specify the authoritative technology choices and visual design constraints that the /plan and downstream tasks must follow. Fill these in for the feature so planners and implementers inherit the decisions.

- Tech stack (canonical):
  - Language: TypeScript (v5.x)
  - Framework: Next.js (App Router)
  - UI: Tailwind CSS + shadcn/ui (use shadcn/ui components exclusively unless a clear exception is documented)
  - ORM/DB: Prisma + PostgreSQL (hosted on Neon preferred)
  - Auth: NextAuth (Google provider in production). Dev-only bypass middleware allowed but must be disabled in production by runtime guard.
  - Hosting: Vercel for the application; Neon for Postgres.
  - Email: Brevo for transactional emails (invites, revocations).
  - Testing: Vitest for unit tests and Playwright for E2E; CI must run lint/typecheck, unit tests, SAST/SCA before merges.

- Visual design principles (constraints):
  - Use shadcn/ui components as the single source of truth for UI primitives and composition.
  - Tailwind utility-first styling; prefer variants/tokens over ad-hoc CSS.
  - Accessibility: Aim for WCAG AA (focus styles, aria attributes, semantic markup).
  - Responsive-first: components must work across small → large viewports; use Tailwind breakpoints consistently.
  - Design tokens: centralize colors, spacing, and typography in Tailwind config and avoid inline styles.
  - Minimal custom CSS: keep component-level overrides to a minimum; prefer shadcn themes/variants.
  - Motion: subtle, performance-friendly transitions only; avoid large layout-shifting animations.
  - Testing hooks: include stable selectors (`data-testid`) where tests need deterministic element targeting.
   - Language: TypeScript (v5.x)
   - Framework: Next.js (App Router)
   - UI: Tailwind CSS + shadcn/ui (use shadcn/ui components exclusively unless a clear exception is documented)
   - ORM/DB: Prisma + PostgreSQL (hosted on Neon preferred)
   - Auth: NextAuth (Google prod, Credentials/dev bypass for local/testing)
   - Hosting: Vercel for the application; Neon for Postgres
   - Email: Brevo (transactional invites)
   - Testing: Vitest (unit) and Playwright (E2E)

- Visual design principles (constraints):
   - Use shadcn/ui components as the single source of truth for UI primitives and composition.
   - Tailwind utility-first styling; prefer variants/tokens over ad-hoc CSS.
   - Accessibility: Aim for WCAG AA (focus styles, aria attributes, semantic markup).
   - Responsive-first: components must work across small → large viewports; use Tailwind breakpoints consistently.
   - Design tokens: centralize colors, spacing, and typography in Tailwind config and avoid inline styles.
   - Minimal custom CSS: keep component-level overrides to a minimum; prefer shadcn themes/variants.
   - Motion: subtle, performance-friendly transitions only; avoid large layout-shifting animations.
   - Testing hooks: include stable selectors (`data-testid`) where tests need deterministic element targeting.

Note: If an exception to any of the above is required, document a short rationale in the feature spec and add it to the constitution check during /plan.

## Constitution Check
**✅ COMPLIANT**: Tech stack alignment (Next.js, TypeScript, Tailwind, shadcn/ui)  
**✅ COMPLIANT**: Database integration (Prisma + PostgreSQL)  
**✅ COMPLIANT**: Authentication (NextAuth)  
**✅ COMPLIANT**: Testing framework (Vitest + Playwright)  
**✅ COMPLIANT**: API patterns (RESTful endpoints)  
**✅ COMPLIANT**: Component patterns (shadcn/ui components)  
**✅ COMPLIANT**: Form scope - includes squad selector + formatted name input (name field is the primary focus)

## Project Structure
```
app/dashboard/scrum-master/           # Existing route for Scrum Master dashboard
├── page.tsx                         # Main dashboard page
└── components/                      # Feature components
    └── SprintCreationForm.tsx       # ✅ EXISTING: Form with formatted name input

app/api/sprints/                     # Existing API endpoint
├── route.ts                         # POST handler with validation

prisma/schema.prisma                 # Database schema
├── Sprint model                     # name, squadId, unique constraint
└── Squad model                      # alias field for prefix

components/ui/                       # shadcn/ui components
├── input.tsx                        # Form input components
├── select.tsx                       # Squad selector
└── button.tsx                       # Form submission
```

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
```
*Based on Constitution v2.2.0 - See `/memory/constitution.md`
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Phase 0: Outline & Research
*COMPLETED: Existing implementation discovered*

**Research Findings**:
- SprintCreationForm.tsx already implements formatted name input with gray prefix
- API endpoint /api/sprints handles validation and duplicate prevention
- Database schema supports unique constraint on [squadId, name]
- Feature requirements are fully implemented in existing codebase

**Decision**: Shift from implementation to validation approach
**Rationale**: Avoid duplicate work, focus on confirming existing implementation meets spec
**Alternatives Considered**: New implementation (rejected due to existing code)

**Output**: research.md documenting existing implementation analysis

## Phase 1: Design & Contracts
*COMPLETED: Validation approach designed*

**Design Decisions**:
- Validation-first approach: Confirm existing implementation meets spec
- No new contracts needed: Use existing API patterns
- Data model validation: Confirm Sprint/Squad schema supports requirements
- Test scenarios: Focus on validating existing behavior

**Generated Artifacts**:
- data-model.md: Existing entity validation
- contracts/: Existing API contract validation
- quickstart.md: Validation quickstart guide
- Agent context updated with validation approach

**Output**: Design docs focused on validation rather than new implementation

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy** (Validation Focus):
- Load existing implementation from SprintCreationForm.tsx and /api/sprints
- Generate validation tasks from existing code and spec requirements
- Each requirement → validation task to confirm implementation
- Each component/API → integration test task
- Documentation tasks to ensure spec matches implementation

**Ordering Strategy**:
- Validation order: Component validation before API before integration
- Parallel execution: Independent validation tasks marked [P]
- Documentation last: After all validation confirms implementation

**Estimated Output**: 16 validation tasks in tasks.md (already generated)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) - Existing implementation discovered
- [x] Phase 1: Design complete (/plan command) - Validation approach designed
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command) - Validation tasks ready
- [ ] Phase 4: Implementation complete - Feature already implemented
- [ ] Phase 5: Validation passed - Validation tasks will confirm

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented - None required

---
*Based on Constitution v2.2.0 - See `/memory/constitution.md`*
