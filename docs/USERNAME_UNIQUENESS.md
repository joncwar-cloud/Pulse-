# Username Uniqueness Implementation

## Overview
This document explains how username uniqueness is enforced in the Pulse app to ensure each user account has a unique identifier.

## Database Level Enforcement

### Unique Constraint
The `users` table in Supabase should have a UNIQUE constraint on the `username` column. This ensures at the database level that no two users can have the same username.

To verify/add this constraint in Supabase SQL Editor:

```sql
-- Check if unique constraint exists
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'users' AND constraint_type = 'UNIQUE';

-- Add unique constraint if it doesn't exist
ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
```

## Application Level Validation

### Real-time Username Availability Check
In `app/onboarding/profile-setup.tsx`, we implement real-time username validation:

1. **Input Sanitization**: Usernames are automatically sanitized to only allow:
   - Lowercase letters (a-z)
   - Numbers (0-9)
   - Underscores (_)

2. **Debounced Availability Check**: After user stops typing for 500ms, we query the database to check if username is taken

3. **Visual Feedback**:
   - ✅ Green checkmark when username is available
   - ❌ Red error icon when username is taken
   - ⏳ Loading spinner while checking

### Username Rules
- Minimum length: 3 characters
- Maximum length: 20 characters
- Allowed characters: a-z, 0-9, _
- Case insensitive (stored as lowercase)

## Search Functionality

### User Search
In `app/search.tsx` and `services/api/users.ts`, users can be searched by:
- Username (partial match)
- Display name (partial match)

The search is case-insensitive and uses PostgreSQL's `ilike` operator for fuzzy matching.

### Profile Viewing
Users can view any profile by navigating to `/user/[username]`. The profile screen shows:
- User's posts in a grid layout (like TikTok)
- Follow/unfollow functionality
- Direct messaging option
- Profile stats (followers, following, posts)

## Error Handling

### Duplicate Username Error
If somehow a duplicate username makes it through (e.g., race condition), the database will reject it with error code `23505`, which we catch and display a user-friendly message:

```typescript
if (error?.code === '23505') {
  errorMessage = 'This username is already taken. Please choose another.';
}
```

### Profile Creation Fix
Fixed the destructuring error in profile setup where `insertResult` was not properly destructured:

**Before (Buggy):**
```typescript
const insertResult = await supabase.from('users').insert([...]).select().single();
if (insertResult.error) { ... }
```

**After (Fixed):**
```typescript
const { data: insertData, error: insertError } = await supabase.from('users').insert([...]).select().single();
if (insertError) { ... }
```

## TikTok-Style Features

### Profile Grid
- Posts displayed in 3-column grid
- Thumbnail previews for media posts
- Text preview for text-only posts
- Engagement metrics overlay

### User Discovery
- Search by username or display name
- Trending searches section
- Follow/unfollow with optimistic updates
- Real-time follow status

## Best Practices

1. **Always validate on client and server**: Client-side validation provides immediate feedback, but server-side enforcement prevents bypassing
2. **Use database constraints**: They're the ultimate source of truth for uniqueness
3. **Handle edge cases**: Race conditions, network errors, etc.
4. **Provide clear feedback**: Users should always know if their chosen username is available

## Related Files
- `app/onboarding/profile-setup.tsx` - Profile creation with username validation
- `app/user/[username].tsx` - User profile viewing
- `app/search.tsx` - User search interface
- `services/api/users.ts` - User data service
- `services/api/auth.ts` - Authentication and profile creation
- `contexts/UserContext.tsx` - User state management
