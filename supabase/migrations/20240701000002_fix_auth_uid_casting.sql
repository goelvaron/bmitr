-- Add UUID extension if not already added
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop and recreate policies with proper type casting
-- Manufacturer profiles policies
DROP POLICY IF EXISTS "Manufacturers can view their own profile"
ON manufacturer_profiles;
CREATE POLICY "Manufacturers can view their own profile"
  ON manufacturer_profiles
  FOR SELECT
  USING (auth.uid()::uuid = manufacturer_id);

DROP POLICY IF EXISTS "Manufacturers can update their own profile"
ON manufacturer_profiles;
CREATE POLICY "Manufacturers can update their own profile"
  ON manufacturer_profiles
  FOR UPDATE
  USING (auth.uid()::uuid = manufacturer_id);

-- Products policies
DROP POLICY IF EXISTS "Manufacturers can view their own products"
ON products;
CREATE POLICY "Manufacturers can view their own products"
  ON products
  FOR SELECT
  USING (auth.uid()::uuid = manufacturer_id);

DROP POLICY IF EXISTS "Manufacturers can insert their own products"
ON products;
CREATE POLICY "Manufacturers can insert their own products"
  ON products
  FOR INSERT
  WITH CHECK (auth.uid()::uuid = manufacturer_id);

DROP POLICY IF EXISTS "Manufacturers can update their own products"
ON products;
CREATE POLICY "Manufacturers can update their own products"
  ON products
  FOR UPDATE
  USING (auth.uid()::uuid = manufacturer_id);

DROP POLICY IF EXISTS "Manufacturers can delete their own products"
ON products;
CREATE POLICY "Manufacturers can delete their own products"
  ON products
  FOR DELETE
  USING (auth.uid()::uuid = manufacturer_id);

-- Inquiries policies
DROP POLICY IF EXISTS "Manufacturers can view their own inquiries"
ON inquiries;
CREATE POLICY "Manufacturers can view their own inquiries"
  ON inquiries
  FOR SELECT
  USING (auth.uid()::uuid = manufacturer_id);

DROP POLICY IF EXISTS "Manufacturers can update their own inquiries"
ON inquiries;
CREATE POLICY "Manufacturers can update their own inquiries"
  ON inquiries
  FOR UPDATE
  USING (auth.uid()::uuid = manufacturer_id);