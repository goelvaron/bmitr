-- Create quotations table
CREATE TABLE public.quotations (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  customer_id uuid NOT NULL,
  manufacturer_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL,
  quoted_price numeric(10, 2) NOT NULL,
  total_amount numeric(10, 2) NOT NULL,
  message text NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT quotations_pkey PRIMARY KEY (id),
  CONSTRAINT quotations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES endcustomers (id),
  CONSTRAINT quotations_manufacturer_id_fkey FOREIGN KEY (manufacturer_id) REFERENCES brickownerscust (id),
  CONSTRAINT quotations_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id)
) TABLESPACE pg_default; 