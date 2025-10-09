# Research Findings: Display Name and Profile Picture

## Current State Analysis

### Database Schema ✅
**Decision**: Use existing User model fields
- `displayName: String?` - Already exists, nullable
- `image: String?` - Already exists, nullable (Google OAuth profile pictures)
- No schema changes required

### Existing Components

#### ProfileSettings.tsx ✅
**Current Usage**: Full-page profile management in settings
**Relevant Code**: Complete display name editing with validation (2-50 chars)
**Decision**: Keep as-is for full profile management

#### DisplayNameEditor.tsx ✅
**Current Usage**: Modal dialog for display name editing
**Features**: 
- Pencil icon trigger
- Client-side validation (2-50 chars, required)
- Server-side validation (2-50 chars, required)
- Session update after save
- Error handling for network failures
**Decision**: Adapt this pattern for inline header editing

### API Endpoints ✅
**Decision**: Use existing `/api/user/profile` endpoint
- GET: Fetches user profile data
- PUT: Updates display name with validation
- Already handles authentication and error responses

### UI Patterns

#### Header Components
**ScrumMasterHeader.tsx**: Shows only avatar, no display name
**MemberHeader.tsx**: Shows only avatar, no display name
**Decision**: Add display name + pencil icon to both headers

#### Mobile Responsiveness ✅
**Current Pattern**: `md:hidden` for mobile-specific elements
**Examples**: 
- ScrumMasterHeader hides app title on desktop
- CenteredContainer uses responsive padding: `px-4 sm:px-6 lg:px-8`
**Decision**: Hide display name on mobile (`md:hidden`), show only avatar

### Validation Patterns ✅
**Client-side**: Real-time validation in components
**Server-side**: API validates length and required fields
**Current Rules**: 2-50 characters, alphanumeric + spaces only
**Decision**: Maintain existing validation rules

### Authentication ✅
**NextAuth Integration**: Session updates after profile changes
**Decision**: Use existing `update()` function for session refresh

## Implementation Approach

### Component Architecture
**Decision**: Create `ProfileDisplay` component for reuse
- Props: `showEditIcon`, `mobileHideName`
- Shows: Avatar + Display Name + Pencil Icon (conditional)
- Handles: Click to open DisplayNameEditor dialog

### Integration Points
**Decision**: Update existing header components
- ScrumMasterHeader: Add ProfileDisplay in avatar section
- MemberHeader: Add ProfileDisplay in avatar section
- Maintain existing responsive behavior

### Error Handling ✅
**Decision**: Follow existing patterns
- Network failures: Show error messages
- Validation errors: Client and server-side validation
- Loading states: Spinner during API calls

### Testing Strategy ✅
**Decision**: Follow existing E2E patterns
- Playwright for UI interactions
- Test mobile/desktop responsive behavior
- Test validation error states
- Include `data-testid` selectors

## Alternatives Considered

### Custom Modal vs Existing Dialog
**Alternative**: Build custom inline editor
**Decision**: Use existing DisplayNameEditor dialog
**Rationale**: Consistent UX, proven validation, less code duplication

### New API Endpoint vs Existing
**Alternative**: Create dedicated display name endpoint
**Decision**: Use existing `/api/user/profile` PUT
**Rationale**: Already handles validation, authentication, single source of truth

### Schema Changes vs Existing Fields
**Alternative**: Add new fields for profile display preferences
**Decision**: Use existing `displayName` and `image` fields
**Rationale**: No migration needed, fields already populated by Google OAuth

## Open Questions Resolved

1. **Database support**: ✅ Existing fields sufficient
2. **API availability**: ✅ Existing endpoint works
3. **Component reuse**: ✅ DisplayNameEditor can be adapted
4. **Mobile behavior**: ✅ Hide name on mobile, clear patterns exist
5. **Validation rules**: ✅ 2-50 chars, existing implementation
6. **Error handling**: ✅ Network failures handled in existing components