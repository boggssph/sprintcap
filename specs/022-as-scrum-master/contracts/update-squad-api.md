# API Contract: Update Squad

**Endpoint**: `PATCH /api/squads/[id]`
**Purpose**: Update squad information including name, alias, and ceremony time defaults
**Authorization**: Scrum Master role required

## Request

### URL Parameters
- `id`: Squad ID (string, required)

### Request Body
```typescript
{
  name?: string;                    // Squad name (unique per organization)
  alias?: string;                   // Squad alias (unique globally, optional)
  dailyScrumMinutes?: number;       // Daily scrum minutes (positive integer)
  refinementHours?: number;         // Refinement hours per week (positive float)
  reviewDemoMinutes?: number;       // Review/demo minutes per sprint (positive integer)
  planningHours?: number;           // Planning hours per week (positive float)
  retrospectiveMinutes?: number;    // Retrospective minutes per week (positive integer)
}
```

### Validation Rules
- **name**: If provided, must be unique within the squad's organization
- **alias**: If provided, must be unique across all squads
- **dailyScrumMinutes**: Must be positive integer (> 0)
- **refinementHours**: Must be positive float (> 0)
- **reviewDemoMinutes**: Must be positive integer (> 0)
- **planningHours**: Must be positive float (> 0)
- **retrospectiveMinutes**: Must be positive integer (> 0)

## Response

### Success Response (200)
```typescript
{
  id: string;
  name: string;
  alias?: string;
  dailyScrumMinutes: number;
  refinementHours: number;
  reviewDemoMinutes: number;
  planningHours: number;
  retrospectiveMinutes: number;
  organizationId: string;
  createdAt: string;  // ISO date string
  updatedAt: string;  // ISO date string
}
```

### Error Responses

#### 400 Bad Request
```typescript
{
  error: "ValidationError",
  message: "Invalid request data",
  details: {
    field: string;  // Field name that failed validation
    message: string; // Validation error message
  }[]
}
```

#### 403 Forbidden
```typescript
{
  error: "ForbiddenError",
  message: "Insufficient permissions"
}
```

#### 404 Not Found
```typescript
{
  error: "NotFoundError",
  message: "Squad not found"
}
```

#### 409 Conflict
```typescript
{
  error: "ConflictError",
  message: "Squad name or alias already exists",
  details: {
    field: "name" | "alias";
    value: string;
  }
}
```

## Business Rules

### Authorization
- User must have Scrum Master role
- User must be a member of the squad's organization

### Data Consistency
- Updates are atomic (all fields succeed or all fail)
- Uniqueness constraints enforced at database level
- Audit timestamps automatically updated

### Ceremony Defaults
- Only provided fields are updated (partial update)
- Defaults apply only to new sprints
- Existing sprints retain original ceremony allocations

## Examples

### Update Squad Name and Alias
```http
PATCH /api/squads/clq2x8y9k0000abcdefghijk
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Frontend Team",
  "alias": "frontend"
}
```

### Update Ceremony Defaults
```http
PATCH /api/squads/clq2x8y9k0000abcdefghijk
Content-Type: application/json
Authorization: Bearer <token>

{
  "dailyScrumMinutes": 20,
  "refinementHours": 1.5,
  "reviewDemoMinutes": 45,
  "planningHours": 1.5,
  "retrospectiveMinutes": 45
}
```

## Testing Requirements

### Contract Tests
- Validate request/response schemas
- Test all validation error scenarios
- Test authorization requirements
- Test uniqueness constraint violations
- Test partial update behavior