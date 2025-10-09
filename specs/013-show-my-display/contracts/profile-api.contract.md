# API Contracts: User Profile Management

## GET /api/user/profile

Retrieves the current user's profile information including display name and profile picture.

### Request
```http
GET /api/user/profile
Authorization: Bearer {nextauth-session}
```

### Response (200 OK)
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string | null",
    "displayName": "string | null",
    "image": "string | null",
    "role": "ADMIN | SCRUM_MASTER | MEMBER",
    "createdAt": "string (ISO date)"
  }
}
```

### Error Responses
- **401 Unauthorized**: Missing or invalid session
- **404 Not Found**: User not found in database
- **500 Internal Server Error**: Database or server error

## PUT /api/user/profile

Updates the current user's display name.

### Request
```http
PUT /api/user/profile
Authorization: Bearer {nextauth-session}
Content-Type: application/json

{
  "displayName": "string (2-50 chars, alphanumeric + spaces)"
}
```

### Request Validation
- `displayName`: Required, string, 2-50 characters, trimmed
- Must contain only alphanumeric characters and spaces
- Cannot be empty after trimming

### Response (200 OK)
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string | null",
    "displayName": "string",
    "image": "string | null",
    "role": "ADMIN | SCRUM_MASTER | MEMBER",
    "createdAt": "string (ISO date)"
  }
}
```

### Error Responses
- **400 Bad Request**: Validation failed
  ```json
  {
    "error": "Display name is required" |
           "Display name must be less than 50 characters"
  }
  ```
- **401 Unauthorized**: Missing or invalid session
- **500 Internal Server Error**: Database update failed

## Contract Tests

### Profile Fetch Test
```typescript
// contracts/profile-get.contract.ts
test('GET /api/user/profile returns user data', async () => {
  const response = await fetch('/api/user/profile', {
    headers: { 'cookie': 'next-auth.session-token=valid-token' }
  });

  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data).toHaveProperty('user');
  expect(data.user).toHaveProperty('displayName');
  expect(data.user).toHaveProperty('image');
});
```

### Display Name Update Test
```typescript
// contracts/profile-update.contract.ts
test('PUT /api/user/profile updates display name', async () => {
  const response = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: {
      'cookie': 'next-auth.session-token=valid-token',
      'content-type': 'application/json'
    },
    body: JSON.stringify({ displayName: 'John Doe' })
  });

  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.user.displayName).toBe('John Doe');
});
```

### Validation Error Test
```typescript
// contracts/profile-validation.contract.ts
test('PUT /api/user/profile rejects invalid display name', async () => {
  const response = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: {
      'cookie': 'next-auth.session-token=valid-token',
      'content-type': 'application/json'
    },
    body: JSON.stringify({ displayName: '' })
  });

  expect(response.status).toBe(400);
  const data = await response.json();
  expect(data.error).toContain('required');
});
```