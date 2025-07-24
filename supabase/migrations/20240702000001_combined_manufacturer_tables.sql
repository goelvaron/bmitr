-- Add UUID extension if not already added
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create manufacturer_profiles table
CREATE TABLE IF NOT EXISTS manufacturer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id UUID NOT NULL REFERENCES auth.users(id),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  pin_code TEXT,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  established_year INTEGER,
  employee_count INTEGER,
  certifications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10, 2),
  price_unit TEXT DEFAULT 'per piece',
  specifications JSONB,
  images TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id UUID NOT NULL REFERENCES auth.users(id),
  customer_id UUID REFERENCES endcustomers(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  response TEXT,
  response_date TIMESTAMP WITH TIME ZONE
);

-- Enable row level security
ALTER TABLE manufacturer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for manufacturer_profiles
DROP POLICY IF EXISTS "Manufacturers can view their own profile"
ON manufacturer_profiles;
CREATE POLICY "Manufacturers can view their own profile"
  ON manufacturer_profiles
  FOR SELECT
  USING (manufacturer_id = auth.uid()::uuid);

DROP POLICY IF EXISTS "Manufacturers can update their own profile"
ON manufacturer_profiles;
CREATE POLICY "Manufacturers can update their own profile"
  ON manufacturer_profiles
  FOR UPDATE
  USING (manufacturer_id = auth.uid()::uuid);

-- Create policies for products
DROP POLICY IF EXISTS "Manufacturers can view their own products"
ON products;
CREATE POLICY "Manufacturers can view their own products"
  ON products
  FOR SELECT
  USING (manufacturer_id = auth.uid()::uuid);

DROP POLICY IF EXISTS "Manufacturers can insert their own products"
ON products;
CREATE POLICY "Manufacturers can insert their own products"
  ON products
  FOR INSERT
  WITH CHECK (manufacturer_id = auth.uid()::uuid);

DROP POLICY IF EXISTS "Manufacturers can update their own products"
ON products;
CREATE POLICY "Manufacturers can update their own products"
  ON products
  FOR UPDATE
  USING (manufacturer_id = auth.uid()::uuid);

DROP POLICY IF EXISTS "Manufacturers can delete their own products"
ON products;
CREATE POLICY "Manufacturers can delete their own products"
  ON products
  FOR DELETE
  USING (manufacturer_id = auth.uid()::uuid);

-- Create policies for inquiries
DROP POLICY IF EXISTS "Manufacturers can view their own inquiries"
ON inquiries;
CREATE POLICY "Manufacturers can view their own inquiries"
  ON inquiries
  FOR SELECT
  USING (manufacturer_id = auth.uid()::uuid);

DROP POLICY IF EXISTS "Manufacturers can update their own inquiries"
ON inquiries;
CREATE POLICY "Manufacturers can update their own inquiries"
  ON inquiries
  FOR UPDATE
  USING (manufacturer_id = auth.uid()::uuid);

-- Enable realtime for all tables
alter publication supabase_realtime add table manufacturer_profiles;
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table inquiries;