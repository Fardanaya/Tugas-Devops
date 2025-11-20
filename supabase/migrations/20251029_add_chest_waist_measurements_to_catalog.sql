-- Add min and max measurements for chest and waist circumference to catalog table
ALTER TABLE catalog
ADD COLUMN IF NOT EXISTS min_lingkar_dada INTEGER,
ADD COLUMN IF NOT EXISTS max_lingkar_dada INTEGER,
ADD COLUMN IF NOT EXISTS min_lingkar_pinggang INTEGER,
ADD COLUMN IF NOT EXISTS max_lingkar_pinggang INTEGER;

-- Add comments for the new columns
COMMENT ON COLUMN catalog.min_lingkar_dada IS 'Minimum chest circumference in cm';
COMMENT ON COLUMN catalog.max_lingkar_dada IS 'Maximum chest circumference in cm';
COMMENT ON COLUMN catalog.min_lingkar_pinggang IS 'Minimum waist circumference in cm';
COMMENT ON COLUMN catalog.max_lingkar_pinggang IS 'Maximum waist circumference in cm';
