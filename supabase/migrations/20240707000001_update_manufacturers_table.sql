-- Add missing columns to manufacturers table if they don't exist
ALTER TABLE IF EXISTS public.manufacturers
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS pin_code TEXT,
  ADD COLUMN IF NOT EXISTS kiln_type TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS established_year INTEGER,
  ADD COLUMN IF NOT EXISTS employee_count INTEGER,
  ADD COLUMN IF NOT EXISTS additional_info TEXT,
  ADD COLUMN IF NOT EXISTS gst_details TEXT,
  ADD COLUMN IF NOT EXISTS pan_no TEXT,
  ADD COLUMN IF NOT EXISTS exim_code TEXT,
  ADD COLUMN IF NOT EXISTS interested_in_exclusive_services BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS interested_in_industry_quiz BOOLEAN DEFAULT FALSE;

-- Enable realtime for manufacturers table
alter publication supabase_realtime add table manufacturers;
