-- Rename coupons to vouchers and related tables/columns
-- First rename column references in tables that have foreign keys
ALTER TABLE transactions RENAME COLUMN coupons_id TO vouchers_id;

-- Rename the main coupons table to vouchers
ALTER TABLE coupons RENAME TO vouchers;

-- Rename related tables
ALTER TABLE user_coupons RENAME TO user_vouchers;
ALTER TABLE transaction_coupons RENAME TO transaction_vouchers;
ALTER TABLE coupon_applicability RENAME TO voucher_applicability;

-- Rename column references in the renamed tables
ALTER TABLE user_vouchers RENAME COLUMN coupons_id TO vouchers_id;
ALTER TABLE transaction_vouchers RENAME COLUMN coupons_id TO vouchers_id;
ALTER TABLE voucher_applicability RENAME COLUMN coupon_id TO voucher_id;

-- Update index names
ALTER INDEX IF EXISTS idx_coupons_code RENAME TO idx_vouchers_code;
