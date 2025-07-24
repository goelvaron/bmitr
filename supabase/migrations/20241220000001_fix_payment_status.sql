-- Fix payment status for existing orders
-- Reset payment status to 'pending' for orders that don't have actual completion evidence
UPDATE manufacturer_coal_orders 
SET payment_status = 'pending', 
    updated_at = NOW()
WHERE payment_status = 'completed' 
  AND actual_delivery_date IS NULL 
  AND order_status != 'delivered';

-- Also fix transport orders if they exist
UPDATE manufacturer_transport_orders 
SET payment_status = 'pending', 
    updated_at = NOW()
WHERE payment_status = 'completed' 
  AND actual_delivery_date IS NULL 
  AND order_status != 'delivered';

-- Add a constraint to prevent invalid payment status combinations
-- Payment should only be 'completed' or 'paid' if order is delivered or has actual delivery date
ALTER TABLE manufacturer_coal_orders 
ADD CONSTRAINT check_payment_status_validity 
CHECK (
  (payment_status IN ('pending', 'processing', 'failed')) OR 
  (payment_status IN ('completed', 'paid') AND (actual_delivery_date IS NOT NULL OR order_status = 'delivered'))
);

ALTER TABLE manufacturer_transport_orders 
ADD CONSTRAINT check_payment_status_validity 
CHECK (
  (payment_status IN ('pending', 'processing', 'failed')) OR 
  (payment_status IN ('completed', 'paid') AND (actual_delivery_date IS NOT NULL OR order_status = 'delivered'))
);
