-- Create manufacturer_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.manufacturer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id UUID NOT NULL REFERENCES public.manufacturers(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  state TEXT,
  district TEXT,
  city TEXT,
  pin_code TEXT,
  kiln_type TEXT,
  website TEXT,
  established_year INTEGER,
  employee_count INTEGER,
  additional_info TEXT,
  gst_details TEXT,
  pan_no TEXT,
  exim_code TEXT,
  interested_in_exclusive_services BOOLEAN DEFAULT FALSE,
  interested_in_industry_quiz BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE public.manufacturer_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Manufacturers can view their own profiles" ON public.manufacturer_profiles;
CREATE POLICY "Manufacturers can view their own profiles"
  ON public.manufacturer_profiles
  FOR SELECT
  USING (auth.uid()::text = manufacturer_id::text);

DROP POLICY IF EXISTS "Manufacturers can update their own profiles" ON public.manufacturer_profiles;
CREATE POLICY "Manufacturers can update their own profiles"
  ON public.manufacturer_profiles
  FOR UPDATE
  USING (auth.uid()::text = manufacturer_id::text);

-- Enable realtime
alter publication supabase_realtime add table manufacturer_profiles;
