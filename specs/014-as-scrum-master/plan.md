
# Implementation Plan: Squads Tab Redesign

**Branch**: `014-as-scrum-master` | **Date**: October 9, 2025 | **Spec**: /Users/fseguerra/Projects/sprintCap/specs/014-as-scrum-master/spec.md
**Input**: Feature specification from `/specs/014-as-scru**Phase Status**:
- [x] Phase 0: Research complete (/plan command) - research.md created with drawer UX decisions
- [x] Phase 1: Design complete (/plan command) - design.md, data-model.md, quickstart.md, contracts/ created, agent context updated
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command) - tasks.md created with 29 numbered tasks
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passedr/spec.md`

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
Redesign the Scrum Master dashboard Squads tab to show only a clean squads list with a prominent "Create New Squad" CTA button that opens a drawer containing the squad creation form. The drawer will be full-screen on mobile devices, show inline error messages for failed creation attempts, and require confirmation before closing when navigating away.

## Technical Context
**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js App Router, shadcn/ui, Prisma, PostgreSQL
**Storage**: PostgreSQL via Prisma ORM
**Testing**: Vitest (unit) and Playwright (E2E)
**Target Platform**: Web application (Vercel hosting)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <20ms page load, <15ms mobile
**Constraints**: Must use shadcn/ui components exclusively, maintain existing squad creation API
**Scale/Scope**: Single dashboard tab redesign, existing squad data model

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
✅ **UI & Styling**: Uses shadcn/ui components (Drawer, Button, etc.) and Tailwind CSS - COMPLIES  
✅ **Persistence & Hosting**: Uses existing Prisma/PostgreSQL setup and Vercel hosting - COMPLIES  
✅ **Auth & Email**: Uses existing NextAuth setup - COMPLIES  
✅ **Testing & CI**: Will use Vitest and Playwright - COMPLIES  
✅ **Secrets Policy**: No new secrets introduced - COMPLIES  

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
### Source Code (repository root)
```
app/
├── dashboard/
│   └── scrum-master/
│       └── page.tsx          # Main dashboard with tabs
├── api/
│   └── squads/               # Existing squad API endpoints
└── components/
    ├── ui/                   # shadcn/ui components (drawer, button, etc.)
    └── ScrumMasterHeader.tsx # Dashboard header component

lib/
├── prisma/                   # Database schema and client
└── services/                 # Business logic services

tests/
├── e2e/                      # Playwright E2E tests
├── integration/              # Integration tests
└── unit/                     # Vitest unit tests
```

**Structure Decision**: Web application structure with Next.js App Router. The feature primarily modifies the existing scrum-master dashboard page and adds drawer functionality using existing shadcn/ui components.
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

1. **Extract unknowns from Technical Context**:
   - Drawer component behavior on mobile devices (full-screen vs partial)
   - Confirmation dialog UX patterns for unsaved changes
   - Empty state design patterns for list views
   - Inline error message positioning in forms

2. **Research findings**:
   - **Decision**: Use shadcn/ui Drawer component with full-screen mobile behavior
     **Rationale**: Consistent with existing UI patterns, provides good mobile UX
     **Alternatives considered**: Modal dialog (less mobile-friendly), slide-out panel (less standard)
   
   - **Decision**: Show confirmation dialog when navigating away from open drawer
     **Rationale**: Prevents accidental data loss, follows common web app patterns
     **Alternatives considered**: Auto-save drafts (adds complexity), no confirmation (poor UX)
   
   - **Decision**: Empty state with centered message and prominent CTA button
     **Rationale**: Clear call-to-action, follows established design patterns
     **Alternatives considered**: Minimal empty state (less discoverable), auto-create first squad (unexpected)

**Output**: All unknowns resolved through analysis of existing codebase patterns and shadcn/ui documentation.

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Data Model** (`data-model.md`):
   - **Squad Entity**: name (string), alias (string, unique), memberCount (number)
   - **Relationships**: Squad belongs to ScrumMaster (user)
   - **Validation**: Name and alias required, alias must be unique
   - **State**: No complex state transitions (simple CRUD)

2. **API Contracts** (`/contracts/`):
   - `GET /api/squads` - List squads for current user
   - `POST /api/squads` - Create new squad
   - Existing contracts remain unchanged

3. **Contract Tests**: Generated from API contracts (request/response validation)

4. **Test Scenarios**: 
   - Empty squads list display
   - Squad creation via drawer
   - Error handling in form
   - Navigation confirmation

5. **Agent Context Update**: Updated `.github/copilot-instructions.md` with drawer usage patterns

**Output**: data-model.md, contracts/, quickstart.md, updated agent context

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load tasks template and generate from Phase 1 design docs
- Create tasks for drawer component implementation
- Create tasks for empty state handling
- Create tasks for form validation and error display
- Create tasks for navigation confirmation logic

**Ordering Strategy**:
- TDD order: Component tests before implementation
- Sequential: UI components → business logic → integration
- Mark [P] for parallel tasks (independent components)

**Estimated Output**: 15-20 numbered tasks covering component creation, testing, and integration

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
- [x] Phase 0: Research complete (/plan command) - research.md created with drawer UX decisions
- [x] Phase 1: Design complete (/plan command) - design.md, data-model.md, quickstart.md, contracts/ created, agent context updated
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Tasks generated and ready for execution

---
*Based on Constitution v2.2.0 - See `/memory/constitution.md`*
