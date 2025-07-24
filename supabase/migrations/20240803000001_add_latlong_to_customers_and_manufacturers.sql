-- Add latitude and longitude to endcustomers
ALTER TABLE endcustomers
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add latitude and longitude to brickownerscust
ALTER TABLE brickownerscust
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION; 