-- Fix type casting issues in policies by ensuring proper UUID casting

-- Check if tables exist before modifying policies
DO $$ 
BEGIN
  -- Only proceed if the tables exist
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'manufacturer_profiles') THEN
    -- Drop and recreate policies with proper type casting for manufacturer_profiles
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
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    -- Drop and recreate policies with proper type casting for products
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
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inquiries') THEN
    -- Drop and recreate policies with proper type casting for inquiries
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
  END IF;
END $$;