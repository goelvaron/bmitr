-- Add category column to manufacturers table
ALTER TABLE IF EXISTS public.manufacturers
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'manufacturer';

-- Add category column to endcustomers table (if it exists)
ALTER TABLE IF EXISTS public.endcustomers
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'end_buyer';

-- Add category column to coal_providers table (if it exists)
ALTER TABLE IF EXISTS public.coal_providers
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'coal_provider';

-- Add category column to transport_providers table (if it exists)
ALTER TABLE IF EXISTS public.transport_providers
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'transport_provider';

-- Create index on category columns for better query performance
CREATE INDEX IF NOT EXISTS idx_manufacturers_category ON public.manufacturers(category);
CREATE INDEX IF NOT EXISTS idx_endcustomers_category ON public.endcustomers(category);
CREATE INDEX IF NOT EXISTS idx_coal_providers_category ON public.coal_providers(category);
CREATE INDEX IF NOT EXISTS idx_transport_providers_category ON public.transport_providers(category);
