-- Check if the table is already in the publication before adding it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'brickownerscust'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.brickownerscust;
  END IF;
END
$$;
