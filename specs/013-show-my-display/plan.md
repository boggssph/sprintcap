
# Implementation Plan: Display Name and Profile Picture

**Branch**: `013-show-my-display` | **Date**: 2025-10-09 | **Spec**: /Users/fseguerra/Projects/sprintCap/specs/013-show-my-display/spec.md
**Input**: Feature specification from `/specs/013-show-my-display/spec.md`

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
Display user's display name next to their profile picture with an editable pencil icon. On mobile devices, hide the display name and show only the profile picture. Include proper validation (2-50 characters, alphanumeric + spaces only), error handling for network failures, and accessibility features (screen reader announcements).

## Technical Context
**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js App Router, shadcn/ui, NextAuth, Prisma  
**Storage**: PostgreSQL (via Prisma ORM)  
**Testing**: Vitest (unit) and Playwright (E2E)  
**Target Platform**: Web application (Vercel hosting)  
**Project Type**: web (frontend + backend)  
**Performance Goals**: <20ms page load times, responsive across devices  
**Constraints**: Must use shadcn/ui components exclusively, WCAG AA accessibility  
**Scale/Scope**: Single user profile enhancement, no backend schema changes required

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

**Constitution Version**: 2.2.0 (2025-09-27)  
**Check Status**: ✅ PASS - No violations detected (re-checked after Phase 1 design)

**Technology Alignment** (Phase 1 Confirmation):
- ✅ TypeScript 5.x: Feature uses TypeScript exclusively
- ✅ Next.js App Router: Feature is web-based UI enhancement
- ✅ shadcn/ui: Feature uses shadcn/ui components exclusively (no custom UI libraries)
- ✅ Tailwind CSS: Feature uses Tailwind for styling
- ✅ Prisma + PostgreSQL: Feature leverages existing user data (no schema changes needed)
- ✅ NextAuth: Feature uses existing auth session management
- ✅ Vitest + Playwright: Feature includes contract tests and integration scenarios
- ✅ Vercel hosting: Feature is web application enhancement

**Post-Design Review**: Phase 1 design confirms no new technologies required. All contracts use existing API patterns, data model leverages current schema, and testing follows established E2E patterns.

**Security & Secrets**: No new secrets required - uses existing NextAuth session handling

**Exceptions Required**: None - design aligns with all constitutional constraints

**Risk Assessment**: Low - UI-only enhancement using proven patterns and existing infrastructure

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
app/                          # Next.js App Router pages
├── api/                      # API routes (if backend changes needed)
├── dashboard/                # Main dashboard (likely location for profile display)
├── auth/                     # Auth pages
└── globals.css               # Global styles

components/                   # React components
├── ui/                       # shadcn/ui components
├── ProfileSettings.tsx       # Existing profile component (may need updates)
├── DisplayNameEditor.tsx     # New component for display name editing
└── [other existing components]

lib/                          # Utility libraries
├── auth.ts                   # NextAuth configuration
├── prisma.ts                 # Database client
└── [other utilities]

prisma/                       # Database schema and migrations
└── schema.prisma            # May need user display_name field updates

e2e/                          # Playwright E2E tests
└── [existing test files]     # May need profile editing tests

test/                         # Vitest unit tests
└── [existing test files]     # May need component tests
```

**Structure Decision**: Web application structure (frontend + backend) - single Next.js application with colocated API routes. Feature primarily affects frontend components with potential backend schema changes for display name storage.

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
- Each contract test → contract test task [P] (6 contract tests from profile-api.contract.spec.ts)
- Each integration scenario → integration test task (8 scenarios from quickstart.md)
- UI component implementation tasks (ProfileDisplay component, header updates)
- API contract validation tasks (ensure existing API meets contract requirements)

**Ordering Strategy**:
- TDD order: Contract tests first, then integration tests, then implementation
- Dependency order: Contract validation → Component creation → Header integration → E2E tests
- Mark [P] for parallel execution: Contract tests can run in parallel, component tasks sequential

**Task Categories**:
1. **Contract Validation** [P]: 6 tasks - Validate existing API meets contract requirements
2. **Component Development**: 3 tasks - Create ProfileDisplay, update headers, adapt DisplayNameEditor
3. **Integration Tests**: 8 tasks - Implement quickstart test scenarios
4. **Accessibility & Mobile**: 2 tasks - Ensure WCAG compliance and responsive behavior
5. **Error Handling**: 1 task - Network failure and validation error handling

**Estimated Output**: 20 numbered, ordered tasks in tasks.md

**Risk Mitigation**: Tasks will include validation steps to ensure existing API contracts are met before UI changes

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
- [x] Phase 0: Research complete (/plan command) - research.md, data-model.md created
- [x] Phase 1: Design complete (/plan command) - contracts/, quickstart.md, agent context updated
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
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
