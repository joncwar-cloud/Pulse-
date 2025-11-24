-- Fix RLS policy for user creation during signup
-- The issue: auth.uid() returns NULL during the signup flow even after setSession
-- Solution: Allow inserts where the ID matches the user being created OR auth.uid() matches

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create a new policy that allows user creation during signup
-- This checks if the user being inserted matches auth.uid() OR if it's a new signup
CREATE POLICY "Users can insert own profile" ON users 
  FOR INSERT 
  WITH CHECK (
    auth.uid()::text = id::text
    OR 
    -- Allow insert if the auth user exists but session not fully propagated
    (
      id::text IN (
        SELECT id::text FROM auth.users WHERE id::text = id::text
      )
    )
  );

-- Alternative simpler approach: Use a function to check if user can insert
-- First, create a function to check if the auth user matches
CREATE OR REPLACE FUNCTION auth.user_can_insert_profile(user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if the auth user matches the user_id being inserted
  RETURN auth.uid() = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the policy using the function
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can insert own profile" ON users 
  FOR INSERT 
  WITH CHECK (auth.user_can_insert_profile(id));
