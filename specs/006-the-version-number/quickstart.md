# Quickstart: Show Vercel Deployment Version

## Feature Overview
This feature displays the current Vercel deployment version in the footer of all application pages. Version information is retrieved directly from Vercel API on each page load.

## Prerequisites
- Vercel project deployed and accessible
- `VERCEL_ACCESS_TOKEN` environment variable configured in Vercel
- `VERCEL_PROJECT_ID` environment variable configured in Vercel

## Manual Testing Checklist

### 1. Environment Setup
- [ ] Verify Vercel environment variables are set:
  - `VERCEL_ACCESS_TOKEN`: Valid Vercel API token
  - `VERCEL_PROJECT_ID`: Your Vercel project ID
- [ ] Confirm production deployment is active

### 2. Basic Functionality Test
- [ ] Navigate to landing page (`www.sprintcap.info`)
- [ ] Verify version information appears in footer
- [ ] Check version format (should show deployment ID or commit info)
- [ ] Navigate to dashboard pages
- [ ] Verify version appears consistently in footer
- [ ] Navigate to admin pages
- [ ] Verify version appears consistently in footer

### 3. Real-time Update Test
- [ ] Note current version displayed
- [ ] Trigger new Vercel deployment (push to main branch)
- [ ] Wait for deployment to complete
- [ ] Refresh application pages
- [ ] Verify version information updates to new deployment

### 4. Error Handling Test
- [ ] Temporarily remove `VERCEL_ACCESS_TOKEN` from Vercel environment
- [ ] Redeploy application
- [ ] Verify version information is hidden (no error messages)
- [ ] Restore `VERCEL_ACCESS_TOKEN`
- [ ] Redeploy and verify version reappears

### 5. Performance Test
- [ ] Use browser dev tools network tab
- [ ] Navigate between pages quickly
- [ ] Verify API calls complete within 100ms (check timing)
- [ ] Verify no duplicate API calls within 30 seconds

### 6. Cross-browser Test
- [ ] Test in Chrome/Chromium
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Verify consistent footer display and version information

## Automated Test Validation

### Unit Tests
```bash
npm test -- test/unit/lib/version.test.ts
```
- [ ] Version retrieval logic tests pass
- [ ] Error handling tests pass
- [ ] Cache management tests pass

### Integration Tests
```bash
npm test -- test/integration/version-api.test.ts
```
- [ ] API integration tests pass
- [ ] Authentication tests pass
- [ ] Error scenario tests pass

### E2E Tests
```bash
npx playwright test e2e/version-display.spec.ts
```
- [ ] Footer display tests pass
- [ ] Cross-page consistency tests pass
- [ ] Error state tests pass

## Troubleshooting

### Version Not Displaying
1. Check Vercel environment variables are set correctly
2. Verify API token has correct permissions
3. Check browser network tab for API failures
4. Review server logs for authentication errors

### Version Not Updating
1. Confirm new deployment completed successfully
2. Check if browser cache is interfering
3. Verify API is returning updated deployment information
4. Clear browser cache and retry

### Performance Issues
1. Check network latency to Vercel API
2. Verify caching is working (should see 304 responses)
3. Review API rate limiting status
4. Check for excessive API calls

## Success Criteria
- [ ] Version displays on all pages within 100ms
- [ ] Version updates automatically after new deployments
- [ ] No version shown when API unavailable (graceful degradation)
- [ ] All automated tests pass
- [ ] Manual testing checklist completed successfully

## Rollback Plan
If issues occur:
1. Remove version display from footer component
2. Keep version API logic for future use
3. No data loss or functionality impact