-- Add type and additional_day_price columns to accessories table
ALTER TABLE accessories
ADD COLUMN type TEXT CHECK (type IN ('accessories', 'weapon', 'shoes')),
ADD COLUMN additional_day_price INTEGER DEFAULT 0;

-- Update existing records to have default values
UPDATE accessories SET type = 'accessories' WHERE type IS NULL;
UPDATE accessories SET additional_day_price = 0 WHERE additional_day_price IS NULL;

-- Make type column NOT NULL after setting defaults
ALTER TABLE accessories ALTER COLUMN type SET NOT NULL;
ALTER TABLE accessories ALTER COLUMN additional_day_price SET NOT NULL;

-- Add comment to new columns
COMMENT ON COLUMN accessories.type IS 'Type of accessory: accessories, weapon, or shoes';
COMMENT ON COLUMN accessories.additional_day_price IS 'Additional price per day beyond base rental period';
