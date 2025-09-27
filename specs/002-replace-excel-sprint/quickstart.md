# Quickstart: 002-replace-excel-sprint

## Local development
1. Install dependencies:

```bash
npm install
```

2. Environment variables (do NOT commit secrets)

All secrets MUST be stored in Vercel Environment Variables (or another approved secrets manager). Do not commit `.env` files to the repository.

For local development, use `vercel env pull` to populate a local `.env` file from Vercel without committing it, or use `vercel env add` to add secrets to Vercel:

```bash
# Pull env vars into .env.local (do not commit this file)
vercel env pull .env.local

# Add a secret to Vercel (interactive)
vercel env add DATABASE_URL
```

Example of a local `.env.local` (generated via `vercel env pull`):

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_long_random_secret_here
DEV_AUTH_ENABLED=true # only for local dev
BREVO_API_KEY=changeme
```

3. Run migrations and start dev server:

```bash
npx prisma migrate dev
npm run dev
```

4. Running Playwright locally:
- Use a test email interception tool (MailHog) or local dev mailbox.
- For deterministic flows, enable `DEV_AUTH_ENABLED=true` locally; do NOT enable in production.

## CI notes

## Prisma pooling examples
 
-## Prisma Data Proxy and migrations (production guidance)
- For serverless platforms like Vercel, prefer Prisma Data Proxy to avoid connection exhaustion when using Neon. Alternatively, configure a connection pooler per Neon documentation.
- In CI and deployment, run migrations using `npx prisma migrate deploy` (non-interactive) against the production/staging database. Do NOT run `prisma migrate dev` in CI.

Example (GitHub Actions snippet):
```yaml
- name: Run migrations
	run: npx prisma migrate deploy --schema=prisma/schema.prisma
	env:
		DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

