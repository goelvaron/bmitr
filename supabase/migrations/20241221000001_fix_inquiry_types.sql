-- Update inquiry types to be more specific
-- For manufacturer_coal_inquiries
UPDATE manufacturer_coal_inquiries 
SET inquiry_type = CASE 
    WHEN inquiry_type = 'coal' OR inquiry_type = 'general' THEN 'general_inquiry'
    WHEN inquiry_type = 'quotation_request' THEN 'quotation_inquiry'
    WHEN inquiry_type = 'order_request' THEN 'order_inquiry'
    ELSE 'general_inquiry'
END;

-- For manufacturer_transport_inquiries
UPDATE manufacturer_transport_inquiries 
SET inquiry_type = CASE 
    WHEN inquiry_type = 'transport' OR inquiry_type = 'general' THEN 'general_inquiry'
    WHEN inquiry_type = 'quotation_request' THEN 'quotation_inquiry'
    WHEN inquiry_type = 'order_request' THEN 'order_inquiry'
    WHEN inquiry_type = 'rating_request' THEN 'rating_inquiry'
    ELSE 'general_inquiry'
END;

-- Add check constraints to ensure valid inquiry types
ALTER TABLE manufacturer_coal_inquiries 
DROP CONSTRAINT IF EXISTS check_coal_inquiry_type;

ALTER TABLE manufacturer_coal_inquiries 
ADD CONSTRAINT check_coal_inquiry_type 
CHECK (inquiry_type IN ('general_inquiry', 'quotation_inquiry', 'order_inquiry', 'rating_inquiry'));

ALTER TABLE manufacturer_transport_inquiries 
DROP CONSTRAINT IF EXISTS check_transport_inquiry_type;

ALTER TABLE manufacturer_transport_inquiries 
ADD CONSTRAINT check_transport_inquiry_type 
CHECK (inquiry_type IN ('general_inquiry', 'quotation_inquiry', 'order_inquiry', 'rating_inquiry'));

-- Update default values
ALTER TABLE manufacturer_coal_inquiries 
ALTER COLUMN inquiry_type SET DEFAULT 'general_inquiry';

ALTER TABLE manufacturer_transport_inquiries 
ALTER COLUMN inquiry_type SET DEFAULT 'general_inquiry';
