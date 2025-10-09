# Quickstart Guide: Squads Tab Redesign

**Feature**: 014-as-scrum-master
**Date**: October 9, 2025

## Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Vercel account for deployment
- Google OAuth credentials configured

## Local Development Setup

### 1. Database Setup
```bash
# Copy environment template
cp .env.example .env.local

# Configure database URL
DATABASE_URL="postgresql://user:password@localhost:5432/sprintcap"

# Run migrations
npx prisma migrate dev
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access Application
- Open `http://localhost:3000`
- Navigate to `/dashboard/scrum-master`
- Login as a Scrum Master user

## Testing the Feature

### Manual Testing Steps

1. **Empty State Verification**
   - Navigate to Squads tab
   - Verify centered empty state message
   - Click "Create New Squad" button
   - Confirm drawer opens

2. **Squad Creation Flow**
   - Fill squad name and alias
   - Submit form
   - Verify squad appears in list
   - Verify drawer closes automatically

3. **Error Handling**
   - Try creating squad with duplicate alias
   - Verify inline error message appears
   - Try submitting empty form
   - Verify field-level validation

4. **Mobile Testing**
   - Resize browser to mobile width
   - Verify drawer becomes full-screen
   - Test touch interactions

### Automated Testing

```bash
# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Run all tests
npm test
```

## API Testing

### List Squads
```bash
curl -X GET http://localhost:3000/api/squads \
  -H "Authorization: Bearer <token>"
```

### Create Squad
```bash
curl -X POST http://localhost:3000/api/squads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Alpha Team", "alias": "alpha"}'
```

## Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
Ensure these are set in Vercel:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Troubleshooting

### Common Issues

**Drawer not opening on mobile**
- Check Tailwind responsive classes
- Verify shadcn/ui Drawer component import

**Form validation not working**
- Check form schema in component
- Verify error state handling

**API calls failing**
- Check authentication token
- Verify database connection
- Check API route handlers

### Debug Commands

```bash
# Check database connection
npx prisma studio

# View application logs
vercel logs

# Run linting
npm run lint
```

## Performance Validation

### Load Time Targets
- **Desktop**: <20ms page load
- **Mobile**: <15ms page load

### Test Commands
```bash
# Performance testing
npm run build
npm run start

# Lighthouse audit
npx lighthouse http://localhost:3000/dashboard/scrum-master
```