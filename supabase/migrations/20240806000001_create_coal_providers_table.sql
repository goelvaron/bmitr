-- Create coal_providers table
CREATE TABLE IF NOT EXISTS coal_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL DEFAULT 'India',
  company_name TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  supply_capacity TEXT,
  exim_code TEXT,
  pan_no TEXT,
  biz_gst TEXT,
  additional_info TEXT,
  interested_in_exclusive_services BOOLEAN DEFAULT FALSE,
  interested_in_industry_quiz BOOLEAN DEFAULT FALSE,
  latitude TEXT,
  longitude TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_coal_providers_phone ON coal_providers(phone);

-- Create index on fuel_type for filtering
CREATE INDEX IF NOT EXISTS idx_coal_providers_fuel_type ON coal_providers(fuel_type);

-- Create index on location for geographic queries
CREATE INDEX IF NOT EXISTS idx_coal_providers_location ON coal_providers(state, district, city);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE coal_providers;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_coal_providers_updated_at BEFORE UPDATE ON coal_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
