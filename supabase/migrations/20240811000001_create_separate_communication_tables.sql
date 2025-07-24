-- Create separate inquiry tables
CREATE TABLE IF NOT EXISTS manufacturer_coal_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  coal_provider_id UUID NOT NULL REFERENCES coal_providers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  inquiry_type VARCHAR(50) NOT NULL DEFAULT 'coal',
  message TEXT NOT NULL,
  quantity INTEGER,
  unit VARCHAR(20),
  delivery_location TEXT,
  expected_delivery_date DATE,
  budget_range_min DECIMAL(10,2),
  budget_range_max DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manufacturer_transport_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  transport_provider_id UUID NOT NULL REFERENCES transport_providers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  inquiry_type VARCHAR(50) NOT NULL DEFAULT 'transport',
  message TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  cargo_weight DECIMAL(10,2),
  cargo_volume DECIMAL(10,2),
  expected_pickup_date DATE,
  expected_delivery_date DATE,
  transport_type VARCHAR(50),
  budget_range_min DECIMAL(10,2),
  budget_range_max DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- Create separate quotation tables
CREATE TABLE IF NOT EXISTS manufacturer_coal_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES manufacturer_coal_inquiries(id) ON DELETE CASCADE,
  coal_provider_id UUID NOT NULL REFERENCES coal_providers(id) ON DELETE CASCADE,
  manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  coal_type VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  unit VARCHAR(20) NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  delivery_location TEXT,
  delivery_timeline VARCHAR(100),
  payment_terms TEXT,
  validity_period INTEGER DEFAULT 30,
  additional_notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manufacturer_transport_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES manufacturer_transport_inquiries(id) ON DELETE CASCADE,
  transport_provider_id UUID NOT NULL REFERENCES transport_providers(id) ON DELETE CASCADE,
  manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  pickup_location TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  transport_type VARCHAR(50) NOT NULL,
  vehicle_type VARCHAR(50),
  cargo_capacity DECIMAL(10,2),
  price_per_km DECIMAL(10,2),
  base_charge DECIMAL(10,2),
  total_estimated_cost DECIMAL(12,2) NOT NULL,
  estimated_duration VARCHAR(50),
  payment_terms TEXT,
  validity_period INTEGER DEFAULT 30,
  additional_notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create separate order tables
