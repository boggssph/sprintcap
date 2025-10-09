# API Contract: Squads with Member Details

## GET /api/squads

Retrieves all squads for the authenticated Scrum Master, including member details.

### Request
```
GET /api/squads
Authorization: Bearer <token>
```

### Response (200 OK)
```json
[
  {
    "id": "string",
    "name": "string",
    "alias": "string",
    "memberCount": "number",
    "createdAt": "string (ISO date)",
    "members": [
      {
        "id": "string",
        "name": "string",
        "joinedAt": "string (ISO date)"
      }
    ]
  }
]
```

### Response (401 Unauthorized)
```json
{
  "error": "Unauthorized"
}
```

### Business Rules
- Only returns squads owned by the authenticated Scrum Master
- Includes complete member list for each squad
- Members ordered by join date (oldest first)
- Maximum 25 members per squad (enforced at data level)

### Usage
This endpoint is used by the SquadsTab component to display squad cards with member information. The response data is used to:
- Render squad cards in vertical layout
- Display member names and join dates within each card
- Show member count in card summary
- Handle empty states when no members exist</content>
<parameter name="filePath">/Users/fseguerra/Projects/sprintCap/specs/015-stack-the-squad/contracts/get-squads-members.md