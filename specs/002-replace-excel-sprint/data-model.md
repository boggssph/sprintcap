# Data Model: 002-replace-excel-sprint

## Entities

### User
- id: UUID
- email: string (unique)
- role: enum (ADMIN | SCRUM_MASTER | MEMBER)
- createdAt: timestamp
- lastSeen: timestamp

### Invitation
- id: UUID
- invitedEmail: string
- tokenHash: string (SHA-256)
- invitedRole: enum (SCRUM_MASTER | MEMBER)
- status: enum (PENDING | ACCEPTED | EXPIRED | REVOKED)
- expiresAt: timestamp
- createdBy: UUID (User.id)
- createdAt: timestamp
- metadata: jsonb (optional)

### AuditLog
- id: UUID
- actorId: UUID (User.id or system)
- action: string
- targetId: UUID (Invitation.id or User.id)
- metadata: jsonb
- createdAt: timestamp

### CapacityPlan (future)
- id: UUID
- sprintName: string
- startDate: date
- endDate: date
- capacityEntries: jsonb

## Indexes & Constraints
- Invitation: index on (invitedEmail), index on (status, createdAt)
- AuditLog: index on (createdAt)
- Ensure tokenHash column is non-null and unique per active invite

## State transitions (Invitation)
- On create: status=PENDING, expiresAt=now()+TTL
- On accept: status=ACCEPTED, record actor in AuditLog, link/create User
- On revoke/regenerate: previous invite status=EXPIRED/REVOKED, new invite created with new tokenHash

