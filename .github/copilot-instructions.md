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
- 005-add-a-version: Added TypeScript 5.x + Next.js App Router, Tailwind CSS, shadcn/ui
- 004-as-scrum-master: Sprint creation functionality for Scrum Masters with automatic squad member population
- 003-i-want-this: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]

<!-- MANUAL ADDITIONS START -->
Whenever troubleshooting, circumspection is required and avoid making knee-jerk changes that could introduce new issues.
<!-- MANUAL ADDITIONS END -->

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
