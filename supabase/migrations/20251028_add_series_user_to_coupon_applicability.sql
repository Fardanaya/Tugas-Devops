-- Add series_id, user_id columns to voucher_applicability table
-- Add voucher_allocation JSONB field to vouchers table
-- This creates comprehensive voucher marketplace functionality

-- Add columns to voucher_applicability
ALTER TABLE voucher_applicability
ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES series(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add voucher_allocation to vouchers table (JSONB array of product types)
ALTER TABLE vouchers
ADD COLUMN IF NOT EXISTS voucher_allocation JSONB DEFAULT '["catalog", "accessories", "addons"]';

-- Create indexes for better performance on the new columns
CREATE INDEX IF NOT EXISTS idx_voucher_applicability_series_id ON voucher_applicability(series_id);
CREATE INDEX IF NOT EXISTS idx_voucher_applicability_user_id ON voucher_applicability(user_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_allocation ON vouchers USING GIN(voucher_allocation);

-- Update RLS policies if needed (admins already have full access to all tables)

-- Note: Enhanced voucher system supports:
-- 1. Allocation Types: ["catalog", "accessories", "addons"] - multi-select
-- 2. Series-specific vouchers (apply to all catalog items in a series)
-- 3. User-specific vouchers (apply to specific users)
-- 4. Global apply_to_all rule for unrestricted vouchers
-- 5. Combinatorial rules through multiple voucher_applicability records

-- Complete marketplace voucher functionality:
-- - Product type allocation via voucher_allocation
-- - Series-wide promotions via series_id
-- - User-specific promotions via user_id
-- - Global discounts via apply_to_all
-- - Granular control via specific catalog_id rules