CREATE TABLE IF NOT EXISTS manufacturer_coal_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES manufacturer_coal_quotations(id) ON DELETE CASCADE,
  manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  coal_provider_id UUID NOT NULL REFERENCES coal_providers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  coal_type VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  unit VARCHAR(20) NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  delivery_location TEXT NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  payment_status VARCHAR(20) DEFAULT 'pending',
  order_status VARCHAR(20) DEFAULT 'confirmed',
  payment_terms TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manufacturer_transport_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES manufacturer_transport_quotations(id) ON DELETE CASCADE,
  manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  transport_provider_id UUID NOT NULL REFERENCES transport_providers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  pickup_location TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  pickup_date DATE,
  expected_delivery_date DATE,
  actual_pickup_date DATE,
  actual_delivery_date DATE,
  cargo_description TEXT,
  cargo_weight DECIMAL(10,2),
  transport_type VARCHAR(50) NOT NULL,
  vehicle_type VARCHAR(50),
  total_cost DECIMAL(12,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  order_status VARCHAR(20) DEFAULT 'confirmed',
  tracking_number VARCHAR(100),
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create separate rating tables
CREATE TABLE IF NOT EXISTS manufacturer_coal_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES manufacturer_coal_orders(id) ON DELETE CASCADE,
  manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  coal_provider_id UUID NOT NULL REFERENCES coal_providers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title VARCHAR(200),
  review_text TEXT,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  would_recommend BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manufacturer_transport_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES manufacturer_transport_orders(id) ON DELETE CASCADE,
  manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  transport_provider_id UUID NOT NULL REFERENCES transport_providers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title VARCHAR(200),
  review_text TEXT,
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  would_recommend BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coal_provider_manufacturer_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  coal_provider_id UUID NOT NULL REFERENCES coal_providers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title VARCHAR(200),
  review_text TEXT,
  payment_rating INTEGER CHECK (payment_rating >= 1 AND payment_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  would_work_again BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_provider_manufacturer_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  transport_provider_id UUID NOT NULL REFERENCES transport_providers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title VARCHAR(200),
  review_text TEXT,
  payment_rating INTEGER CHECK (payment_rating >= 1 AND payment_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  would_work_again BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for all tables (only if not already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'manufacturer_coal_inquiries'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE manufacturer_coal_inquiries;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'manufacturer_transport_inquiries'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE manufacturer_transport_inquiries;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'manufacturer_coal_quotations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE manufacturer_coal_quotations;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'manufacturer_transport_quotations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE manufacturer_transport_quotations;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'manufacturer_coal_orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE manufacturer_coal_orders;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'manufacturer_transport_orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE manufacturer_transport_orders;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'manufacturer_coal_ratings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE manufacturer_coal_ratings;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'manufacturer_transport_ratings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE manufacturer_transport_ratings;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'coal_provider_manufacturer_ratings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE coal_provider_manufacturer_ratings;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'transport_provider_manufacturer_ratings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE transport_provider_manufacturer_ratings;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_manufacturer_coal_inquiries_manufacturer_id ON manufacturer_coal_inquiries(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_manufacturer_coal_inquiries_coal_provider_id ON manufacturer_coal_inquiries(coal_provider_id);
CREATE INDEX IF NOT EXISTS idx_manufacturer_coal_inquiries_status ON manufacturer_coal_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_manufacturer_coal_inquiries_created_at ON manufacturer_coal_inquiries(created_at);

CREATE INDEX IF NOT EXISTS idx_manufacturer_transport_inquiries_manufacturer_id ON manufacturer_transport_inquiries(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_manufacturer_transport_inquiries_transport_provider_id ON manufacturer_transport_inquiries(transport_provider_id);
CREATE INDEX IF NOT EXISTS idx_manufacturer_transport_inquiries_status ON manufacturer_transport_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_manufacturer_transport_inquiries_created_at ON manufacturer_transport_inquiries(created_at);

CREATE INDEX IF NOT EXISTS idx_manufacturer_coal_quotations_inquiry_id ON manufacturer_coal_quotations(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_manufacturer_coal_quotations_status ON manufacturer_coal_quotations(status);
CREATE INDEX IF NOT EXISTS idx_manufacturer_coal_quotations_created_at ON manufacturer_coal_quotations(created_at);

CREATE INDEX IF NOT EXISTS idx_manufacturer_transport_quotations_inquiry_id ON manufacturer_transport_quotations(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_manufacturer_transport_quotations_status ON manufacturer_transport_quotations(status);
CREATE INDEX IF NOT EXISTS idx_manufacturer_transport_quotations_created_at ON manufacturer_transport_quotations(created_at);

CREATE INDEX IF NOT EXISTS idx_manufacturer_coal_orders_manufacturer_id ON manufacturer_coal_orders(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_manufacturer_coal_orders_coal_provider_id ON manufacturer_coal_orders(coal_provider_id);
CREATE INDEX IF NOT EXISTS idx_manufacturer_coal_orders_order_status ON manufacturer_coal_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_manufacturer_coal_orders_payment_status ON manufacturer_coal_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_manufacturer_coal_orders_created_at ON manufacturer_coal_orders(created_at);

CREATE INDEX IF NOT EXISTS idx_manufacturer_transport_orders_manufacturer_id ON manufacturer_transport_orders(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_manufacturer_transport_orders_transport_provider_id ON manufacturer_transport_orders(transport_provider_id);
CREATE INDEX IF NOT EXISTS idx_manufacturer_transport_orders_order_status ON manufacturer_transport_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_manufacturer_transport_orders_payment_status ON manufacturer_transport_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_manufacturer_transport_orders_created_at ON manufacturer_transport_orders(created_at);

CREATE INDEX IF NOT EXISTS idx_manufacturer_coal_ratings_manufacturer_id ON manufacturer_coal_ratings(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_manufacturer_coal_ratings_coal_provider_id ON manufacturer_coal_ratings(coal_provider_id);
CREATE INDEX IF NOT EXISTS idx_manufacturer_coal_ratings_rating ON manufacturer_coal_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_manufacturer_coal_ratings_created_at ON manufacturer_coal_ratings(created_at);

CREATE INDEX IF NOT EXISTS idx_manufacturer_transport_ratings_manufacturer_id ON manufacturer_transport_ratings(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_manufacturer_transport_ratings_transport_provider_id ON manufacturer_transport_ratings(transport_provider_id);
CREATE INDEX IF NOT EXISTS idx_manufacturer_transport_ratings_rating ON manufacturer_transport_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_manufacturer_transport_ratings_created_at ON manufacturer_transport_ratings(created_at);