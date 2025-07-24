-- Add status column to brickownerscust table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brickownerscust' AND column_name = 'status') THEN
        ALTER TABLE public.brickownerscust ADD COLUMN status TEXT DEFAULT 'waitlist';
    END IF;
END$$;