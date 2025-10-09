import { test, expect } from '@playwright/test'

// Dynamic header test: simulate varying header heights and ensure nav doesn't overlap
test.describe('ScrumMaster nav dynamic header', () => {
  test('does not overlap with header when header height changes (desktop)', async ({ page }) => {
    await page.goto('/dashboard/scrum-master')
    await page.setViewportSize({ width: 1280, height: 900 })

    const header = page.locator('header, [data-testid="scrummaster-header"], .scrum-master-header')
    const nav = page.locator('[data-testid="scrummaster-nav"]')

    // baseline measurements
    const headerBox = await header.boundingBox()
    const navBox = await nav.boundingBox()
    expect(headerBox).toBeTruthy()
    expect(navBox).toBeTruthy()

    // assert no vertical overlap
    if (headerBox && navBox) {
      expect(navBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 1)
    }

    // simulate an increased header height by injecting a tall banner
    await page.evaluate(() => {
      const banner = document.createElement('div')
      banner.id = 'test-banner'
      banner.style.height = '120px'
      banner.style.background = 'rgba(255,0,0,0.03)'
      banner.innerText = 'TEST BANNER'
      document.body.insertBefore(banner, document.body.firstChild)
    })

    // re-measure
    const headerBox2 = await header.boundingBox()
    const navBox2 = await nav.boundingBox()
    if (headerBox2 && navBox2) {
      expect(navBox2.y).toBeGreaterThanOrEqual(headerBox2.y + headerBox2.height - 1)
    }
  })
})
