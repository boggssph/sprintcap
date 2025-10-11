# sprintCap Development Guidelines

## ⚠️ CRITICAL: Testing Policy

**ALWAYS test on the production domain: `www.sprintcap.info`**

Do NOT use Vercel deployment URLs like `https://sprint-xxx.vercel.app` for testing because:
- These URLs change with every deployment
- Google OAuth requires adding each new URL to authorized redirect URIs
- This creates unnecessary configuration overhead

All manual testing should be done on `www.sprintcap.info` only.

---

Auto-generated from all feature plans. Last updated: 2025-09-28

## Active Technologies
- TypeScript 5.9 + Next.js, Prisma, Playwrigh (001-bootstrap)
- Sprint Management: Sprint creation with automatic member population (004-as-scrum-master)
- TypeScript 5.x + Next.js App Router, Tailwind CSS, shadcn/ui (005-add-a-version)
- N/A (version from git/build process) (005-add-a-version)
- TypeScript 5.x + Next.js App Router, Vercel API (006-the-version-number)
- N/A (external API integration only) (006-the-version-number)
- TypeScript 5.x + Next.js App Router, Tailwind CSS, shadcn/ui, Prisma, PostgreSQL (007-the-ui-to)
- PostgreSQL (via Prisma ORM) (007-the-ui-to)
- TypeScript 5.x + Next.js App Router, Prisma ORM, PostgreSQL, shadcn/ui components (008-bug-found-there)
- TypeScript 5.x + Next.js App Router, shadcn/ui, NextAuth, Prisma (013-show-my-display)
- TypeScript 5.x + Next.js App Router, React, Tailwind CSS, shadcn/ui (015-stack-the-squad)
- PostgreSQL (Neon) via Prisma ORM (015-stack-the-squad)
- TypeScript 5.x + Next.js App Router, shadcn/ui Avatar components, NextAuth (016-the-avatar-seem)
- PostgreSQL via Prisma ORM (016-the-avatar-seem)
- TypeScript 5.x + Next.js App Router, Tailwind CSS, shadcn/ui components (017-modify-the-drawercontent)
- N/A (UI-only change) (017-modify-the-drawercontent)
- TypeScript (v5.x) + Next.js (App Router), Tailwind CSS, shadcn/ui, Prisma, PostgreSQL (019-the-create-new)
- TypeScript (v5.x) + Next.js (App Router), Prisma ORM, PostgreSQL, shadcn/ui components (020-as-scrum-master)
- PostgreSQL (hosted on Neon) (020-as-scrum-master)
- TypeScript 5.x + Next.js App Router, Prisma ORM, PostgreSQL, shadcn/ui components, Tailwind CSS (022-as-scrum-master)

## Project Structure
```
backend/
frontend/
tests/
```

## Commands
npm test [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES] npm run lint

## Code Style
TypeScript 5.9: Follow standard conventions

## Recent Changes
- 022-as-scrum-master: Added TypeScript 5.x + Next.js App Router, Prisma ORM, PostgreSQL, shadcn/ui components, Tailwind CSS
- 020-as-scrum-master: Added TypeScript (v5.x) + Next.js (App Router), Prisma ORM, PostgreSQL, shadcn/ui components
- 019-the-create-new: Added TypeScript (v5.x) + Next.js (App Router), Tailwind CSS, shadcn/ui, Prisma, PostgreSQL

<!-- MANUAL ADDITIONS START -->
Whenever troubleshooting, circumspection is required and avoid making knee-jerk changes that could introduce new issues.
<!-- MANUAL ADDITIONS END -->

<!-- MANUAL ADDITIONS START -->
Use the shadcn mcp that is locally running in this local machine docker container for all UI component development.
<!-- MANUAL ADDITIONS END -->

<!-- MANUAL ADDITIONS START -->
## UI/UX Redesign Guidelines (011-redesign-the-entire)
- **Landing Page**: Keep unchanged - clean, Jony Ive-inspired design.
- **Internal Pages**: Redesign for speed and simplicity, eliminate "bullshit" elements.
- **Performance**: Target <200ms page load, <150ms mobile.
- **Components**: Use shadcn/ui exclusively via MCP, apply best judgement for themes.
- **Accessibility**: Use best judgement for standards, ensure WCAG compliance.
- **Testing**: Update E2E tests for new UI, maintain data-testid selectors.
<!-- MANUAL ADDITIONS END -->

<!-- MANUAL ADDITIONS START -->
## Drawer Component Usage Patterns (014-as-scrum-master)
- **Import**: Use `import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"`
- **Mobile Behavior**: Drawer automatically becomes full-screen on mobile devices (< 768px)
- **Desktop Behavior**: Side drawer with backdrop on larger screens
- **Form Integration**: Place forms inside DrawerContent with proper spacing
- **State Management**: Use local state for open/close, combine with form state for navigation guards
- **Accessibility**: Include proper ARIA labels and keyboard navigation (Escape to close)
- **Animation**: Use default smooth animations, avoid custom transitions unless necessary
<!-- MANUAL ADDITIONS END -->
