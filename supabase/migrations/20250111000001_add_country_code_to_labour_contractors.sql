ALTER TABLE labour_contractors ADD COLUMN IF NOT EXISTS country_code TEXT NOT NULL DEFAULT '+91';

CREATE INDEX IF NOT EXISTS idx_labour_contractors_country_code ON labour_contractors(country_code);
