-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id UUID NOT NULL REFERENCES brickownerscust(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  specifications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for manufacturers to manage their own products
DROP POLICY IF EXISTS "Manufacturers can manage their own products";
CREATE POLICY "Manufacturers can manage their own products"
ON products
FOR ALL
USING (manufacturer_id = auth.uid() OR manufacturer_id::TEXT = auth.uid()::TEXT);

-- Create policy for public to view available products
DROP POLICY IF EXISTS "Public can view available products";
CREATE POLICY "Public can view available products"
ON products
FOR SELECT
USING (is_available = TRUE);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE products;
