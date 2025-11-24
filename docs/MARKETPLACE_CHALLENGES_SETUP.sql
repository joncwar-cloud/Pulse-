-- ==========================================
-- MARKETPLACE & CHALLENGES SETUP FOR SUPABASE
-- ==========================================
-- Run this SQL in your Supabase SQL Editor
-- This will create the necessary tables and RLS policies

-- ==========================================
-- 1. MARKETPLACE_LISTINGS TABLE
-- ==========================================

-- Create marketplace_listings table if it doesn't exist
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON public.marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON public.marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_created ON public.marketplace_listings(created_at DESC);

-- Enable RLS
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Sellers can update their own listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Sellers can delete their own listings" ON public.marketplace_listings;

-- RLS Policies for marketplace_listings

-- Anyone can view active listings
CREATE POLICY "Anyone can view active listings"
ON public.marketplace_listings
FOR SELECT
TO public
USING (status = 'active');

-- Authenticated users can create listings
CREATE POLICY "Authenticated users can create listings"
ON public.marketplace_listings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own listings
CREATE POLICY "Sellers can update their own listings"
ON public.marketplace_listings
FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- Sellers can delete their own listings
CREATE POLICY "Sellers can delete their own listings"
ON public.marketplace_listings
FOR DELETE
TO authenticated
USING (auth.uid() = seller_id);

-- ==========================================
-- 2. CHALLENGES TABLE
-- ==========================================

-- Create challenges table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  hashtag TEXT NOT NULL,
  thumbnail_url TEXT,
  participant_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  prize TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_challenges_creator ON public.challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON public.challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenges_created ON public.challenges(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_participants ON public.challenges(participant_count DESC);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active challenges" ON public.challenges;
DROP POLICY IF EXISTS "Authenticated users can create challenges" ON public.challenges;
DROP POLICY IF EXISTS "Creators can update their own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Creators can delete their own challenges" ON public.challenges;

-- RLS Policies for challenges

-- Anyone can view active challenges
CREATE POLICY "Anyone can view active challenges"
ON public.challenges
FOR SELECT
TO public
USING (true);

-- Authenticated users can create challenges
CREATE POLICY "Authenticated users can create challenges"
ON public.challenges
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own challenges
CREATE POLICY "Creators can update their own challenges"
ON public.challenges
FOR UPDATE
TO authenticated
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

-- Creators can delete their own challenges
CREATE POLICY "Creators can delete their own challenges"
ON public.challenges
FOR DELETE
TO authenticated
USING (auth.uid() = creator_id);

-- ==========================================
-- 3. STORAGE BUCKET FOR MARKETPLACE IMAGES
-- ==========================================

-- Create marketplace-images storage bucket if it doesn't exist
-- Note: You might need to run this in the Supabase Dashboard under Storage
-- Or use the Supabase CLI

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('marketplace-images', 'marketplace-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies for marketplace-images bucket
-- DROP POLICY IF EXISTS "Anyone can view marketplace images" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload marketplace images" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their own marketplace images" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their own marketplace images" ON storage.objects;

-- CREATE POLICY "Anyone can view marketplace images"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'marketplace-images');

-- CREATE POLICY "Authenticated users can upload marketplace images"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'marketplace-images');

-- CREATE POLICY "Users can update their own marketplace images"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (bucket_id = 'marketplace-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their own marketplace images"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'marketplace-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ==========================================
-- 4. HELPER FUNCTIONS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_marketplace_listings_updated_at ON public.marketplace_listings;
CREATE TRIGGER update_marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_challenges_updated_at ON public.challenges;
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- SETUP COMPLETE!
-- ==========================================
-- Now your marketplace and challenges features should work!
-- 
-- IMPORTANT NOTES:
-- 1. Make sure users table exists with proper structure
-- 2. For storage bucket, create it manually in Supabase Dashboard:
--    - Go to Storage → Create new bucket
--    - Name: "marketplace-images"
--    - Public: Yes
-- 3. Then configure storage policies in the Storage settings
