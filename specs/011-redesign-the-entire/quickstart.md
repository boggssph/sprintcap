# Quickstart: UI/UX Redesign

## Prerequisites
- Node.js 18+
- npm or yarn
- Access to shadcn/ui MCP for component management

## Setup
1. Ensure shadcn/ui is installed: `npm install -D shadcn`
2. Start MCP server: `npx shadcn@latest mcp`
3. Use MCP for component additions/updates

## Applying the Redesign
1. **Audit Current Components**: Review existing components in `/components` for redundancy.
2. **Update Themes**: Modify `tailwind.config.js` for new design tokens if needed.
3. **Redesign Pages**: Update page components in `/app` using new shadcn components.
4. **Test Performance**: Run `npm run build` and check bundle sizes.
5. **E2E Testing**: Update Playwright tests for new selectors.

## Key Changes
- All internal pages redesigned for speed and simplicity.
- Landing page unchanged.
- Performance targets: <20ms load, <15ms mobile.
- Use best judgement for shadcn themes and accessibility.

## Rollback
If needed, revert component changes via git.