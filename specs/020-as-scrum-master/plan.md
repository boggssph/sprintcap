
# Implementation Plan: Add Jira Tickets to Sprints

**Branch**: `020-as-scrum-master` | **Date**: October 10, 2025 | **Spec**: /specs/020-as-scrum-master/spec.md
**Input**: Fe## Phase 2: Task Planning Approach
*This section describes what the /tasks**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/tasks command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passedd will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load data-model.md to extract entities and relationships
- Load contracts/tickets-api.yaml for API endpoint specifications
- Load quickstart.md for test scenario requirements
- Generate tasks from Phase 1 design artifacts

**Task Ordering Strategy**:
- TDD approach: Contract tests before implementation
- Dependency order: Database schema → API routes → UI components
- Parallel execution where possible ([P] marker for independent tasks)

**Expected Task Categories**:
1. **Database & Schema** [Priority: High]
   - Create Ticket model migration
   - Add database constraints and indexes
   - Update Prisma schema

2. **API Implementation** [Priority: High]
   - Create ticket CRUD API routes
   - Implement authentication and authorization
   - Add input validation and error handling

3. **UI Components** [Priority: Medium]
   - Create ticket addition drawer component
   - Add ticket list display to sprint view
   - Implement form validation and member selection

4. **Testing** [Priority: High]
   - Contract tests for all API endpoints
   - Unit tests for business logic
   - E2E tests for user workflows

**Estimated Output**: 15-20 numbered tasks in tasks.md with clear acceptance criteriaon from `/specs/020-as-scrum-master/spec.md`

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
Scrum Masters can manually add Jira tickets to active or future sprints for their assigned squads. Each ticket includes hours estimation, work type categorization, parent type classification, planned/unplanned status, and optional member assignment. The feature uses shadcn/ui drawer components following existing UI patterns, with no external Jira API integration.

## Technical Context
**Language/Version**: TypeScript (v5.x)  
**Primary Dependencies**: Next.js (App Router), Prisma ORM, PostgreSQL, shadcn/ui components  
**Storage**: PostgreSQL (hosted on Neon)  
**Testing**: Vitest (unit tests) and Playwright (E2E tests)  
**Target Platform**: Web application (Vercel hosting)
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: No strict time limits for CRUD operations  
**Constraints**: Manual ticket entry with no external Jira API integration  
**Scale/Scope**: Single feature for Scrum Masters to add tickets to active/future sprints

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

**Technology Alignment**:
- ✅ TypeScript v5.x as the sole language for application code
- ✅ Next.js App Router as the web framework
- ✅ Tailwind CSS + shadcn/ui components exclusively for UI
- ✅ Prisma ORM with PostgreSQL for persistence
- ✅ NextAuth for authentication
- ✅ Vercel for hosting, Neon for PostgreSQL
- ✅ Vitest + Playwright for testing

**Security & Environment**:
- ✅ No secrets or environment variables in code
- ✅ Manual ticket entry (no external API dependencies)

**CI/CD Requirements**:
- ✅ Lint, typecheck, unit tests, and E2E tests will be included

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
├── api/                      # API routes for ticket operations
├── dashboard/scrum-master/   # Scrum Master dashboard pages
└── components/               # Reusable UI components

components/                   # shadcn/ui components and custom components
├── ui/                       # shadcn/ui primitive components
└── [feature-specific components]

lib/                          # Business logic and utilities
├── services/                 # Service layer (ticket operations)
├── types/                    # TypeScript type definitions
└── validations/              # Input validation schemas

prisma/                       # Database schema and migrations
└── schema.prisma

tests/                        # Test files
├── unit/                     # Unit tests
├── integration/              # Integration tests
└── e2e/                      # End-to-end tests
```

**Structure Decision**: Web application structure following Next.js App Router conventions with clear separation between API routes, components, and business logic. Uses the established project patterns for consistency.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - All technical aspects clarified through specification process
   - No NEEDS CLARIFICATION markers remain
   - Project type confirmed as web application

2. **Generate and dispatch research agents**:
   - No research required - all technical decisions clarified

3. **Consolidate findings** in `research.md`:
   - All technical unknowns resolved
   - Implementation approach determined
   - No external dependencies identified

**Output**: research.md with confirmation that no additional research needed

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Ticket entity with all required fields and relationships
   - Validation rules and business constraints defined
   - Database schema changes specified

2. **Generate API contracts** from functional requirements:
   - RESTful endpoints for CRUD ticket operations
   - OpenAPI specification in `/contracts/tickets-api.yaml`
   - Error response schemas included

3. **Generate contract tests** from contracts:
   - API contract tests will be created in Phase 2
   - Tests will validate request/response schemas

4. **Extract test scenarios** from user stories:
   - Quickstart guide created with manual test scenarios
   - Data-testid attributes specified for E2E testing

5. **Update agent file incrementally** (O(1) operation):
   - GitHub Copilot context file updated with new technologies
   - Preserved existing manual additions
   - Added TypeScript, Next.js, Prisma, PostgreSQL, shadcn/ui

**Output**: data-model.md, /contracts/tickets-api.yaml, quickstart.md, updated agent context file

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
**Progress Tracking**:
- [x] Phase 0: Constitution Check (Complete)
- [x] Phase 1: Feature Specification (Complete)
- [x] Phase 2: Design Artifacts (Complete)
- [x] Phase 3: Implementation (Ready to Begin)
- [ ] Phase 4: Testing & Validation
- [ ] Phase 5: Deployment

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.2.0 - See `/memory/constitution.md`*
