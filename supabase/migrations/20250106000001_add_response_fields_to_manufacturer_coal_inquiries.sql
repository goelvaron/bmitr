ALTER TABLE manufacturer_coal_inquiries 
ADD COLUMN provider_response TEXT,
ADD COLUMN provider_response_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN responded_by TEXT;

COMMENT ON COLUMN manufacturer_coal_inquiries.provider_response IS 'Text response from coal provider to the inquiry';
COMMENT ON COLUMN manufacturer_coal_inquiries.provider_response_date IS 'Timestamp when the provider responded';
COMMENT ON COLUMN manufacturer_coal_inquiries.responded_by IS 'Name or ID of the person who responded';
