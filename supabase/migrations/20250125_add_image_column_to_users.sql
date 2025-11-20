-- Migration to add image column to users table and update sync function
-- This adds a profile image field and ensures it's synced from auth.users

-- Add image column to public.users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS image TEXT;

-- Update the sync_user_to_public function to handle image field
CREATE OR REPLACE FUNCTION sync_user_to_public()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into public.users when a new user is created in auth.users
    INSERT INTO public.users (id, email, name, full_name, image, is_admin, created_at, updated_at)
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'name', 
        NULL, 
        NEW.raw_user_meta_data->>'image',
        COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
        NOW(), 
        NOW()
    )
    ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email,
        name = EXCLUDED.name,
        image = COALESCE(EXCLUDED.image, public.users.image),
        is_admin = COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, public.users.is_admin),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the trigger to ensure it uses the latest function
DROP TRIGGER IF EXISTS sync_user_trigger ON auth.users;
CREATE TRIGGER sync_user_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_to_public();

-- Create an index for better performance on image lookups (if needed)
CREATE INDEX IF NOT EXISTS idx_users_image ON public.users (image);

-- Update the comment on the table to document the new column
COMMENT ON COLUMN public.users.image IS 'User profile image URL';
