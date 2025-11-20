-- Migration to add unique constraint to Instagram field in users table
-- This ensures that each Instagram username can only be used by one user

-- Add unique constraint to instagram column
-- Note: This will fail if there are existing duplicate Instagram values
-- We need to handle duplicates first if they exist

-- First, check if there are any duplicate Instagram values
-- If duplicates exist, we need to handle them before adding the constraint
DO $$ 
DECLARE
    duplicate_count INTEGER;
BEGIN
    -- Count duplicate Instagram values (excluding NULL values)
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT instagram 
        FROM public.users 
        WHERE instagram IS NOT NULL 
        GROUP BY instagram 
        HAVING COUNT(*) > 1
    ) AS duplicates;
    
    -- If duplicates exist, raise an exception with instructions
    IF duplicate_count > 0 THEN
        RAISE EXCEPTION 
            'Found % duplicate Instagram values. Please resolve duplicates before applying this migration. '
            'You can identify duplicates with: '
            'SELECT instagram, COUNT(*) FROM public.users WHERE instagram IS NOT NULL GROUP BY instagram HAVING COUNT(*) > 1;',
            duplicate_count;
    END IF;
END $$;

-- Now add the unique constraint (only if no duplicates exist)
ALTER TABLE public.users 
ADD CONSTRAINT unique_instagram UNIQUE (instagram);

-- Create an index for better performance on Instagram lookups
CREATE INDEX IF NOT EXISTS idx_users_instagram ON public.users (instagram);

-- Update the comment on the table to document the constraint
COMMENT ON CONSTRAINT unique_instagram ON public.users IS 'Ensures Instagram usernames are unique across all users';
