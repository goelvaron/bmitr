-- Create the brickownerscust table for brick owners
CREATE TABLE IF NOT EXISTS public.brickownerscust (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  status TEXT DEFAULT 'waitlist'
);

-- Enable row level security
ALTER TABLE public.brickownerscust ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public read access" ON public.brickownerscust;
CREATE POLICY "Public read access"
ON public.brickownerscust FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public insert access" ON public.brickownerscust;
CREATE POLICY "Public insert access"
ON public.brickownerscust FOR INSERT
WITH CHECK (true);

-- Table is already part of supabase_realtime publication