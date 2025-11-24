# 🔧 Quick Fix Checklist - Marketplace & Challenges

## Current Issues
- ❌ `[MarketplaceService] Error fetching listings`
- ❌ `[ChallengesService] Error fetching challenges`
- ✅ `Invariant Violation: onViewableItemsChanged` (Already fixed in code)

## 5-Minute Fix

### 1️⃣ Run SQL Script in Supabase (2 min)
```bash
# Open: https://supabase.com/dashboard
# Go to: SQL Editor → New query
# Copy & paste: docs/MARKETPLACE_CHALLENGES_SETUP.sql
# Click: Run
```

### 2️⃣ Create Storage Bucket (2 min)
```bash
# In Supabase Dashboard:
# 1. Storage → + New bucket
# 2. Name: "marketplace-images"
# 3. Public: ✅ Yes
# 4. Create bucket
```

### 3️⃣ Add Storage Policies (1 min)
```bash
# Click on marketplace-images bucket → Policies tab
# Add 4 policies (use templates in FIX_MARKETPLACE_CHALLENGES.md)
```

### 4️⃣ Test (30 sec)
```bash
# Open app
# Try creating a marketplace listing
# Should work without errors! ✅
```

## What Changed?

### ✅ Code Fixes Applied
- FlatList callbacks are now properly memoized
- Error handling improved
- Console logging added for better debugging

### 📝 What YOU Need to Do on Supabase

**Run this SQL script** → `docs/MARKETPLACE_CHALLENGES_SETUP.sql`

This creates:
- ✅ `marketplace_listings` table
- ✅ `challenges` table  
- ✅ RLS policies (Row Level Security)
- ✅ Indexes for performance
- ✅ Triggers for auto-updating timestamps

**Create storage bucket** → `marketplace-images`

This allows:
- ✅ Image uploads for listings
- ✅ Public image viewing
- ✅ Secure user-owned image management

## Verification

After completing the steps above, check:

```javascript
// ✅ These should work without errors:
1. View Marketplace tab
2. Click "+" to create listing
3. Add images, fill form, submit
4. View Challenges tab
5. See challenges list

// ❌ If you see errors, check:
- Supabase SQL script ran successfully
- Tables exist in Table Editor
- RLS is enabled on tables
- Storage bucket exists and is public
- You're logged in (authenticated)
```

## Common Errors & Quick Fixes

| Error | Quick Fix |
|-------|-----------|
| "relation does not exist" | Re-run SQL script |
| "permission denied" | Check RLS policies |
| "storage bucket not found" | Create bucket manually |
| "policy violation" | Make sure you're logged in |

## Need the Full Guide?

📖 See: `docs/FIX_MARKETPLACE_CHALLENGES.md` for detailed step-by-step instructions with screenshots and troubleshooting.

---

**TL;DR**: Run the SQL script in Supabase + Create the storage bucket = Everything works! 🎉
