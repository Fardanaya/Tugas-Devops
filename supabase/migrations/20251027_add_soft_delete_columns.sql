-- Add soft delete columns to major tables and update RLS policies
-- Using boolean for efficiency as suggested

-- Users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Brands table
ALTER TABLE brands ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Series table
ALTER TABLE series ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Characters table
ALTER TABLE characters ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Catalog table
ALTER TABLE catalog ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Add-ons table
ALTER TABLE add_ons ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Vouchers table
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Addresses table
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Transaction add-ons table
ALTER TABLE transaction_addons ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Waiting list table
ALTER TABLE waiting_list ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Wishlist table
ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Penalty table
ALTER TABLE penalties ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Rent schedules table
ALTER TABLE rent_schedules ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
