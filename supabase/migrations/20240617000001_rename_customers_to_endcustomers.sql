-- Rename customers table to endcustomers
ALTER TABLE IF EXISTS public.customers RENAME TO endcustomers;

-- Update foreign key references in customers_auth table
ALTER TABLE IF EXISTS public.customers_auth
  RENAME COLUMN customer_id TO endcustomer_id;

-- Update any references in RLS policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON public.customers_auth;
CREATE POLICY "Users can view own data"
  ON public.customers_auth
  FOR SELECT
  USING (auth.uid() = endcustomer_id);

-- Enable realtime for the renamed table (only if not already added)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'endcustomers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE endcustomers;
  END IF;
END $$;