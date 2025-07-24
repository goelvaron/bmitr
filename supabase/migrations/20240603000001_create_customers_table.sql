-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  company_name TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  kiln_type TEXT NOT NULL,
  additional_info TEXT,
  interested_in_exclusive_services BOOLEAN DEFAULT FALSE,
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_test_entry BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security but allow all operations for now
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
DROP POLICY IF EXISTS "Allow all operations" ON customers;
CREATE POLICY "Allow all operations" ON customers FOR ALL USING (true);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
