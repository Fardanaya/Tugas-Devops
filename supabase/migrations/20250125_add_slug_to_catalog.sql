-- Add slug field to catalog table for SEO-friendly URLs
ALTER TABLE catalog ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for slug field for better performance
CREATE INDEX IF NOT EXISTS idx_catalog_slug ON catalog(slug);

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

-- Update existing catalog items with slugs
UPDATE catalog 
SET slug = generate_slug(name) 
WHERE slug IS NULL;

-- Make slug field NOT NULL after populating existing data
ALTER TABLE catalog ALTER COLUMN slug SET NOT NULL;

-- Add comment to slug field
COMMENT ON COLUMN catalog.slug IS 'SEO-friendly URL identifier for catalog items';
