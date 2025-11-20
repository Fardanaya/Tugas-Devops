-- Fix RLS policy for carts table to allow soft delete operations
-- Simplified approach: allow users to update any rows they can see

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can manage their own cart" ON carts;

-- Create simpler policies - allow users to manage their own cart items
-- regardless of is_deleted status (to allow soft delete operations)

-- Policy for selecting/viewing cart items
CREATE POLICY "Users can view their own cart" ON carts FOR SELECT
USING (auth.uid() = user_id);

-- Policy for inserting new cart items
CREATE POLICY "Users can add to their cart" ON carts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for updating cart items (including soft delete)
CREATE POLICY "Users can update their cart items" ON carts FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for deleting cart items (hard delete - though we use soft delete)
CREATE POLICY "Users can delete their cart items" ON carts FOR DELETE
USING (auth.uid() = user_id);

-- Admins still have full access
CREATE POLICY "Admins can manage all carts" ON carts FOR ALL
USING (is_current_user_admin());
