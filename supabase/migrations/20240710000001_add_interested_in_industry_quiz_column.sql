-- Add interested_in_industry_quiz column to brickownerscust table if it doesn't exist
DO $$
BEGIN
  -- Check if column doesn't exist before attempting to add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brickownerscust' AND column_name = 'interested_in_industry_quiz') THEN
    ALTER TABLE brickownerscust ADD COLUMN interested_in_industry_quiz BOOLEAN DEFAULT false;
  END IF;
END $$;