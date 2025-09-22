import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Admin invite flow (stubbed)', () => {
  test('create, regenerate, revoke invite', async ({ page, context }) => {
    // allow clipboard access
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    // in-memory invites store to simulate backend state
    const invites: any[] = []

    await page.route('**/api/invite*', async route => {
      const req = route.request()
      console.log('Intercepted', req.method(), req.url())
      const method = req.method()
      if (method === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ invites, nextCursor: null }) })
      }

      if (method === 'POST') {
        const post = await req.postData()
        let body = {}
        try { body = post ? JSON.parse(post) : {} } catch (e) { body = {} }

        if ((body as any).action === 'regenerate') {
          const inviteId = (body as any).inviteId
          const token = 'regenerated-token-' + Math.random().toString(36).slice(2,8)
          const inv = invites.find(i => i.id === inviteId)
          if (inv) inv.tokenHash = 'hash-' + token
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: inviteId, token }) })
        }

        if ((body as any).action === 'revoke') {
          const inviteId = (body as any).inviteId
          const idx = invites.findIndex(i => i.id === inviteId)
          if (idx >= 0) invites[idx].status = 'EXPIRED'
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: inviteId }) })
        }

        // create
        const id = 'inv-' + Math.random().toString(36).slice(2,8)
        const token = 'token-' + Math.random().toString(36).slice(2,8)
        const payload = body as any
        const now = new Date().toISOString()
        const newInvite = { id, email: payload.email, invitedRole: payload.role || 'MEMBER', expiresAt: now, createdAt: now, status: 'PENDING' }
        invites.unshift(newInvite)
        return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id, token }) })
      }

      return route.continue()
    })

    await page.goto(`${BASE}/admin`)

  // create invite using testids
    await page.locator('[data-testid="invite-email-input"]').fill('new.member@example.com')
    await page.locator('select').first().selectOption('MEMBER')

  // Click Create Invite and concurrently wait for the POST /api/invite response to avoid races
  const [createResp] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/invite') && resp.request().method() === 'POST' && resp.status() === 201),
    page.locator('[data-testid="create-invite-btn"]').click(),
  ])
  const createJson = await createResp.json()
  const createdId = createJson.id
  await expect(page.locator('text=Invite created')).toBeVisible({ timeout: 2000 })
  const clip = await page.evaluate(() => navigator.clipboard.readText())
  expect(clip).toMatch(/\/accept-invite\?token=token-/)

  // Force a reload so the page re-fetches invites and the stubbed GET will return our created invite
  await page.reload({ waitUntil: 'networkidle' })

  // wait for the invite row to appear using testid
  await page.waitForSelector(`[data-testid="invite-row-${createdId}"]`, { timeout: 15000 })
  const firstRow = page.locator(`[data-testid="invite-row-${createdId}"]`)

  // regenerate via Copy Accept Link (POST handled by route stub)
  await firstRow.locator(`[data-testid="copy-link-${createdId}"]`).click()
  const clip2 = await page.evaluate(() => navigator.clipboard.readText())
  expect(clip2).toMatch(/\/accept-invite\?token=/)

  // Revoke the invite via an in-page fetch so the page.route stub handles it
  const revokeStatus = await page.evaluate(async (id) => {
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'revoke', inviteId: id })
    })
    return res.status
  }, createdId)
  expect(revokeStatus).toBe(200)

  // Reload and assert the invite shows as EXPIRED
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector(`[data-testid="invite-row-${createdId}"]`, { timeout: 10000 })
  const expiredRow = page.locator(`[data-testid="invite-row-${createdId}"]`)
  await expect(expiredRow.locator(`[data-testid="invite-status-${createdId}"]`)).toContainText('EXPIRED')
  })
})
