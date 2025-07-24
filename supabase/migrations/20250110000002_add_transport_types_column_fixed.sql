ALTER TABLE transport_providers ADD COLUMN IF NOT EXISTS transport_types text[];

UPDATE transport_providers 
SET transport_types = ARRAY[transport_type] 
WHERE transport_type IS NOT NULL AND transport_types IS NULL;
