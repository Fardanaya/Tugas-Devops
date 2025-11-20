-- Migration to fix RLS policies to use is_admin column instead of JWT roles
-- This migration should be applied to existing databases

-- Function to check if current user is admin without triggering RLS
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean AS $$
DECLARE
    admin_status boolean;
BEGIN
    -- Use a subquery with RLS bypass to check admin status
    SELECT is_admin INTO admin_status 
    FROM public.users 
    WHERE id = auth.uid();
    
    RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins have full access" ON brands;
DROP POLICY IF EXISTS "Admins have full access" ON series;
DROP POLICY IF EXISTS "Admins have full access" ON characters;
DROP POLICY IF EXISTS "Admins have full access" ON catalog;
DROP POLICY IF EXISTS "Admins have full access" ON add_ons;
DROP POLICY IF EXISTS "Admins have full access" ON vouchers;
DROP POLICY IF EXISTS "Admins have full access" ON voucher_applicability;
DROP POLICY IF EXISTS "Admins have full access" ON payments;
DROP POLICY IF EXISTS "Admins have full access" ON shipping;
DROP POLICY IF EXISTS "Admins have full access" ON addresses;
DROP POLICY IF EXISTS "Admins have full access" ON transactions;
DROP POLICY IF EXISTS "Admins have full access" ON transaction_addons;
DROP POLICY IF EXISTS "Admins have full access" ON transaction_vouchers;
DROP POLICY IF EXISTS "Admins have full access" ON user_vouchers;
DROP POLICY IF EXISTS "Admins have full access" ON penalties;
DROP POLICY IF EXISTS "Admins have full access" ON rent_schedules;
DROP POLICY IF EXISTS "Admins have full access" ON waiting_list;
DROP POLICY IF EXISTS "Admins have full access" ON wishlist;
DROP POLICY IF EXISTS "Admins have full access" ON settings;
DROP POLICY IF EXISTS "Admins have full access" ON public.users;

-- Create new admin policies using the function to avoid recursion
CREATE POLICY "Admins have full access" ON brands FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON series FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON characters FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON catalog FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON add_ons FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON vouchers FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON voucher_applicability FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON payments FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON shipping FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON addresses FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON transactions FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON transaction_addons FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON transaction_vouchers FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON user_vouchers FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON penalties FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON rent_schedules FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON waiting_list FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON wishlist FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON settings FOR ALL USING (is_current_user_admin());

-- Update users table policies to avoid recursion
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Allow user self-registration" ON public.users;
DROP POLICY IF EXISTS "Only admins can delete users" ON public.users;

CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (is_current_user_admin());
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update all users" ON public.users FOR UPDATE USING (is_current_user_admin());
CREATE POLICY "Allow user self-registration" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can insert users" ON public.users FOR INSERT WITH CHECK (is_current_user_admin());
CREATE POLICY "Only admins can delete users" ON public.users FOR DELETE USING (is_current_user_admin());

-- Update the sync function to handle is_admin status
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

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS sync_user_trigger ON auth.users;
CREATE TRIGGER sync_user_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_to_public();
