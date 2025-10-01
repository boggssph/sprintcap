# Vercel API Integration Contract

## Overview
This contract defines the integration with Vercel Deployments API for retrieving current deployment version information.

## API Endpoint

### Get Latest Production Deployment
**Endpoint**: `GET /v13/deployments`  
**Base URL**: `https://api.vercel.com`  
**Authentication**: Bearer token (`VERCEL_ACCESS_TOKEN`)

#### Request
```http
GET /v13/deployments?projectId={PROJECT_ID}&state=READY&limit=1 HTTP/1.1
Host: api.vercel.com
Authorization: Bearer {VERCEL_ACCESS_TOKEN}
Content-Type: application/json
```

#### Parameters
- `projectId`: Vercel project ID (from environment)
- `state`: Filter for 'READY' deployments only
- `limit`: 1 (get latest only)

#### Response (Success)
```json
{
  "deployments": [
    {
      "id": "dpl_1234567890abcdef",
      "name": "sprint-cap",
      "url": "sprint-cap.vercel.app",
      "createdAt": 1699123456789,
      "state": "READY",
      "meta": {
        "githubCommitSha": "abc123def456",
        "githubCommitMessage": "feat: add version display",
        "githubCommitAuthorName": "Developer Name"
      },
      "inspectorUrl": "https://vercel.com/.../inspector"
    }
  ]
}
```

#### Response (Error)
```json
{
  "error": {
    "code": "forbidden",
    "message": "Insufficient permissions"
  }
}
```

## Contract Tests

### Test Case 1: Successful Version Retrieval
```typescript
// contracts/vercel-api.contract.test.ts
describe('Vercel API Integration', () => {
  test('should retrieve latest production deployment', async () => {
    const response = await fetchVercelDeployment();
    expect(response.deployments).toHaveLength(1);
    expect(response.deployments[0].state).toBe('READY');
    expect(response.deployments[0].url).toBeDefined();
  });
});
```

### Test Case 2: API Authentication Failure
```typescript
test('should handle authentication failure gracefully', async () => {
  // Mock invalid token
  const response = await fetchVercelDeployment();
  expect(response).toBeNull(); // Contract expects null on auth failure
});
```

### Test Case 3: Network Failure
```typescript
test('should handle network failures', async () => {
  // Mock network error
  const response = await fetchVercelDeployment();
  expect(response).toBeNull(); // Contract expects null on network failure
});
```

### Test Case 4: Invalid Response Format
```typescript
test('should handle malformed API responses', async () => {
  // Mock invalid JSON response
  const response = await fetchVercelDeployment();
  expect(response).toBeNull(); // Contract expects null on invalid response
});
```

## Service Level Agreement

### Availability
- API must respond within 5 seconds
- 99.9% uptime expectation (Vercel SLA)
- Graceful degradation when unavailable

### Rate Limits
- Vercel API rate limits apply
- Client must implement backoff strategy
- No more than 1 request per 30 seconds per user

### Data Freshness
- Deployments API reflects real-time state
- No caching at API level
- Client-side caching allowed per performance requirements

## Error Handling Contract

### Client Responsibilities
- Handle all error conditions gracefully
- Never expose API tokens or internal errors to client
- Implement appropriate retry logic
- Log errors for monitoring (without sensitive data)

### Error Response Mapping
- `401 Unauthorized` → Authentication failure → Return null
- `403 Forbidden` → Permission denied → Return null
- `429 Too Many Requests` → Rate limited → Return null with backoff
- `5xx Server Error` → Service unavailable → Return null
- Network timeout → Connection failed → Return null
- Invalid JSON → Parse error → Return null

## Version Compatibility

### API Version
- Current: v13
- Breaking changes must be tested before upgrade
- Backward compatibility monitoring required

### Client Version Handling
- No explicit versioning required
- API responses assumed stable within major version
- Contract tests validate response structure