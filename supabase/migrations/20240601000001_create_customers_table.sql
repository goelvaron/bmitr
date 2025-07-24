-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  kiln_type TEXT NOT NULL,
  additional_info TEXT,
  interested_in_exclusive_services BOOLEAN DEFAULT FALSE,
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting data
DROP POLICY IF EXISTS "Anyone can insert customers" ON customers;
CREATE POLICY "Anyone can insert customers"
ON customers FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Create policy for selecting data
DROP POLICY IF EXISTS "Anyone can view customers" ON customers;
CREATE POLICY "Anyone can view customers"
ON customers FOR SELECT
TO authenticated, anon
USING (true);

-- Enable realtime
alter publication supabase_realtime add table customers;