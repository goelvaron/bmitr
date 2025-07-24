-- Remove geocoding and interest columns from coal_providers table
ALTER TABLE coal_providers 
DROP COLUMN IF EXISTS interested_in_exclusive_services,
DROP COLUMN IF EXISTS interested_in_industry_quiz,
DROP COLUMN IF EXISTS latitude,
DROP COLUMN IF EXISTS longitude;

-- Add delivery_service_area column if it doesn't exist
ALTER TABLE coal_providers 
ADD COLUMN IF NOT EXISTS delivery_service_area TEXT;
