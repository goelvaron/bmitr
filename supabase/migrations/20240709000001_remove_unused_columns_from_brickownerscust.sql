-- Remove unused columns from brickownerscust table
DO $$
BEGIN
  -- Check if columns exist before attempting to drop them
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brickownerscust' AND column_name = 'website') THEN
    ALTER TABLE brickownerscust DROP COLUMN IF EXISTS website;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brickownerscust' AND column_name = 'established_year') THEN
    ALTER TABLE brickownerscust DROP COLUMN IF EXISTS established_year;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brickownerscust' AND column_name = 'employee_count') THEN
    ALTER TABLE brickownerscust DROP COLUMN IF EXISTS employee_count;
  END IF;
END $$;
