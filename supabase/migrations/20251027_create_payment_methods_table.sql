-- Create payment_methods table
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

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Grant permissions (assuming admin has service_role, but for policies)
-- RLS Policies
CREATE POLICY "Admins have full access to payment_methods" ON payment_methods FOR ALL USING (is_current_user_admin());

-- Public read? Probably only admin can read/write, but for now, since similar to brands, public can read if not deleted
CREATE POLICY "Allow read access to payment_methods" ON payment_methods FOR SELECT USING (is_deleted = false);

-- Seed initial payment methods (replace with actual data as needed)
INSERT INTO payment_methods (name, type, number, holder, image) VALUES
('Mandiri', 'Bank Transfer', '1234567890', 'PT Cloudyrent', NULL),
('BCA', 'Bank Transfer', '0987654321', 'PT Cloudyrent', NULL),
('OVO', 'E-Wallet', '08123456789', NULL, NULL),
('Gopay', 'E-Wallet', '08123456789', NULL, NULL),
('QRIS Payment', 'QRIS', NULL, NULL, 'https://example.com/qris.png');

-- Create index
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_deleted ON payment_methods(is_deleted);
