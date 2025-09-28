# data-model.md

## Entities

- User
  - id: string (uuid)
  - email: string (unique, indexed)
  - name: string | null
  - role: enum('ADMIN','SCRUM_MASTER','MEMBER')
  - providerId: string | null (e.g., Google sub)
  - createdAt: timestamp
  - updatedAt: timestamp

- Invite
  - id: string (uuid)
  - email: string (indexed)
  - squadId: string | null
  - role: enum('SCRUM_MASTER','MEMBER')
  - status: enum('PENDING','ACCEPTED','REVOKED')
  - createdAt: timestamp

## Indexes & Uniqueness
- User.email unique
- User.providerId unique (nullable)

## Constraints & Validation
- Email must be canonicalized (lowercase, trimmed) before matching
- providerId should be stored when available to prevent aliasing problems

## State transitions
- Invite: PENDING -> ACCEPTED -> (optional) REVOKED
