# Implementation Plan: Squad Management Updates

**Branch**: `022-as-scrum-master` | **Date**: October 11, 2025 | **Spec**: /Users/fseguerra/Projects/sprintCap/specs/022-as-scrum-master/spec.md
**Input**: Feature specification from `/specs/022-as-scrum-master/spec.md`

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
Enable Scrum Masters to update squad names, aliases, and configure default ceremony time allocations (Daily Scrum, Team Refinement, Review/Demo, Sprint Planning, Sprint Retrospective) with automatic calculation for new sprints. Implementation uses Next.js API routes, Prisma schema updates, shadcn/ui form components, and comprehensive validation ensuring uniqueness constraints and positive time values.

## Technical Context
**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js App Router, Prisma ORM, PostgreSQL, shadcn/ui components, Tailwind CSS  
**Storage**: PostgreSQL (hosted on Neon)  
**Testing**: Vitest for unit tests, Playwright for E2E tests  
**Target Platform**: Web application (responsive across devices)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: <200ms page load, <150ms mobile response time  
**Constraints**: WCAG AA accessibility, responsive-first design, shadcn/ui components exclusively  
**Scale/Scope**: Squad management interface for Scrum Masters, ceremony time calculations for 1-4 week sprints

## Tech Stack & Visual Design Principles
Specify the authoritative technology choices and visual design constraints that the /plan and downstream tasks must follow. Fill these in for the feature so planners and implementers inherit the decisions.

- Tech stack (canonical):
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
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: PASS - No violations detected

**Analysis**:
- ✅ TypeScript 5.x: Feature will use existing TypeScript codebase
- ✅ Next.js App Router: Squad management will be implemented as pages/routes
- ✅ shadcn/ui components: UI will use existing shadcn/ui component library
- ✅ Prisma + PostgreSQL: Database schema changes required for ceremony defaults
- ✅ NextAuth: Authentication handled by existing system
- ✅ Vercel + Neon: Deployment targets match constitution
- ✅ Brevo: No email functionality required for this feature
- ✅ Vitest + Playwright: Testing will follow established patterns

**No exceptions required** - Feature aligns with all constitutional requirements.

## Project Structure

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
*Based on Constitution v2.2.0 - See `/memory/constitution.md`*

**Selected Structure**: Web application (frontend + backend)

```
app/                           # Next.js App Router
├── (admin)/                   # Admin routes
├── api/                       # API routes
│   └── squads/               # Squad management API endpoints
├── dashboard/                # Dashboard pages
└── setup/                    # Setup pages

components/                    # React components
├── SquadFormFields.tsx       # Squad form components
├── ui/                       # shadcn/ui components
└── ...

lib/                          # Utility libraries
├── prisma.ts                 # Prisma client
├── auth.ts                   # Authentication utilities
└── validations/              # Validation schemas

prisma/                       # Database schema
└── schema.prisma            # Prisma schema with squad updates

tests/                        # Test files
├── contract/                 # Contract tests
├── integration/              # Integration tests
└── unit/                     # Unit tests
```

**Structure Decision**: Web application structure selected as this is a Next.js application with both frontend pages and backend API routes. The feature will add squad management UI components and API endpoints while leveraging the existing authentication and database infrastructure.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P] (parallel execution)
- Each entity field → database migration task
- Each API endpoint → implementation task
- Each user story scenario → integration test task
- UI component updates → frontend implementation tasks
- Validation logic → unit test tasks

**Ordering Strategy**:
- TDD order: Database schema → API contracts → Implementation → Tests
- Dependency order: Models before services before UI
- Parallel execution [P] for independent contract tests and UI components
- Sequential execution for database migrations and API implementation

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md

**Task Categories**:
1. **Database Migration** (1-2 tasks): Update Prisma schema, generate migration
2. **API Implementation** (2-3 tasks): Create PATCH endpoint, add validation
3. **UI Components** (3-4 tasks): Update forms, add ceremony fields, validation
4. **Calculation Logic** (1-2 tasks): Implement ceremony time utilities
5. **Testing** (6-8 tasks): Contract tests, integration tests, unit tests
6. **Documentation** (1 task): Update API docs if needed

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
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/tasks command)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented
- [x] Task planning complete

---
*Based on Constitution v2.2.0 - See `/memory/constitution.md`*
