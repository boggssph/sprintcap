
# Implementation Plan: Sprint Creation for Squads

**Branch**: `004-as-scrum-master` | **Date**: September 28, 2025 | **Spec**: /Users/fseguerra/Projects/sprintCap/specs/004-as-scrum-master/spec.md
**Input**: Feature specification from `/specs/004-as-scrum-master/spec.md`

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
Scrum Masters can create sprints for their squads by specifying name, start/end dates with time. Sprint members automatically default to all active squad members. The system prevents overlapping sprints and validates date ranges.

## Technical Context
**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js (App Router), Prisma, PostgreSQL
**Storage**: PostgreSQL (hosted on Neon)
**Testing**: Vitest (unit) and Playwright (E2E)
**Target Platform**: Vercel (web application)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <500ms response time for sprint operations
**Constraints**: Must integrate with existing squad and user management systems
**Scale/Scope**: Support multiple concurrent sprints per Scrum Master, up to 50 squad members per sprint

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

✅ **Language & Framework**: Uses TypeScript 5.x and Next.js App Router - COMPLIES  
✅ **UI & Styling**: Will use Tailwind CSS and shadcn/ui components - COMPLIES  
✅ **Persistence**: Uses Prisma ORM with PostgreSQL - COMPLIES  
✅ **Hosting**: Will deploy to Vercel - COMPLIES  
✅ **Auth**: Uses existing NextAuth setup - COMPLIES  
✅ **Email**: No email functionality needed for this feature - COMPLIES  
✅ **Testing**: Will use Vitest for unit tests - COMPLIES  
✅ **Secrets**: No new secrets required - COMPLIES  

**Status**: PASS - No constitution violations detected.

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
├── dashboard/
│   └── scrum-master/
│       └── page.tsx          # Existing Scrum Master dashboard (will add sprint creation UI)
├── api/
│   └── sprints/              # NEW: Sprint management API endpoints
│       └── route.ts
prisma/
├── schema.prisma            # Will add Sprint and SprintMember models
└── migrations/              # Will add migration for new tables
lib/
├── prisma.ts                # Existing Prisma client
└── auth.ts                  # Existing auth setup
components/
├── ui/                      # Existing shadcn/ui components
└── ScrumMasterClient.tsx    # May need updates for sprint management
```

**Structure Decision**: Web application structure using Next.js App Router. Sprint creation UI will be added to the existing Scrum Master dashboard, with new API endpoints for sprint management. Database schema will be extended with Sprint and SprintMember models.

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
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

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
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

## Phase 2: Task Generation Approach

**Objective**: Generate actionable implementation tasks from the design artifacts created in Phase 1.

**Input Sources**:
- `spec.md`: Functional requirements and acceptance criteria
- `data-model.md`: Database schema and entity relationships
- `contracts/sprints-api.yaml`: API contract specifications
- `quickstart.md`: Test scenarios and validation criteria
- `research.md`: Technical decisions and implementation constraints

**Task Generation Strategy**:

1. **Database Layer Tasks**:
   - Create Prisma schema migrations for Sprint and SprintMember models
   - Generate and run database migrations
   - Update Prisma client types

2. **API Layer Tasks**:
   - Implement POST `/api/sprints` endpoint with validation
   - Implement GET `/api/sprints` endpoint with filtering
   - Implement GET `/api/sprints/{id}` endpoint
   - Add authentication and authorization middleware
   - Implement overlap detection logic

3. **Business Logic Tasks**:
   - Create sprint service with member population logic
   - Implement date validation and overlap checking
   - Add squad ownership verification

4. **Frontend Tasks**:
   - Create sprint creation form component
   - Add sprint list component to Scrum Master dashboard
   - Implement form validation and error handling
   - Add success/error notifications

5. **Testing Tasks**:
   - Create unit tests for API endpoints
   - Create integration tests for sprint creation flow
   - Create E2E tests using Playwright
   - Add test data seeding for development

6. **Documentation Tasks**:
   - Update API documentation
   - Add user-facing help text
   - Update Scrum Master dashboard documentation

**Task Granularity**: Each task should be implementable in 1-2 hours by a single developer, with clear acceptance criteria and dependencies.

**Dependencies**: Tasks will be ordered to ensure database changes precede API implementation, API precedes frontend, and core functionality precedes testing.

**Validation**: Each task will include specific acceptance criteria that can be verified through automated tests or manual testing following the quickstart scenarios.

---
*Based on Constitution v2.2.0 - See `/memory/constitution.md`*
