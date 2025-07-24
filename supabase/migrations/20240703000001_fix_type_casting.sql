-- Fix type casting issues in policies

-- Drop and recreate policies with proper type casting
-- Manufacturer profiles policies
DROP POLICY IF EXISTS "Manufacturers can view their own profile"
ON manufacturer_profiles;
CREATE POLICY "Manufacturers can view their own profile"
  ON manufacturer_profiles
  FOR SELECT
  USING (manufacturer_id = (auth.uid())::uuid);

DROP POLICY IF EXISTS "Manufacturers can update their own profile"
ON manufacturer_profiles;
CREATE POLICY "Manufacturers can update their own profile"
  ON manufacturer_profiles
  FOR UPDATE
  USING (manufacturer_id = (auth.uid())::uuid);

-- Products policies
DROP POLICY IF EXISTS "Manufacturers can view their own products"
ON products;
CREATE POLICY "Manufacturers can view their own products"
  ON products
  FOR SELECT
  USING (manufacturer_id = (auth.uid())::uuid);

DROP POLICY IF EXISTS "Manufacturers can insert their own products"
ON products;
CREATE POLICY "Manufacturers can insert their own products"
  ON products
  FOR INSERT
  WITH CHECK (manufacturer_id = (auth.uid())::uuid);

DROP POLICY IF EXISTS "Manufacturers can update their own products"
ON products;
CREATE POLICY "Manufacturers can update their own products"
  ON products
  FOR UPDATE
  USING (manufacturer_id = (auth.uid())::uuid);

DROP POLICY IF EXISTS "Manufacturers can delete their own products"
ON products;
CREATE POLICY "Manufacturers can delete their own products"
  ON products
  FOR DELETE
  USING (manufacturer_id = (auth.uid())::uuid);

-- Inquiries policies
DROP POLICY IF EXISTS "Manufacturers can view their own inquiries"
ON inquiries;
CREATE POLICY "Manufacturers can view their own inquiries"
  ON inquiries
  FOR SELECT
  USING (manufacturer_id = (auth.uid())::uuid);

DROP POLICY IF EXISTS "Manufacturers can update their own inquiries"
ON inquiries;
CREATE POLICY "Manufacturers can update their own inquiries"
  ON inquiries
  FOR UPDATE
  USING (manufacturer_id = (auth.uid())::uuid);