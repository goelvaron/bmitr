-- Update inquiry types based on actual context and relationships
-- This migration will look at the relationships between tables to determine the correct inquiry type

-- First, update inquiries that have quotations to be quotation_inquiry
UPDATE manufacturer_transport_inquiries 
SET inquiry_type = 'quotation_inquiry'
WHERE id IN (
    SELECT DISTINCT mti.id 
    FROM manufacturer_transport_inquiries mti
    INNER JOIN manufacturer_transport_quotations mtq ON mti.id = mtq.inquiry_id
);

-- Update inquiries that have orders (through quotations) to be order_inquiry
UPDATE manufacturer_transport_inquiries 
SET inquiry_type = 'order_inquiry'
WHERE id IN (
    SELECT DISTINCT mti.id 
    FROM manufacturer_transport_inquiries mti
    INNER JOIN manufacturer_transport_quotations mtq ON mti.id = mtq.inquiry_id
    INNER JOIN manufacturer_transport_orders mto ON mtq.id = mto.quotation_id
);

-- Update inquiries that have ratings (through orders) to be rating_inquiry
UPDATE manufacturer_transport_inquiries 
SET inquiry_type = 'rating_inquiry'
WHERE id IN (
    SELECT DISTINCT mti.id 
    FROM manufacturer_transport_inquiries mti
    INNER JOIN manufacturer_transport_quotations mtq ON mti.id = mtq.inquiry_id
    INNER JOIN manufacturer_transport_orders mto ON mtq.id = mto.quotation_id
    INNER JOIN manufacturer_transport_ratings mtr ON mto.id = mtr.order_id
);

-- For any remaining inquiries, check the message content to determine type
UPDATE manufacturer_transport_inquiries 
SET inquiry_type = CASE 
    WHEN LOWER(message) LIKE '%rating%' OR LOWER(message) LIKE '%review%' THEN 'rating_inquiry'
    WHEN LOWER(message) LIKE '%order%' THEN 'order_inquiry'
    WHEN LOWER(message) LIKE '%quotation%' OR LOWER(message) LIKE '%quote%' THEN 'quotation_inquiry'
    ELSE 'general_inquiry'
END
WHERE inquiry_type = 'general_inquiry';

-- Ensure the constraint is properly set
ALTER TABLE manufacturer_transport_inquiries 
DROP CONSTRAINT IF EXISTS check_transport_inquiry_type;

ALTER TABLE manufacturer_transport_inquiries 
ADD CONSTRAINT check_transport_inquiry_type 
CHECK (inquiry_type IN ('general_inquiry', 'quotation_inquiry', 'order_inquiry', 'rating_inquiry'));

-- Set default value
ALTER TABLE manufacturer_transport_inquiries 
ALTER COLUMN inquiry_type SET DEFAULT 'general_inquiry';

-- Enable realtime if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'manufacturer_transport_inquiries'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE manufacturer_transport_inquiries;
    END IF;
END $$;