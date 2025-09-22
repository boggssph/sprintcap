import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Accept invite flow (stubbed)', () => {
  test('visit accept-invite link and accept', async ({ page, context }) => {
    // stub accept-invite backend to simulate token validation and acceptance
    await page.route('**/api/accept-invite', async route => {
      const req = route.request()
      const post = await req.postData()
      let body = {}
      try { body = post ? JSON.parse(post) : {} } catch (e) { body = {} }
      // accept any token that starts with "token-" or "regenerated-token-"
      const token = (body as any).token || ''
      if (token && (token.startsWith('token-') || token.startsWith('regenerated-token-'))) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
      }
      return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'invalid token' }) })
    })

    // navigate to the accept page with a stub token
    const token = 'token-' + Math.random().toString(36).slice(2,8)
    await page.goto(`${BASE}/accept-invite?token=${token}`)

  // Expect page to have a button to accept
  await page.locator('[data-testid="accept-email-input"]').fill('new.member@example.com')
  await expect(page.getByRole('button', { name: /Accept Invite/i })).toBeVisible({ timeout: 5000 })
  await page.getByRole('button', { name: /Accept Invite/i }).click()

    // Expect a success message (app shows message from API)
    await expect(page.locator('text=Invitation accepted')).toBeVisible({ timeout: 5000 })
  })
})
