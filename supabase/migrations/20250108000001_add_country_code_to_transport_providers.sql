ALTER TABLE transport_providers ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT '+91';

UPDATE transport_providers SET country_code = '+91' WHERE country_code IS NULL;

alter publication supabase_realtime add table transport_providers;