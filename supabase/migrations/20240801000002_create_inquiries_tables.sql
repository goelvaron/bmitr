-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id UUID NOT NULL REFERENCES brickownerscust(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES endcustomers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inquiry responses table
CREATE TABLE IF NOT EXISTS inquiry_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for manufacturers to manage their inquiries
DROP POLICY IF EXISTS "Manufacturers can manage their own inquiries";
CREATE POLICY "Manufacturers can manage their own inquiries"
ON inquiries
FOR ALL
USING (manufacturer_id = auth.uid() OR manufacturer_id::TEXT = auth.uid()::TEXT);

-- Create policies for customers to view their own inquiries
DROP POLICY IF EXISTS "Customers can view their own inquiries";
CREATE POLICY "Customers can view their own inquiries"
ON inquiries
FOR SELECT
USING (customer_id = auth.uid() OR customer_id::TEXT = auth.uid()::TEXT);

-- Create policies for inquiry responses
DROP POLICY IF EXISTS "Users can view responses to their inquiries";
CREATE POLICY "Users can view responses to their inquiries"
ON inquiry_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM inquiries 
    WHERE inquiries.id = inquiry_responses.inquiry_id 
    AND (inquiries.manufacturer_id = auth.uid() OR 
         inquiries.manufacturer_id::TEXT = auth.uid()::TEXT OR
         inquiries.customer_id = auth.uid() OR 
         inquiries.customer_id::TEXT = auth.uid()::TEXT)
  )
);

DROP POLICY IF EXISTS "Manufacturers can add responses to their inquiries";
CREATE POLICY "Manufacturers can add responses to their inquiries"
ON inquiry_responses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM inquiries 
    WHERE inquiries.id = inquiry_responses.inquiry_id 
    AND (inquiries.manufacturer_id = auth.uid() OR 
         inquiries.manufacturer_id::TEXT = auth.uid()::TEXT)
  )
);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE inquiries;
ALTER PUBLICATION supabase_realtime ADD TABLE inquiry_responses;
