-- Create transport_providers table
CREATE TABLE IF NOT EXISTS transport_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  transport_type TEXT NOT NULL,
  vehicle_capacity TEXT,
  service_area TEXT NOT NULL,
  biz_gst TEXT,
  pan_no TEXT,
  exim_code TEXT,
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime (only if not already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'transport_providers'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE transport_providers;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transport_providers_phone ON transport_providers(phone);
CREATE INDEX IF NOT EXISTS idx_transport_providers_email ON transport_providers(email);
CREATE INDEX IF NOT EXISTS idx_transport_providers_state ON transport_providers(state);
CREATE INDEX IF NOT EXISTS idx_transport_providers_city ON transport_providers(city);