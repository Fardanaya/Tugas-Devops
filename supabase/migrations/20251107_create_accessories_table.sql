-- Create accessories table
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
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to accessories table
COMMENT ON TABLE accessories IS 'Accessories that can be linked to catalog items or rented separately';

-- Create indexes for accessories table
CREATE INDEX IF NOT EXISTS idx_accessories_catalog_id ON accessories(catalog_id);

-- Enable Row Level Security for accessories
ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for accessories (similar to catalog)
CREATE POLICY "Allow public read access to accessories" ON accessories FOR SELECT USING (is_deleted = false);
CREATE POLICY "Admins have full access to accessories" ON accessories FOR ALL USING (is_current_user_admin());
