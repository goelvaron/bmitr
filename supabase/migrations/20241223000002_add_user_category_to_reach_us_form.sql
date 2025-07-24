-- Add user_category column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reach_us_form' 
        AND column_name = 'user_category'
    ) THEN
        ALTER TABLE reach_us_form 
        ADD COLUMN user_category TEXT NOT NULL DEFAULT 'End Buyer';
    END IF;
END $$;

-- Add constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_user_category' 
        AND table_name = 'reach_us_form'
    ) THEN
        ALTER TABLE reach_us_form 
        ADD CONSTRAINT check_user_category 
        CHECK (user_category IN ('End Buyer', 'Manufacturer', 'Coal/Fuel Provider', 'Transport Provider', 'Labour'));
    END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_reach_us_form_user_category ON reach_us_form(user_category);