# Quickstart: Capacity Plan Tab

**Feature**: 021-as-scrum-master
**Date**: 2025-10-10

## Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Jira API credentials
- Scrum Master account with squad access

## Environment Setup
1. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

2. Configure required variables:
   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="..."
   JIRA_BASE_URL="https://your-domain.atlassian.net"
   JIRA_EMAIL="your-email@domain.com"
   JIRA_API_TOKEN="..."
   ```

## Database Migration
1. Generate and run migration:
   ```bash
   npx prisma migrate dev --name add-capacity-planning
   ```

2. Seed test data (optional):
   ```bash
   npx prisma db seed
   ```

## Development Server
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000

## Testing the Feature
1. Log in as a Scrum Master
2. Navigate to Dashboard → Capacity Plan tab
3. Mark a sprint as active (if none exist)
4. Create, edit, and delete tickets in capacity plan cards

## Manual Testing Checklist
- [ ] Capacity Plan tab appears in navigation
- [ ] Only active sprints are displayed
- [ ] Each sprint shows in its own card
- [ ] CRUD operations work on tickets
- [ ] Empty states display correctly
- [ ] Responsive design on mobile
- [ ] Error handling for API failures

## Automated Testing
```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e -- --grep "capacity plan"

# Lint and type check
npm run lint
npm run type-check
```

## Troubleshooting
- **No sprints visible**: Ensure user is Scrum Master of squads with active sprints
- **API errors**: Check Jira credentials and network connectivity
- **Database errors**: Verify migration ran successfully
- **Auth issues**: Confirm NextAuth configuration

## Deployment
1. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

2. Run database migrations on production:
   ```bash
   vercel env pull
   npx prisma migrate deploy
   ```

3. Test on production domain (www.sprintcap.info)