ALTER TABLE manufacturer_coal_ratings ALTER COLUMN order_id SET NOT NULL;

ALTER TABLE manufacturer_coal_ratings 
ADD CONSTRAINT fk_manufacturer_coal_ratings_order_id 
FOREIGN KEY (order_id) REFERENCES manufacturer_coal_orders(id) ON DELETE CASCADE;

ALTER TABLE manufacturer_coal_ratings 
ADD CONSTRAINT check_order_completed 
CHECK (order_id IS NOT NULL);

alter publication supabase_realtime add table manufacturer_coal_ratings;
