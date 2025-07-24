UPDATE manufacturer_transport_orders 
SET order_status = 'pending', 
    pickup_date = NULL, 
    actual_delivery_date = NULL, 
    tracking_number = NULL,
    updated_at = NOW()
WHERE order_status IN ('confirmed', 'completed', 'delivered', 'in_transit') 
  AND pickup_date IS NULL 
  AND tracking_number IS NULL;

UPDATE manufacturer_transport_orders 
SET order_status = 'pending',
    updated_at = NOW()
WHERE order_status IN ('confirmed', 'completed', 'delivered', 'in_transit')
  AND order_number LIKE 'TO-RATING-%';