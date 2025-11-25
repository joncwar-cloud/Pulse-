# Marketplace Setup Guide - Complete Instructions

## Current Status
✅ Code is ready and type-safe  
✅ React Query integration is complete  
✅ Mock data fallback is in place  
⚠️ Database table needs to be created in Supabase  

## Setup Instructions

### Step 1: Access Supabase SQL Editor
1. Go to https://supabase.com
2. Open your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Run the Database Setup SQL

Copy and paste the following SQL into the editor and click "Run":

```sql
-- ==========================================
-- MARKETPLACE SETUP FOR SUPABASE
-- ==========================================

-- 1. Create marketplace_listings table
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('new', 'like-new', 'good', 'fair')),
  location TEXT NOT NULL,
  shipping_available BOOLEAN DEFAULT false,
  shipping_price DECIMAL(10,2),
  local_pickup BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON public.marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON public.marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_created ON public.marketplace_listings(created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies (if any)
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Sellers can update their own listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Sellers can delete their own listings" ON public.marketplace_listings;

-- 5. Create RLS Policies

-- Allow anyone to view active listings
CREATE POLICY "Anyone can view active listings"
ON public.marketplace_listings
FOR SELECT
TO public
USING (status = 'active');

-- Allow authenticated users to create listings
CREATE POLICY "Authenticated users can create listings"
ON public.marketplace_listings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

-- Allow sellers to update their own listings
CREATE POLICY "Sellers can update their own listings"
ON public.marketplace_listings
FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- Allow sellers to delete their own listings
CREATE POLICY "Sellers can delete their own listings"
ON public.marketplace_listings
FOR DELETE
TO authenticated
USING (auth.uid() = seller_id);

-- 6. Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_marketplace_listings_updated_at ON public.marketplace_listings;
CREATE TRIGGER update_marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Verify Table Creation
After running the SQL, verify the table was created:
1. In Supabase, go to "Table Editor"
2. You should see `marketplace_listings` in the list
3. Click on it to view the structure

### Step 4: Create Storage Bucket (Optional - for image uploads)

If you want to store images in Supabase Storage:

1. Go to "Storage" in Supabase
2. Click "Create a new bucket"
3. Name it: `marketplace-images`
4. Make it **Public**
5. Click "Create bucket"

Then run this SQL to set up storage policies:

```sql
-- Storage policies for marketplace images
CREATE POLICY "Anyone can view marketplace images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'marketplace-images');

CREATE POLICY "Authenticated users can upload marketplace images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'marketplace-images');

CREATE POLICY "Users can update their own marketplace images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'marketplace-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own marketplace images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'marketplace-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Testing the Setup

### Test 1: View Listings
1. Open the app
2. Navigate to the Marketplace tab
3. You should see mock listings initially
4. Once the database is set up, it will switch to real data

### Test 2: Create a Listing
1. Make sure you're logged in
2. Click the "+" button in the top right
3. Fill in all required fields:
   - Add at least 1 photo
   - Enter title (required)
   - Enter description (required)
   - Enter price (required)
   - Select category (required)
   - Select condition (required)
   - Enter location (required)
   - Choose delivery options
4. Click "Post"
5. You should see a success message
6. The listing should appear in the marketplace

### Test 3: Search Listings
1. Use the search bar at the top
2. Type keywords to search
3. Results should filter in real-time

## Troubleshooting

### Error: "Could not find the table 'public.marketplace_listings'"
**Solution**: Run the SQL setup from Step 2 above

### Error: "Permission denied for table marketplace_listings"
**Solution**: Make sure RLS policies are created (Step 5 in the SQL)

### Error: "Failed to fetch"
**Solution**: Check your internet connection and Supabase project URL in environment variables

### Error: "relation 'users' does not exist"
**Solution**: Make sure the `users` table exists first. If not, you need to set up the users table

### Storage bucket errors
**Solution**: These are warnings only. The app will work with URLs instead. Create the storage bucket if you want to use Supabase storage.

## What's Working Now

✅ **Graceful Fallbacks**: App uses mock data if database isn't ready  
✅ **Type Safety**: Full TypeScript types for all database operations  
✅ **React Query**: Proper caching, loading states, and error handling  
✅ **Optimistic Updates**: Form state management with proper validation  
✅ **Error Messages**: User-friendly error messages with helpful hints  
✅ **Permission Handling**: Proper authentication checks  

## Database Schema Details

### marketplace_listings Table
- `id`: UUID (Primary Key)
- `seller_id`: UUID (Foreign Key to users)
- `title`: TEXT (required)
- `description`: TEXT (required)
- `price`: DECIMAL(10,2) (required)
- `images`: TEXT[] (array of image URLs)
- `category`: TEXT (required)
- `condition`: TEXT ('new', 'like-new', 'good', 'fair')
- `location`: TEXT (required)
- `shipping_available`: BOOLEAN
- `shipping_price`: DECIMAL(10,2) (nullable)
- `local_pickup`: BOOLEAN
- `views`: INTEGER
- `status`: TEXT ('active', 'sold', 'inactive')
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### Row Level Security (RLS)
- ✅ Public can view active listings
- ✅ Authenticated users can create listings
- ✅ Users can only edit/delete their own listings
- ✅ Automatic user ID validation

## Next Steps After Setup

Once the database is set up:

1. **Test Creating**: Create your first listing
2. **Test Viewing**: Verify it appears in the feed
3. **Test Searching**: Search for your listing
4. **Test Images**: Try uploading photos (will use URLs if storage not set up)
5. **Test Updates**: Edit your listing
6. **Test Delete**: Remove a listing

## Support

If you encounter any issues:
1. Check the console logs (they include helpful debug info)
2. Verify all SQL was run successfully
3. Check RLS policies are enabled
4. Ensure you're logged in when creating listings
5. Verify your Supabase project URL and anon key are correct

---

**Status**: Ready for testing once database is set up  
**Last Updated**: 2025-01-25
