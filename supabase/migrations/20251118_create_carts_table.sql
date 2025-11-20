-- Create carts table for shopping cart functionality
-- This table allows users to add catalog items and accessories to their cart before placing an order

CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('catalog', 'accessory')),
    item_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
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

-- Add comment to selected_size field
COMMENT ON COLUMN carts.selected_size IS 'Size selected by user for catalog items';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_item_type_item_id ON carts(item_type, item_id);

-- Enable Row Level Security (RLS)
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can manage their own cart items
CREATE POLICY "Users can manage their own cart" ON carts FOR ALL USING (auth.uid() = user_id AND is_deleted = false);

-- Admins can view all cart items
CREATE POLICY "Admins can view all carts" ON carts FOR SELECT USING (is_current_user_admin());
