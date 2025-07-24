-- 1. Remove the old table from realtime publication (ignore error if not present)
ALTER PUBLICATION supabase_realtime DROP TABLE public.brickownerscust;

-- 2. Drop policies that reference manufacturer_id (if they exist)
DROP POLICY IF EXISTS "Manufacturers can view their own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Manufacturers can update their own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Manufacturers can manage their own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Customers can view their own inquiries" ON inquiries;

DROP POLICY IF EXISTS "Manufacturers can manage their own products" ON products;
DROP POLICY IF EXISTS "Manufacturers can view their own products" ON products;
DROP POLICY IF EXISTS "Manufacturers can insert their own products" ON products;
DROP POLICY IF EXISTS "Manufacturers can update their own products" ON products;
DROP POLICY IF EXISTS "Manufacturers can delete their own products" ON products;

-- 3. Ensure referencing columns are UUID (if not, convert them)
ALTER TABLE products
  ALTER COLUMN manufacturer_id TYPE uuid USING manufacturer_id::uuid;

ALTER TABLE inquiries
  ALTER COLUMN manufacturer_id TYPE uuid USING manufacturer_id::uuid;

ALTER TABLE quotations
  ALTER COLUMN manufacturer_id TYPE uuid USING manufacturer_id::uuid;

-- 4. Rename the table
ALTER TABLE public.brickownerscust RENAME TO manufacturers;

-- 5. Drop and recreate foreign key constraints
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_manufacturer_id_fkey;
ALTER TABLE products ADD CONSTRAINT products_manufacturer_id_fkey FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE CASCADE;

ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS inquiries_manufacturer_id_fkey;
ALTER TABLE inquiries ADD CONSTRAINT inquiries_manufacturer_id_fkey FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE CASCADE;

ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_manufacturer_id_fkey;
ALTER TABLE quotations ADD CONSTRAINT quotations_manufacturer_id_fkey FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id);

-- 6. Recreate policies (allow all for now, you can restrict later)
CREATE POLICY "Anyone can view inquiries"
  ON inquiries
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update inquiries"
  ON inquiries
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can manage products"
  ON products
  FOR ALL
  USING (true);

CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  USING (is_available = TRUE);

-- 7. Update policies for manufacturers table
DROP POLICY IF EXISTS "Public read access" ON public.manufacturers;
CREATE POLICY "Public read access" ON public.manufacturers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert access" ON public.manufacturers;
CREATE POLICY "Public insert access" ON public.manufacturers FOR INSERT WITH CHECK (true);

-- 8. Add the new table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.manufacturers;