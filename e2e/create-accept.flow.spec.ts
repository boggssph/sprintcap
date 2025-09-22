import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Full create → accept invite flow (stubbed)', () => {
  test('admin creates invite and new user accepts', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    const invites: any[] = []

    // stub /api/invite to manage invites in-memory
    await page.route('**/api/invite*', async route => {
      const req = route.request()
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
          if (inv) {
            inv.token = token
            inv.tokenHash = 'hash-' + token
          }
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
        const newInvite = { id, email: payload.email, invitedRole: payload.role || 'MEMBER', expiresAt: now, createdAt: now, status: 'PENDING', token }
        invites.unshift(newInvite)
        return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id, token }) })
      }
      return route.continue()
    })

    // stub accept-invite API to validate token and mark invite accepted
    await page.route('**/api/accept-invite', async route => {
      const req = route.request()
      const post = await req.postData()
      let body = {}
      try { body = post ? JSON.parse(post) : {} } catch (e) { body = {} }
      const token = (body as any).token
      const userEmail = (body as any).userEmail
      const inv = invites.find(i => i.token === token)
      if (inv && token && userEmail && userEmail.toLowerCase() === inv.email.toLowerCase()) {
        inv.status = 'ACCEPTED'
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
      }
      return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'invalid' }) })
    })

    // go to admin and create invite
    await page.goto(`${BASE}/admin`)
    await page.locator('[data-testid="invite-email-input"]').fill('fullflow.user@example.com')
    await page.locator('select').first().selectOption('MEMBER')

    const [createResp] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/invite') && resp.request().method() === 'POST' && resp.status() === 201),
      page.locator('[data-testid="create-invite-btn"]').click(),
    ])
    const createJson = await createResp.json()

    // clipboard should contain accept link
    const clip = await page.evaluate(() => navigator.clipboard.readText())
    expect(clip).toMatch(/\/accept-invite\?token=/)

    // navigate to accept link
    await page.goto(clip)

  // fill email and click accept
  await page.locator('[data-testid="accept-email-input"]').fill('fullflow.user@example.com')
  await expect(page.getByRole('button', { name: /Accept Invite/i })).toBeVisible({ timeout: 5000 })
  await page.getByRole('button', { name: /Accept Invite/i }).click()

    // success message
    await expect(page.locator('text=Invitation accepted')).toBeVisible({ timeout: 5000 })

    // also assert invites array was updated
    const row = invites.find(i => i.id === createJson.id)
    expect(row).toBeTruthy()
    expect(row.status).toBe('ACCEPTED')
  })
})
