
# Implementation Plan: Sprints Tab Display

**Branch**: `018-the-sprints-tab` | **Date**: 2025-10-09 | **Spec**: /Users/fseguerra/Projects/sprintCap/specs/018-the-sprints-tab/spec.md
**Input**: Feature specification from `/specs/018-the-sprints-tab/spec.m**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passedExecution Flow (/plan command scope)
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
Implement a Sprints tab in the dashboard that displays squad cards showing the last 3 sprints per squad, with the active sprint listed first. Include a "Create New Sprint" button that opens a drawer component for sprint creation, following the same UX pattern as squad creation. The feature requires extending the database schema with a Sprint model and implementing RESTful API endpoints for sprint management.

## Technical Context
**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js App Router, Prisma ORM, PostgreSQL, shadcn/ui  
**Storage**: PostgreSQL (via Prisma ORM)  
**Testing**: Vitest (unit), Playwright (E2E)  
**Target Platform**: Web application (Vercel hosting)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: <20ms page load, <15ms mobile  
**Constraints**: Responsive design, WCAG AA accessibility, Scrum Master role-based access  
**Scale/Scope**: Single-page tab view with squad cards, drawer component for sprint creation

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

**Constitution v2.2.0 Compliance Check:**
- ✅ **Language & Framework**: Uses TypeScript 5.x + Next.js App Router (constitutionally required)
- ✅ **UI & Styling**: Uses Tailwind CSS + shadcn/ui components exclusively (constitutionally required)
- ✅ **Persistence**: Uses Prisma ORM with PostgreSQL (constitutionally required)
- ✅ **Auth**: Feature respects NextAuth authentication (no violations)
- ✅ **Testing**: Will use Vitest + Playwright (constitutionally required)
- ✅ **Secrets**: No secrets handling in this feature (compliant)
- ✅ **Hosting**: Web application deployable to Vercel (constitutionally required)

**Status**: PASS - No constitutional violations detected

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
```
app/                          # Next.js App Router
├── dashboard/                # Existing dashboard page
│   └── page.tsx             # Will add Sprints tab to existing dashboard
├── api/                     # API routes
│   └── sprints/             # New sprint-related API endpoints
│       └── route.ts         # GET/POST sprint operations
└── globals.css              # Global styles

components/                  # React components
├── SprintList.tsx           # New: Squad cards with sprint lists
├── SprintCard.tsx           # New: Individual sprint display component
├── SprintCreationDrawer.tsx # New: Drawer for creating sprints
└── ui/                      # shadcn/ui components (existing)

lib/                         # Utility functions
├── services/
│   └── sprintService.ts     # New: Sprint business logic
└── validations/
    └── sprintValidation.ts  # New: Sprint input validation

prisma/                      # Database schema
└── schema.prisma            # Will extend with Sprint model

test/                        # Unit tests
├── unit/
│   └── components/
│       ├── SprintList.test.tsx        # New: Component tests
│       ├── SprintCard.test.tsx        # New: Component tests
│       └── SprintCreationDrawer.test.tsx # New: Component tests
└── integration/
    └── sprint-management.test.ts      # New: Integration tests

e2e/                         # E2E tests
├── sprint-tab-display.spec.ts         # New: Tab display tests
├── sprint-creation-flow.spec.ts       # New: Creation flow tests
└── sprint-list-interaction.spec.ts    # New: List interaction tests
```

**Structure Decision**: Web application structure following Next.js App Router conventions with feature-based component organization. Database operations through Prisma ORM, API routes for data access, comprehensive testing coverage.

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
- Load Phase 1 design artifacts (contracts, data-model.md, quickstart.md)
- Generate tasks following TDD approach: tests before implementation
- Create parallelizable tasks where dependencies allow

**Task Categories**:
1. **Database Schema** [Priority: P0]
   - Extend Prisma schema with Sprint model
   - Generate and run migration

2. **API Implementation** [Priority: P0] 
   - Implement GET /api/sprints endpoint
   - Implement POST /api/sprints endpoint
   - Add contract tests for both endpoints

3. **Business Logic** [Priority: P1]
   - Create sprintService.ts with core business rules
   - Implement active sprint determination logic
   - Add input validation

4. **UI Components** [Priority: P1]
   - Create SprintList component (squad cards)
   - Create SprintCard component (individual sprint display)
   - Create SprintCreationDrawer component
   - Add components to dashboard page

5. **Integration & Testing** [Priority: P2]
   - Unit tests for all components
   - Integration tests for API endpoints
   - E2E tests for user flows

**Ordering Strategy**:
- Database → API → Business Logic → UI → Testing
- Parallel execution for independent components
- Contract tests run before implementation tasks

**Estimated Output**: 15-20 numbered tasks in tasks.md

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
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.2.0 - See `/memory/constitution.md`*
