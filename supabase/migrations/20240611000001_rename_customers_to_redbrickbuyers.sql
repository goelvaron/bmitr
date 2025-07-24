-- Rename customers table to redbrickbuyers
ALTER TABLE IF EXISTS customers RENAME TO redbrickbuyers;

-- Update foreign key constraints if any
ALTER TABLE IF EXISTS customer_preferences RENAME CONSTRAINT customer_preferences_customer_id_fkey TO customer_preferences_customer_id_fkey_redbrick;

-- Update indexes if any
ALTER INDEX IF EXISTS customers_email_idx RENAME TO redbrickbuyers_email_idx;
ALTER INDEX IF EXISTS customers_phone_idx RENAME TO redbrickbuyers_phone_idx;

-- Update sequences if any
ALTER SEQUENCE IF EXISTS customers_id_seq RENAME TO redbrickbuyers_id_seq;

-- Add the table to the realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'redbrickbuyers'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE redbrickbuyers';
  END IF;
END$$;

-- Rename auth tables if they exist
ALTER TABLE IF EXISTS customers_auth RENAME TO redbrickbuyers_auth;
ALTER TABLE IF EXISTS customers_profiles RENAME TO redbrickbuyers_profiles;
