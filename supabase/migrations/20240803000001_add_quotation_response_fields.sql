-- Add response fields to quotations table
ALTER TABLE public.quotations
ADD COLUMN IF NOT EXISTS response_message TEXT,
ADD COLUMN IF NOT EXISTS response_quantity INTEGER,
ADD COLUMN IF NOT EXISTS response_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS offer_expiry TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE;