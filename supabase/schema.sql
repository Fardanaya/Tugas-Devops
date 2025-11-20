-- Supabase Database Schema for Cloudyrent
-- This schema mirrors the existing Xata database structure
-- Updated to use Supabase Auth instead of NextAuth.js

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for application-specific user data FIRST
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name text null,
    full_name TEXT,
    phone_whatsapp TEXT,
    emergency_contact TEXT,
    identity_pict TEXT,
    selfie_pict TEXT,
    instagram TEXT UNIQUE,
    total_rent INTEGER DEFAULT 0,
    is_blacklist BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Series table
CREATE TABLE IF NOT EXISTS series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    category TEXT NOT NULL DEFAULT 'anime',
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    series_id UUID REFERENCES series(id) ON DELETE SET NULL,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catalog table
CREATE TABLE IF NOT EXISTS catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    description TEXT,
    catalog_type TEXT,
    gender TEXT,
    size TEXT,
    max_size TEXT,
    min_lingkar_dada INTEGER,
    max_lingkar_dada INTEGER,
    min_lingkar_pinggang INTEGER,
    max_lingkar_pinggang INTEGER,
    price INTEGER DEFAULT 0,
    additional_day_price INTEGER NOT NULL DEFAULT 0,
    status TEXT,
    weight INTEGER DEFAULT 0,
    height INTEGER DEFAULT 0,
    width INTEGER DEFAULT 0,
    length INTEGER DEFAULT 0,
    important_info TEXT,
    is_weekday BOOLEAN,
    images TEXT[],
    slug TEXT UNIQUE NOT NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to slug field
COMMENT ON COLUMN catalog.slug IS 'SEO-friendly URL identifier for catalog items';

-- Add comment to additional_day_price field
COMMENT ON COLUMN catalog.additional_day_price IS 'Additional price per day for extended rental periods';

-- Accessories table
CREATE TABLE IF NOT EXISTS accessories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER DEFAULT 0,
    images TEXT[],
    catalog_id UUID REFERENCES catalog(id) ON DELETE SET NULL,
    weight INTEGER DEFAULT 0,
    height INTEGER DEFAULT 0,
    width INTEGER DEFAULT 0,
    length INTEGER DEFAULT 0,
    important_info TEXT,
    type TEXT NOT NULL CHECK (type IN ('accessories', 'weapon', 'shoes')),
    additional_day_price INTEGER NOT NULL DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to accessories table
COMMENT ON TABLE accessories IS 'Accessories that can be linked to catalog items or rented separately';

-- Carts table
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('catalog', 'accessory')),
    item_id UUID NOT NULL,
    rental_days INTEGER NOT NULL DEFAULT 1,
    additional_days INTEGER NOT NULL DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    selected_size TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to carts table
COMMENT ON TABLE carts IS 'Shopping cart items for users before placing rental orders';

-- Add-ons table
CREATE TABLE IF NOT EXISTS add_ons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    price INTEGER DEFAULT 0,
    stock INTEGER,
    image TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bundle items table (for catalog bundles)
