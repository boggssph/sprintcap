# Implementation Plan: Scrum Master Member Hours Input Table

**Branch**: `024-as-scrum-master` | **Date**: October 14, 2025 | **Spec**: /Users/fseguerra/Projects/sprintCap/specs/024-as-scrum-master/spec.md
**Input**: Feature specification from `/specs/024-as-scrum-master/spec.md`

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
Add a table in the Capacity tab for Scrum Masters to input hours for each squad member across categories (Support and Incidents, PR Review, Others). The table auto-saves on blur, validates inputs, and is isolated per sprint. Technical approach uses shadcn/ui table components, Prisma for data persistence, and Next.js API routes for CRUD operations.

## Technical Context
**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js App Router, Prisma, shadcn/ui, Tailwind CSS  
**Storage**: Prisma ORM with PostgreSQL (Neon)  
**Testing**: Vitest for unit tests, Playwright for E2E  
**Target Platform**: Web application (Vercel hosting)  
**Project Type**: web (frontend + backend in Next.js)  
**Performance Goals**: Immediate loading and saving of member hours table  
**Constraints**: Data isolated per sprint, only one Scrum Master per squad, auto-save on cell blur  
**Scale/Scope**: Per squad member (up to ~10 members), per sprint, with decimal hour precision

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

- Language & Framework: Uses TypeScript 5.x and Next.js App Router ✓
- UI & Styling: Uses Tailwind CSS and shadcn/ui exclusively ✓
- Persistence & Hosting: Uses Prisma ORM with PostgreSQL (Neon), hosted on Vercel ✓
- Auth & Email: No new auth requirements, existing NextAuth setup sufficient ✓
- Testing & CI: Will use Vitest and Playwright ✓
- Secrets: No new secrets introduced ✓

**Status**: PASS - No violations detected.

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
app/
├── api/                    # API routes for member hours CRUD
│   └── member-hours/
├── dashboard/              # Capacity tab page
│   └── capacity/
└── ...

components/
├── MemberHoursTable.tsx    # New table component
└── ...

lib/
├── prisma/                 # Database schema updates
└── ...

prisma/
├── schema.prisma           # Updated with MemberHours model
└── ...

tests/
├── e2e/                    # Playwright tests for table functionality
└── unit/                   # Vitest tests for components and API
```

**Structure Decision**: Web application structure using Next.js App Router. API routes in app/api/, components in components/, database schema in prisma/. Follows existing project layout.

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
- Each contract test → implementation task [P0]
- Each entity → model/schema task [P0] 
- Each user story → integration test task [P1]
- UI component tasks for table implementation [P0]
- Database migration task [P0]

**Ordering Strategy**:
1. Database schema and migration (blocking)
2. API implementation (contracts)
3. UI component development
4. Integration and testing
5. E2E validation

**Task Categories**:
- **Backend**: API routes, database operations
- **Frontend**: React components, state management
- **Testing**: Unit tests, E2E tests, contract tests
- **DevOps**: Migrations, environment setup

**Dependencies**: Tasks will be ordered to ensure database changes precede API, API precedes UI, etc.

**STOP**: Ready for /tasks command to generate the actual tasks.md file.

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
- [x] Initial Constitution Check: PASS
- [x] Phase 0: Research complete (research.md generated)
- [x] Phase 1: Design complete (data-model.md, contracts/, quickstart.md, agent context updated)
- [x] Post-Design Constitution Check: PASS
- [ ] Phase 2: Task generation (pending /tasks command)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

---
*Based on Constitution v2.2.0 - See `/memory/constitution.md`*
