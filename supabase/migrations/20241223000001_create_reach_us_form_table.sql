CREATE TABLE IF NOT EXISTS reach_us_form (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reach_us_form_created_at ON reach_us_form(created_at);
CREATE INDEX IF NOT EXISTS idx_reach_us_form_email ON reach_us_form(email);

alter publication supabase_realtime add table reach_us_form;