-- Remove min_order_amount column from vouchers table
ALTER TABLE vouchers DROP COLUMN IF EXISTS min_order_amount;
