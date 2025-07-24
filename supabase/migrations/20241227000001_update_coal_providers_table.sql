-- Update coal_providers table to match the profile form schema

-- Add missing columns
ALTER TABLE coal_providers ADD COLUMN IF NOT EXISTS fuel_types TEXT[];
ALTER TABLE coal_providers ADD COLUMN IF NOT EXISTS delivery_service_area TEXT;
ALTER TABLE coal_providers ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT '+91';

-- Migrate existing fuel_type data to fuel_types array
UPDATE coal_providers 
SET fuel_types = ARRAY[fuel_type] 
WHERE fuel_type IS NOT NULL AND fuel_types IS NULL;

-- Drop the old fuel_type column
ALTER TABLE coal_providers DROP COLUMN IF EXISTS fuel_type;

-- Realtime is already enabled for coal_providers table