CREATE TABLE IF NOT EXISTS bundle_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID REFERENCES catalog(id) ON DELETE SET NULL,
    costume_id UUID REFERENCES catalog(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT,
    discount_type TEXT NOT NULL,
    discount_value INTEGER,
    type TEXT NOT NULL,
    is_enable BOOLEAN NOT NULL DEFAULT false,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    per_user_limit INTEGER,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voucher applicability table
CREATE TABLE IF NOT EXISTS voucher_applicability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
    catalog_id UUID REFERENCES catalog(id) ON DELETE SET NULL,
    apply_to_all BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nominal INTEGER,
    proof TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipping table
CREATE TABLE IF NOT EXISTS shipping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resi TEXT,
    price INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Address table
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    label TEXT,
    full_address TEXT,
    address_details TEXT,
    receiver TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    catalog_id UUID REFERENCES catalog(id) ON DELETE SET NULL,
    address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    vouchers_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
    deposit_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    dp_payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    sett_payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    send_shipping_id UUID REFERENCES shipping(id) ON DELETE SET NULL,
    return_shipping_id UUID REFERENCES shipping(id) ON DELETE SET NULL,
    status TEXT,
    start_rent TIMESTAMP WITH TIME ZONE,
    end_rent TIMESTAMP WITH TIME ZONE,
    additional_day INTEGER,
    total_price INTEGER DEFAULT 0,
    final_price INTEGER DEFAULT 0,
    voucher_discount INTEGER,
    cancel_reason TEXT,
    reject_reason TEXT,
    settlement_reason TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction add-ons table
CREATE TABLE IF NOT EXISTS transaction_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    add_on_id UUID REFERENCES add_ons(id) ON DELETE SET NULL,
    price INTEGER,
    qty INTEGER,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User vouchers table
CREATE TABLE IF NOT EXISTS user_vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    vouchers_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
    usage_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction vouchers table
CREATE TABLE IF NOT EXISTS transaction_vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    vouchers_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waiting list table
CREATE TABLE IF NOT EXISTS waiting_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    catalog_id UUID REFERENCES catalog(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    queue INTEGER,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    catalog_id UUID REFERENCES catalog(id) ON DELETE SET NULL,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Penalty table
CREATE TABLE IF NOT EXISTS penalties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    details TEXT,
    image TEXT,
    price INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rent schedules table
CREATE TABLE IF NOT EXISTS rent_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    catalog_id UUID REFERENCES catalog(id) ON DELETE SET NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    value TEXT,
    visible BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Bank Transfer', 'E-Wallet', 'QRIS')),
    number TEXT,
    holder TEXT,
    image TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_catalog_brand_id ON catalog(brand_id);
CREATE INDEX IF NOT EXISTS idx_catalog_character_id ON catalog(character_id);
CREATE INDEX IF NOT EXISTS idx_catalog_slug ON catalog(slug);
CREATE INDEX IF NOT EXISTS idx_characters_series_id ON characters(series_id);
CREATE INDEX IF NOT EXISTS idx_accessories_catalog_id ON accessories(catalog_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_item_type_item_id ON carts(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_catalog_id ON transactions(catalog_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_waiting_list_user_id ON waiting_list(user_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_is_blacklist ON public.users(is_blacklist);
CREATE INDEX IF NOT EXISTS idx_users_instagram ON public.users(instagram);

-- Enable Row Level Security (RLS)
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_applicability ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiting_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT)
RETURNS TEXT AS $$
DECLARE
    slug_text TEXT;
    counter INTEGER := 1;
    base_slug TEXT;
BEGIN
    -- Convert to lowercase, replace spaces with hyphens, remove special characters
    slug_text := lower(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'));
    slug_text := regexp_replace(slug_text, '\s+', '-', 'g');
    slug_text := regexp_replace(slug_text, '-+', '-', 'g');
    slug_text := trim(both '-' from slug_text);

    base_slug := slug_text;
    -- Check if slug already exists, if so append counter
    WHILE EXISTS (SELECT 1 FROM catalog WHERE slug = slug_text) LOOP
        slug_text := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;

    RETURN slug_text;
END;
$$ LANGUAGE plpgsql;

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

-- Function to sync users from Supabase Auth to public.users
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

-- Create trigger to automatically sync users from auth.users to public.users
DROP TRIGGER IF EXISTS sync_user_trigger ON auth.users;
CREATE TRIGGER sync_user_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_to_public();

-- Create RLS policies (basic policies - can be customized as needed)
CREATE POLICY "Allow public read access to brands" ON brands FOR SELECT USING (is_deleted = false);
CREATE POLICY "Allow public read access to series" ON series FOR SELECT USING (is_deleted = false);
CREATE POLICY "Allow public read access to characters" ON characters FOR SELECT USING (is_deleted = false);
CREATE POLICY "Allow public read access to catalog" ON catalog FOR SELECT USING (is_deleted = false);
CREATE POLICY "Allow public read access to accessories" ON accessories FOR SELECT USING (is_deleted = false);
CREATE POLICY "Allow public read access to add_ons" ON add_ons FOR SELECT USING (is_deleted = false);
CREATE POLICY "Allow public read access to vouchers" ON vouchers FOR SELECT USING (is_deleted = false);
CREATE POLICY "Allow public read access to settings" ON settings FOR SELECT USING (is_deleted = false);

-- Add soft delete filter to user-specific policies
DROP POLICY IF EXISTS "Users can manage their own addresses" ON addresses;
CREATE POLICY "Users can manage their own addresses" ON addresses FOR ALL USING (auth.uid() = user_id AND is_deleted = false);

-- Admin policies for catalog table (allow INSERT, UPDATE, DELETE operations)
CREATE POLICY "Admins have full access to catalog" ON catalog FOR ALL USING (is_current_user_admin());

-- User-specific policies using Supabase Auth (auth.uid())
-- Note: addresses policy was already updated above
CREATE POLICY "Users can manage their own cart" ON carts FOR ALL USING (auth.uid() = user_id AND is_deleted = false);
CREATE POLICY "Users can manage their own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id AND is_deleted = false);
CREATE POLICY "Users can manage their own waiting list" ON waiting_list FOR ALL USING (auth.uid() = user_id AND is_deleted = false);
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id AND is_deleted = false);
CREATE POLICY "Users can view their own user vouchers" ON user_vouchers FOR SELECT USING (auth.uid() = user_id);

-- Admin policies (for full access) - use function to avoid recursion
CREATE POLICY "Admins have full access" ON brands FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON series FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON characters FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON catalog FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON carts FOR ALL USING (is_current_user_admin());
CREATE POLICY "Admins have full access" ON accessories FOR ALL USING (is_current_user_admin());
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
CREATE POLICY "Admins have full access" ON payment_methods FOR ALL USING (is_current_user_admin());



-- Users table policies for Supabase Auth
-- Use the function to avoid recursion
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (is_current_user_admin());
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update all users" ON public.users FOR UPDATE USING (is_current_user_admin());
CREATE POLICY "Allow user self-registration" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can insert users" ON public.users FOR INSERT WITH CHECK (is_current_user_admin());
CREATE POLICY "Only admins can delete users" ON public.users FOR DELETE USING (is_current_user_admin());

-- Ensure the auth schema is accessible
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO anon, authenticated, service_role;
