
# Implementation Plan: Capacity Plan Tab for Scrum Masters

**Branch**: `021-as-scrum-master` | **Date**: 2025-10-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/021-as-scrum-master/spec.md`

## **Phase Status**:
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
- [ ] Complexity deviations documentedw (/plan command scope)
```
1. Load feature spec from Input path
   → Feature spec loaded successfully from /Users/fseguerra/Projects/sprintCap/specs/021-as-scrum-master/spec.md
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → Research completed: Jira integration, UI patterns, database extensions analyzed
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
   → All artifacts created: API contracts, data model, quickstart guide, Copilot instructions
7. Re-evaluate Constitution Check section
   → No new violations introduced
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Implement a "Capacity Plan" tab for Scrum Masters that displays active sprints (capacity plans) across their squads in individual cards, enabling full CRUD operations on associated Jira tickets. Active sprints are those explicitly marked as active by the Scrum Master.

## Technical Context
**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js App Router, Tailwind CSS, shadcn/ui, Prisma, PostgreSQL  
**Storage**: PostgreSQL (Neon)  
**Testing**: Vitest (unit) and Playwright (E2E)  
**Target Platform**: Web application  
**Project Type**: Web (frontend + backend)  
**Performance Goals**: <200ms page load, <150ms mobile  
**Constraints**: Use shadcn/ui exclusively for UI components, responsive design, accessibility WCAG AA  
**Scale/Scope**: Capacity planning for multiple squads, CRUD operations on Jira tickets within sprint cards

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

✅ PASSED: Feature aligns with Constitution v2.2.0 (post-Phase 1 review)
- Uses TypeScript 5.x, Next.js App Router
- UI with shadcn/ui components exclusively
- Persistence with Prisma + PostgreSQL (Neon)
- Auth with NextAuth
- Testing with Vitest and Playwright
- No secrets in code
- Follows visual design principles (responsive, accessible, Tailwind-based)
- Jira integration follows secure credential management practices

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
│   └── capacity-plan/
│       ├── page.tsx                    # Capacity Plan tab page
│       └── components/
│           ├── CapacityPlanCard.tsx    # Individual sprint card component
│           └── CapacityPlanGrid.tsx    # Grid layout for cards
├── api/
│   └── capacity-plan/
│       ├── [sprintId]/
│       │   ├── tickets/
│       │   │   ├── route.ts            # CRUD endpoints for tickets
│       │   │   └── [ticketId]/
│       │   │       └── route.ts        # Individual ticket operations
│       │   └── activate/
│       │       └── route.ts            # Mark sprint as active
│       └── active-sprints/
│           └── route.ts                # Get active sprints for user
components/
├── CapacityPlanTab.tsx                 # Main tab component
└── ui/                                 # shadcn/ui components (existing)
lib/
├── services/
│   └── capacityPlanService.ts          # Business logic for capacity plans
└── validations/
    └── ticketValidation.ts             # Ticket CRUD validations
prisma/
└── schema.prisma                       # Database schema updates if needed
```

**Structure Decision**: Web application structure with Next.js App Router. Frontend components in app/ directory, API routes in app/api/, shared components in components/, business logic in lib/services/.

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
- Database schema changes → migration and model tasks
- Each API contract → implementation + unit test tasks [P]
- UI components from design → implementation + accessibility test tasks [P]
- Integration with Jira API → service layer tasks
- Authentication checks → middleware tasks
- Each acceptance scenario → E2E test task

**Ordering Strategy**:
- TDD order: Write tests before implementation where possible
- Dependency order: Database schema → API services → UI components → Integration
- Parallel execution [P] for independent components (UI components, separate API endpoints)
- Sequential for dependent items (database must precede API, API must precede UI)

**Estimated Output**: 28 numbered, ordered tasks in tasks.md covering database, API, UI, and testing

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
- [ ] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [ ] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.2.0 - See `/memory/constitution.md`*
