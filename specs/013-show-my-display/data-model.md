# Data Model: Display Name and Profile Picture

## Entities

### User (Existing - No Changes Required)
```typescript
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  providerId String?  @unique
  name      String?  // Google OAuth name
  displayName String? // Custom display name (2-50 chars)
  image     String?  // Profile picture URL (Google OAuth)
  role      UserRole @default(MEMBER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // relations (unchanged)
  squads     SquadMember[]
  absences   Absence[]
  assignments Assignment[]
  sprintMembers SprintMember[]
  dayAllocations DayAllocation[]
  auditLogs  AuditLog[]
}
```

### Display Name Validation Rules
- **Required**: Cannot be empty or whitespace-only
- **Length**: 2-50 characters inclusive
- **Characters**: Alphanumeric (a-z, A-Z, 0-9) and spaces only
- **Trimming**: Leading/trailing whitespace removed before validation

### Profile Picture
- **Source**: Google OAuth `image` field
- **Fallback**: First character of display name (or name if no display name)
- **Storage**: URL string, no local file handling required

## State Transitions

### Display Name Editing Flow
1. **Initial State**: Display current display name (or fallback to Google name)
2. **Edit Trigger**: Click pencil icon → Open dialog
3. **Validation State**: Real-time validation as user types
4. **Saving State**: API call in progress, disable form
5. **Success State**: Update session, close dialog, show success feedback
6. **Error State**: Show validation or network error, allow retry

### Mobile Responsiveness States
- **Desktop (>768px)**: Show avatar + display name + pencil icon
- **Mobile (≤768px)**: Show only avatar (name hidden, icon hidden)

## Data Flow

### Read Operations
```
UI Component → NextAuth Session → Display Logic
                      ↓
              API Call → Database (if needed)
```

### Write Operations
```
UI Component → Validation → API Call → Database Update → Session Update → UI Refresh
```

## Error States

### Validation Errors
- **Empty name**: "Display name cannot be empty"
- **Too short**: "Display name must be at least 2 characters"
- **Too long**: "Display name must be less than 50 characters"
- **Invalid characters**: "Display name can only contain letters, numbers, and spaces"

### Network Errors
- **Connection failed**: "Failed to update display name"
- **Server error**: "Failed to update display name"
- **Unauthorized**: Redirect to login (handled by NextAuth)

### Fallback Behavior
- **No display name**: Use Google OAuth `name` field
- **No profile picture**: Use display name first character
- **Session loading**: Show loading spinner