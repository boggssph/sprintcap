# Development Setup

This document explains how to set up the project for local development.

Prerequisites
- Node.js 18.x
- npm
- PostgreSQL (or use a hosted Neon instance)
- `npx` installed (bundled with Node.js)

1. Clone the repo

```bash
git clone git@github.com:boggssph/sprintcap.git
cd sprintcap
```

2. Install dependencies

```bash
npm ci
```

3. Environment variables

Create a `.env` file with the following (example values):

```
DATABASE_URL=postgresql://user:pass@localhost:5432/sprintcap
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=some-random-secret
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
BREVO_API_KEY=
```

4. Prisma

```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. Start the dev server

```bash
npm run dev
```

6. Local authentication for development

- A Credentials provider is available when NODE_ENV !== 'production'. Use the "Dev Sign-in" provider in the NextAuth sign-in UI.
- For E2E tests, the API route `pages/api/invite.ts` accepts a dev-only `x-test-user` header or `?test_user=` query param to bypass auth.

Notes
- This app uses Next.js (App Router), Tailwind, Prisma and NextAuth.
- If you regenerate the Prisma schema, run `npx prisma generate`.
