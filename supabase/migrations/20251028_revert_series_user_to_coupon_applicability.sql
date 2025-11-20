-- Revert migration: Remove series_id, user_id from voucher_applicability and voucher_allocation from vouchers
-- This reverts the changes from 20251028_add_series_user_to_voucher_applicability.sql

-- Drop indexes created for the new columns
DROP INDEX IF EXISTS idx_voucher_applicability_series_id;
DROP INDEX IF EXISTS idx_voucher_applicability_user_id;
DROP INDEX IF EXISTS idx_vouchers_allocation;

-- Remove columns from voucher_applicability
ALTER TABLE voucher_applicability
DROP COLUMN IF EXISTS series_id,
DROP COLUMN IF EXISTS user_id;

-- Remove column from vouchers
ALTER TABLE vouchers
DROP COLUMN IF EXISTS voucher_allocation;
