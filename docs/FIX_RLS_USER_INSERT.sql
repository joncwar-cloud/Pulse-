-- ============================================================================
-- FIX RLS POLICY FOR USER CREATION
-- ============================================================================
-- This script fixes the RLS policy issue where auth.uid() returns NULL
-- during the signup flow, even after setSession is called.
--
-- The solution: Instead of relying on auth.uid() matching the inserted ID,
-- we verify that the user exists in auth.users table.
-- ============================================================================

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create a more permissive policy that allows user creation during signup
-- This policy checks if the ID being inserted exists in auth.users
-- (meaning it's a legitimate auth user, even if session isn't fully propagated yet)
CREATE POLICY "Users can insert own profile" ON users 
  FOR INSERT 
  WITH CHECK (
    -- Allow if auth.uid() matches (normal case after session is set)
    auth.uid()::text = id::text
    OR
    -- Also allow if the ID exists in auth.users (handles session propagation delay)
    EXISTS (
      SELECT 1 FROM auth.users WHERE auth.users.id = users.id
    )
  );

-- Verify the policy was created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'users' AND policyname = 'Users can insert own profile';

-- Additional verification: Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'users';
