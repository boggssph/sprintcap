// Placeholder accessibility test file. To enable axe checks:
// 1) npm install --save-dev jest-axe axe-core
// 2) set ENABLE_AXE_TESTS=true and run the test locally.
describe('Accessibility checks (placeholder)', () => {
  it('axe integration placeholder (disabled)', () => {
    if (!process.env.ENABLE_AXE_TESTS) return
  })
})
