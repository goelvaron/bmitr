-- Add new columns to brickownerscust table
ALTER TABLE brickownerscust
ADD COLUMN IF NOT EXISTS gst_details TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS pin_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India';

-- Check if table is already in realtime publication before adding it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'brickownerscust'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE brickownerscust';
  END IF;
END $$;
