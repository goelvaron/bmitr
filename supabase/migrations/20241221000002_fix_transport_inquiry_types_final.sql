-- Final fix for transport inquiry types
-- Reset all existing transport inquiries to have proper inquiry types based on their context

-- First, let's see what we have and update based on patterns in the message or other fields
-- Update inquiries that mention "quotation" or "quote" to be quotation_inquiry
UPDATE manufacturer_transport_inquiries 
SET inquiry_type = 'quotation_inquiry'
WHERE (LOWER(message) LIKE '%quotation%' OR LOWER(message) LIKE '%quote%')
AND inquiry_type = 'general_inquiry';

-- Update inquiries that mention "order" to be order_inquiry
UPDATE manufacturer_transport_inquiries 
SET inquiry_type = 'order_inquiry'
WHERE LOWER(message) LIKE '%order%'
AND inquiry_type = 'general_inquiry';

-- Update inquiries that mention "rating" or "review" to be rating_inquiry
UPDATE manufacturer_transport_inquiries 
SET inquiry_type = 'rating_inquiry'
WHERE (LOWER(message) LIKE '%rating%' OR LOWER(message) LIKE '%review%')
AND inquiry_type = 'general_inquiry';

-- For inquiries that have corresponding quotations, mark them as quotation_inquiry
UPDATE manufacturer_transport_inquiries 
SET inquiry_type = 'quotation_inquiry'
WHERE id IN (
    SELECT DISTINCT mti.id 
    FROM manufacturer_transport_inquiries mti
    INNER JOIN manufacturer_transport_quotations mtq ON mti.id = mtq.inquiry_id
    WHERE mti.inquiry_type = 'general_inquiry'
);

-- For inquiries that have corresponding orders, mark them as order_inquiry
UPDATE manufacturer_transport_inquiries 
SET inquiry_type = 'order_inquiry'
WHERE id IN (
    SELECT DISTINCT mti.id 
    FROM manufacturer_transport_inquiries mti
    INNER JOIN manufacturer_transport_quotations mtq ON mti.id = mtq.inquiry_id
    INNER JOIN manufacturer_transport_orders mto ON mtq.id = mto.quotation_id
    WHERE mti.inquiry_type IN ('general_inquiry', 'quotation_inquiry')
);

-- For inquiries that have corresponding ratings, mark them as rating_inquiry
UPDATE manufacturer_transport_inquiries 
SET inquiry_type = 'rating_inquiry'
WHERE transport_provider_id IN (
    SELECT DISTINCT transport_provider_id 
    FROM manufacturer_transport_ratings mtr
    WHERE mtr.manufacturer_id = manufacturer_transport_inquiries.manufacturer_id
)
AND LOWER(message) LIKE '%rating%';

-- Ensure the check constraint is in place
ALTER TABLE manufacturer_transport_inquiries 
DROP CONSTRAINT IF EXISTS check_transport_inquiry_type;

ALTER TABLE manufacturer_transport_inquiries 
ADD CONSTRAINT check_transport_inquiry_type 
CHECK (inquiry_type IN ('general_inquiry', 'quotation_inquiry', 'order_inquiry', 'rating_inquiry'));

-- Update default value
ALTER TABLE manufacturer_transport_inquiries 
ALTER COLUMN inquiry_type SET DEFAULT 'general_inquiry';

-- Enable realtime for the table (only if not already added)
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