-- Migration to revert the image column addition from users table
-- This removes the image column and restores the original sync function

-- First, drop the image index if it exists
DROP INDEX IF EXISTS idx_users_image;

-- Remove the image column from public.users table
ALTER TABLE public.users 
DROP COLUMN IF EXISTS image;

-- Restore the original sync_user_to_public function (without image field)
CREATE OR REPLACE FUNCTION sync_user_to_public()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into public.users when a new user is created in auth.users
    INSERT INTO public.users (id, email, name, full_name, is_admin, created_at, updated_at)
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'name', 
        NULL, 
        COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
        NOW(), 
        NOW()
    )
    ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email,
        name = EXCLUDED.name,
        is_admin = COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, public.users.is_admin),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the trigger to ensure it uses the restored function
DROP TRIGGER IF EXISTS sync_user_trigger ON auth.users;
CREATE TRIGGER sync_user_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_to_public();

-- Remove the comment on the image column (if it exists)
COMMENT ON COLUMN public.users.image IS NULL;
