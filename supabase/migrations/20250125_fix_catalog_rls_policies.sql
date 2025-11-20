-- Fix RLS policies for catalog table to allow admin operations
-- This migration adds INSERT, UPDATE, and DELETE policies for admin users

-- Drop existing catalog policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to catalog" ON catalog;
DROP POLICY IF EXISTS "Admins have full access" ON catalog;

-- Create new comprehensive policies for catalog table
-- Public read access for all users
CREATE POLICY "Allow public read access to catalog" ON catalog FOR SELECT USING (true);

-- Admin full access for all operations
CREATE POLICY "Admins have full access to catalog" ON catalog FOR ALL USING (is_current_user_admin());

-- Enable RLS (should already be enabled, but just in case)
ALTER TABLE catalog ENABLE ROW LEVEL SECURITY;

-- Verify the policies are working correctly
COMMENT ON POLICY "Allow public read access to catalog" ON catalog IS 'Allows any user to read catalog items';
COMMENT ON POLICY "Admins have full access to catalog" ON catalog IS 'Allows admin users to perform all operations on catalog';
