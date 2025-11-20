-- Add additional_day_price column to catalog table
-- This allows setting additional pricing for extra rental days on catalog items

ALTER TABLE catalog
ADD COLUMN additional_day_price INTEGER NOT NULL DEFAULT 0;

-- Add comment to the new column
COMMENT ON COLUMN catalog.additional_day_price IS 'Additional price per day for extended rental periods';
