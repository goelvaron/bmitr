-- Create labour_contractors table
CREATE TABLE IF NOT EXISTS labour_contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  category TEXT NOT NULL DEFAULT 'labour_contractor',
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  service_types TEXT[] NOT NULL,
  experience_years TEXT NOT NULL,
  service_area TEXT NOT NULL,
  additional_info TEXT,
  biz_gst TEXT,
  pan_no TEXT,
  exim_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_labour_contractors_phone ON labour_contractors(phone);
CREATE INDEX IF NOT EXISTS idx_labour_contractors_country ON labour_contractors(country);
CREATE INDEX IF NOT EXISTS idx_labour_contractors_state ON labour_contractors(state);
CREATE INDEX IF NOT EXISTS idx_labour_contractors_service_types ON labour_contractors USING GIN(service_types);
CREATE INDEX IF NOT EXISTS idx_labour_contractors_location ON labour_contractors(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create labour_contractor_inquiries table for managing client inquiries
CREATE TABLE IF NOT EXISTS labour_contractor_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  labour_contractor_id UUID NOT NULL REFERENCES labour_contractors(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT NOT NULL,
  service_type TEXT NOT NULL,
  project_description TEXT NOT NULL,
  location TEXT,
  budget_range TEXT,
  timeline TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT DEFAULT 'medium',
  response TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create labour_contractor_projects table for tracking projects
CREATE TABLE IF NOT EXISTS labour_contractor_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  labour_contractor_id UUID NOT NULL REFERENCES labour_contractors(id) ON DELETE CASCADE,
  inquiry_id UUID REFERENCES labour_contractor_inquiries(id),
  project_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_contact TEXT,
  service_type TEXT NOT NULL,
  project_description TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  estimated_budget DECIMAL(12, 2),
  actual_cost DECIMAL(12, 2),
  status TEXT NOT NULL DEFAULT 'pending',
  progress_percentage INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create labour_contractor_ratings table for client feedback
CREATE TABLE IF NOT EXISTS labour_contractor_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  labour_contractor_id UUID NOT NULL REFERENCES labour_contractors(id) ON DELETE CASCADE,
  project_id UUID REFERENCES labour_contractor_projects(id),
  client_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
  timeliness INTEGER CHECK (timeliness >= 1 AND timeliness <= 5),
  communication INTEGER CHECK (communication >= 1 AND communication <= 5),
  value_for_money INTEGER CHECK (value_for_money >= 1 AND value_for_money <= 5),
  would_recommend BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for related tables
CREATE INDEX IF NOT EXISTS idx_labour_contractor_inquiries_contractor ON labour_contractor_inquiries(labour_contractor_id);
CREATE INDEX IF NOT EXISTS idx_labour_contractor_inquiries_status ON labour_contractor_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_labour_contractor_projects_contractor ON labour_contractor_projects(labour_contractor_id);
CREATE INDEX IF NOT EXISTS idx_labour_contractor_projects_status ON labour_contractor_projects(status);
CREATE INDEX IF NOT EXISTS idx_labour_contractor_ratings_contractor ON labour_contractor_ratings(labour_contractor_id);

-- Add triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_labour_contractors_updated_at BEFORE UPDATE ON labour_contractors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_labour_contractor_inquiries_updated_at BEFORE UPDATE ON labour_contractor_inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_labour_contractor_projects_updated_at BEFORE UPDATE ON labour_contractor_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for all tables
alter publication supabase_realtime add table labour_contractors;
alter publication supabase_realtime add table labour_contractor_inquiries;
alter publication supabase_realtime add table labour_contractor_projects;
alter publication supabase_realtime add table labour_contractor_ratings;
