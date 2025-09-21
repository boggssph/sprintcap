# Sprint Capacity Planner (scaffold)

Minimal scaffold for Sprint Capacity Planner using Next.js, Tailwind, shadcn-style components, Prisma, Neon, NextAuth (Google-only), and Brevo for email invites.

Quick start

1. Copy `.env.example` to `.env` and fill in values (Neon DATABASE_URL, Google OAuth keys, Brevo key).
2. Install deps: `npm install`.
3. For local development using SQLite (no Neon required): set `DATABASE_URL="file:./dev.db"` in `.env`.
4. Run migrations and generate client:

```bash
npx prisma --schema=prisma/schema.sqlite.prisma migrate dev --name init
npx prisma generate --schema=prisma/schema.sqlite.prisma
```

5. Run the app:

```bash
npm run dev
```

Google OAuth callback URL
- When you create Google OAuth credentials, set the Authorized redirect URI to: `http://localhost:3000/api/auth/callback/google` for local testing.


Env vars
- `DATABASE_URL` - Postgres connection for Neon
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth keys
- `BREVO_API_KEY` - Brevo transactional email key
