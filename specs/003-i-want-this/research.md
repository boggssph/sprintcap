# research.md

Decision: Confirmed behavior from spec clarifications

- Unknown accounts: Block access and show a clear "Not invited" message (per spec clarification A).
- Role model: Use ADMIN, SCRUM_MASTER, MEMBER roles (per spec clarification B).
- First-user bootstrap: Auto-promote the first registered user to ADMIN (per spec clarification C).

Rationale:

- Blocking unknown accounts keeps invites and access controlled, reducing risk of accidental sign-ups.
- A three-role model (ADMIN, SCRUM_MASTER, MEMBER) supports separation of concerns: ADMIN for global management, SCRUM_MASTER for squad leadership, MEMBER for regular users.
- Auto-promoting the first user to ADMIN simplifies initial bootstrap for small deployments while keeping subsequent account creation controlled via invites.

Alternatives considered:

- Auto-create pending invites: adds implementation complexity (email workflows) and delays access; rejected in favor of a simpler access-control model.
- Auto-create as MEMBER for all sign-ins: rejected because the product requires invite-only access for the domain.

Open concerns (deferred to Phase 1):

- Invite lifecycle and revocation UI/flows (Phase 1 will provide API contracts for invite creation/revocation).
