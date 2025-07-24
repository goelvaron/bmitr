ALTER TABLE transport_providers ADD COLUMN transport_types text[];

UPDATE transport_providers 
SET transport_types = ARRAY[transport_type] 
WHERE transport_type IS NOT NULL;

alter publication supabase_realtime add table transport_providers;
