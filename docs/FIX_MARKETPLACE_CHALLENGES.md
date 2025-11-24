# Fix Marketplace & Challenges Errors

This guide will help you fix the Supabase errors for Marketplace and Challenges features.

## Errors You're Experiencing

1. ✅ `[MarketplaceService] Error fetching listings: [object Object]`
2. ✅ `[ChallengesService] Error fetching challenges: [object Object]`
3. ✅ `Invariant Violation: Changing onViewableItemsChanged on the fly is not supported`

## Solution Overview

The errors occur because:
- **Marketplace/Challenges tables might not be created** in your Supabase database
- **Row Level Security (RLS) policies** might be missing or misconfigured
- **FlatList onViewableItemsChanged** callback needs to be memoized (already fixed in code)

## Step-by-Step Fix

### Step 1: Run the SQL Setup Script

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Copy and paste the SQL script**
   - Open the file: `docs/MARKETPLACE_CHALLENGES_SETUP.sql`
   - Copy ALL the contents
   - Paste into the Supabase SQL Editor

4. **Run the script**
   - Click "Run" (or press Ctrl/Cmd + Enter)
   - Wait for completion (should see "Success" message)

### Step 2: Create Storage Bucket for Images

Since you can't install/create buckets programmatically, you need to create it manually:

1. **Go to Storage in Supabase Dashboard**
   - Click "Storage" in the left sidebar
   - Click "+ New bucket"

2. **Create marketplace-images bucket**
   - Bucket name: `marketplace-images`
   - Public bucket: ✅ Yes (checked)
   - Click "Create bucket"

3. **Configure bucket policies**
   - Click on the `marketplace-images` bucket
   - Go to "Policies" tab
   - Click "+ New policy"
   - Select "For full customization" → "Create policy"
   - Add these policies:

   **Policy 1: Allow public viewing**
   ```
   Policy name: Anyone can view marketplace images
   Allowed operation: SELECT
   Target roles: public
   USING expression: bucket_id = 'marketplace-images'
   ```

   **Policy 2: Allow authenticated uploads**
   ```
   Policy name: Authenticated users can upload
   Allowed operation: INSERT
   Target roles: authenticated
   WITH CHECK expression: bucket_id = 'marketplace-images'
   ```

   **Policy 3: Allow users to update their own images**
   ```
   Policy name: Users can update their own images
   Allowed operation: UPDATE
   Target roles: authenticated
   USING expression: bucket_id = 'marketplace-images' AND auth.uid()::text = (storage.foldername(name))[1]
   WITH CHECK expression: bucket_id = 'marketplace-images' AND auth.uid()::text = (storage.foldername(name))[1]
   ```

   **Policy 4: Allow users to delete their own images**
   ```
   Policy name: Users can delete their own images
   Allowed operation: DELETE
   Target roles: authenticated
   USING expression: bucket_id = 'marketplace-images' AND auth.uid()::text = (storage.foldername(name))[1]
   ```

### Step 3: Verify Tables Were Created

1. **Go to Table Editor**
   - Click "Table Editor" in the left sidebar

2. **Check for these tables:**
   - ✅ `marketplace_listings` - Should have columns: id, seller_id, title, description, price, images, category, condition, location, etc.
   - ✅ `challenges` - Should have columns: id, creator_id, title, description, hashtag, thumbnail_url, participant_count, etc.

3. **Check RLS is enabled**
   - Click on each table
   - Look for "RLS enabled" badge (should be green/active)

### Step 4: Test the Features

1. **Test Marketplace**
   - Go to the Marketplace tab in your app
   - Try creating a new listing
   - Click the "+" button
   - Fill in all required fields (title, description, price, category, location)
   - Add at least one image
   - Click "Post"
   - Should see success message and listing should appear in the feed

2. **Test Challenges**
   - Go to the Challenges tab
   - Try creating a new challenge (from profile or challenges page)
   - Should see challenges list without errors

## Troubleshooting

### Still seeing errors?

1. **Check console logs** for more detailed error messages
   - Look for specific error codes or messages from Supabase

2. **Verify your user is authenticated**
   ```javascript
   // In your app, check:
   const { user } = useUser();
   console.log('Current user:', user);
   ```

3. **Check RLS policies are correct**
   - Go to Supabase Dashboard → Table Editor
   - Click on `marketplace_listings` or `challenges`
   - Click "Policies" tab
   - Verify all 4 policies exist for each table

4. **Test with Supabase client directly**
   ```javascript
   // Try this in your app to test connection:
   const { data, error } = await supabase
     .from('marketplace_listings')
     .select('*')
     .limit(1);
   
   console.log('Test query result:', { data, error });
   ```

### Common Issues

**Issue: "relation does not exist"**
- Solution: Table wasn't created. Re-run the SQL script from Step 1.

**Issue: "permission denied for table"**
- Solution: RLS policies are missing or incorrect. Re-run the SQL script from Step 1.

**Issue: "row-level security policy violation"**
- Solution: You're not authenticated or the policy doesn't allow the operation.
- Make sure you're logged in
- Check the specific RLS policy for that operation

**Issue: Images not uploading**
- Solution: Storage bucket doesn't exist or policies are wrong.
- Create the bucket manually (Step 2)
- Make sure it's public
- Add all 4 storage policies

## What the SQL Script Does

The SQL script (`MARKETPLACE_CHALLENGES_SETUP.sql`) does the following:

1. **Creates tables** if they don't exist
   - `marketplace_listings` - For storing marketplace items
   - `challenges` - For storing user-created challenges

2. **Creates indexes** for better performance
   - Speeds up queries on frequently accessed columns

3. **Enables Row Level Security (RLS)**
   - Protects your data
   - Ensures users can only modify their own content

4. **Creates RLS policies**
   - Anyone can view active listings/challenges
   - Only authenticated users can create listings/challenges
   - Users can only update/delete their own content

5. **Creates helper functions**
   - Auto-updates `updated_at` timestamp on record changes

## Verification Checklist

After completing all steps, verify:

- ✅ Tables exist: `marketplace_listings` and `challenges`
- ✅ RLS is enabled on both tables
- ✅ All RLS policies are in place (4 policies per table)
- ✅ Storage bucket `marketplace-images` exists and is public
- ✅ Storage policies are configured (4 policies)
- ✅ You can create a marketplace listing without errors
- ✅ You can view marketplace listings
- ✅ You can view challenges list

## Need More Help?

If you're still experiencing issues:

1. Check the browser console for detailed error messages
2. Check the Supabase logs in Dashboard → Logs
3. Verify your Supabase URL and anon key in `.env` or `services/supabase.ts`
4. Make sure your Supabase project has at least one user signed up

---

**Note**: The FlatList error was already fixed in the code by removing unnecessary `onViewableItemsChanged` callbacks. If you still see this error, try restarting your development server.
