-- Fix coal_providers table structure for transparency service
-- The fuel_types column already exists as TEXT[], so we just need to ensure it has default values

-- Add category column to coal_providers if not exists
ALTER TABLE coal_providers 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'coal_provider';

-- Add delivery_service_area column to coal_providers if not exists
ALTER TABLE coal_providers 
ADD COLUMN IF NOT EXISTS delivery_service_area TEXT;

-- Update existing records to have proper country codes based on country
-- Only update records where country_code is NULL or empty
UPDATE coal_providers 
SET country_code = CASE 
  WHEN country = 'Nepal' THEN '+977'
  ELSE '+91'
END
WHERE country_code IS NULL OR country_code = '';

UPDATE labour_contractors 
SET country_code = CASE 
  WHEN country = 'Nepal' THEN '+977'
  ELSE '+91'
END
WHERE country_code IS NULL OR country_code = '';

-- Ensure fuel_types has default values for records that don't have any
UPDATE coal_providers 
SET fuel_types = ARRAY['Coal'] 
WHERE fuel_types IS NULL OR fuel_types = '{}';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coal_providers_fuel_types ON coal_providers USING GIN(fuel_types);
CREATE INDEX IF NOT EXISTS idx_coal_providers_category ON coal_providers(category);
CREATE INDEX IF NOT EXISTS idx_labour_contractors_category ON labour_contractors(category);

-- Ensure realtime is enabled for transparency stats
ALTER PUBLICATION supabase_realtime ADD TABLE coal_providers;
ALTER PUBLICATION supabase_realtime ADD TABLE labour_contractors;
ALTER PUBLICATION supabase_realtime ADD TABLE transport_providers;
ALTER PUBLICATION supabase_realtime ADD TABLE manufacturers;
