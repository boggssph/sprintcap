# Quickstart Test Scenarios: Display Name and Profile Picture

## User Story Validation Tests

### Primary User Story: "As a user, I want to see my display name next to my profile picture so I know I'm logged in correctly"

#### Happy Path Test
```typescript
// test/display-name-visible.spec.ts
test('user can see their display name next to profile picture', async ({ page }) => {
  // Given: User is logged in with display name set
  await loginAsUserWithDisplayName(page, 'John Doe');

  // When: User navigates to dashboard
  await page.goto('/dashboard');

  // Then: Display name appears next to profile picture
  await expect(page.locator('[data-testid="user-display-name"]')).toHaveText('John Doe');
  await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();

  // And: Pencil icon is visible for editing
  await expect(page.locator('[data-testid="edit-display-name"]')).toBeVisible();
});
```

#### Mobile Responsiveness Test
```typescript
// test/display-name-mobile.spec.ts
test('display name is hidden on mobile devices', async ({ page, browserName }) => {
  // Given: User is logged in with display name set
  await loginAsUserWithDisplayName(page, 'John Doe');

  // When: Viewport is mobile size
  await page.setViewportSize({ width: 375, height: 667 });

  // Then: Display name is hidden
  await expect(page.locator('[data-testid="user-display-name"]')).toBeHidden();

  // But: Profile picture remains visible
  await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();

  // And: Edit icon is hidden
  await expect(page.locator('[data-testid="edit-display-name"]')).toBeHidden();
});
```

### Secondary User Story: "As a user, I want to edit my display name inline so I can quickly update it"

#### Edit Flow Test
```typescript
// test/display-name-edit.spec.ts
test('user can edit display name via pencil icon', async ({ page }) => {
  // Given: User is logged in with display name set
  await loginAsUserWithDisplayName(page, 'John Doe');

  // When: User clicks pencil icon
  await page.locator('[data-testid="edit-display-name"]').click();

  // Then: Edit dialog opens
  await expect(page.locator('[data-testid="display-name-dialog"]')).toBeVisible();

  // When: User enters new name and saves
  await page.locator('[data-testid="display-name-input"]').fill('Jane Smith');
  await page.locator('[data-testid="save-display-name"]').click();

  // Then: Dialog closes and name updates
  await expect(page.locator('[data-testid="display-name-dialog"]')).toBeHidden();
  await expect(page.locator('[data-testid="user-display-name"]')).toHaveText('Jane Smith');
});
```

#### Validation Test
```typescript
// test/display-name-validation.spec.ts
test('display name validation prevents invalid input', async ({ page }) => {
  // Given: User opens edit dialog
  await loginAsUserWithDisplayName(page, 'John Doe');
  await page.locator('[data-testid="edit-display-name"]').click();

  // When: User tries to save empty name
  await page.locator('[data-testid="display-name-input"]').fill('');
  await page.locator('[data-testid="save-display-name"]').click();

  // Then: Error message appears
  await expect(page.locator('[data-testid="display-name-error"]')).toContainText('required');

  // When: User tries to save name too short
  await page.locator('[data-testid="display-name-input"]').fill('A');
  await page.locator('[data-testid="save-display-name"]').click();

  // Then: Error message appears
  await expect(page.locator('[data-testid="display-name-error"]')).toContainText('character');
});
```

### Error Handling User Story: "As a user, I want clear error messages if updating fails"

#### Network Error Test
```typescript
// test/display-name-network-error.spec.ts
test('network errors are handled gracefully', async ({ page }) => {
  // Given: API will fail (mock network error)
  await mockApiFailure(page, '/api/user/profile', 500);

  // When: User tries to save display name
  await loginAsUserWithDisplayName(page, 'John Doe');
  await page.locator('[data-testid="edit-display-name"]').click();
  await page.locator('[data-testid="display-name-input"]').fill('New Name');
  await page.locator('[data-testid="save-display-name"]').click();

  // Then: Error message is shown
  await expect(page.locator('[data-testid="display-name-error"]')).toContainText('Failed to update');

  // And: Dialog remains open for retry
  await expect(page.locator('[data-testid="display-name-dialog"]')).toBeVisible();
});
```

## Integration Test Scenarios

### Session Update Test
```typescript
// test/display-name-session-update.spec.ts
test('display name updates persist across page navigation', async ({ page }) => {
  // Given: User updates display name
  await loginAsUserWithDisplayName(page, 'John Doe');
  await updateDisplayName(page, 'Jane Smith');

  // When: User navigates to different page
  await page.goto('/admin'); // or any other page

  // Then: Updated name appears in header
  await expect(page.locator('[data-testid="user-display-name"]')).toHaveText('Jane Smith');
});
```

### Fallback Display Test
```typescript
// test/display-name-fallback.spec.ts
test('fallback to Google name when display name not set', async ({ page }) => {
  // Given: User has no custom display name (only Google OAuth name)
  await loginAsUserWithoutDisplayName(page, 'Google User');

  // Then: Google name is shown
  await expect(page.locator('[data-testid="user-display-name"]')).toHaveText('Google User');
});
```

## Accessibility Test Scenarios

### Screen Reader Test
```typescript
// test/display-name-accessibility.spec.ts
test('display name is accessible to screen readers', async ({ page }) => {
  // Given: User is logged in
  await loginAsUserWithDisplayName(page, 'John Doe');

  // Then: Display name has proper ARIA labels
  const displayName = page.locator('[data-testid="user-display-name"]');
  await expect(displayName).toHaveAttribute('aria-label', 'Current user display name');

  // And: Edit button has accessible label
  const editButton = page.locator('[data-testid="edit-display-name"]');
  await expect(editButton).toHaveAttribute('aria-label', 'Edit display name');
});
```

## Performance Test Scenarios

### Load Time Test
```typescript
// test/display-name-performance.spec.ts
test('display name loads within performance budget', async ({ page }) => {
  // Given: User navigates to page with profile display
  const startTime = Date.now();
  await page.goto('/dashboard');

  // When: Profile display loads
  await page.locator('[data-testid="user-display-name"]').waitFor();

  // Then: Load time is under 100ms
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(100);
});
```