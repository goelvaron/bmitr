-- Ensure the status column exists and has proper default value
ALTER TABLE manufacturers 
ALTER COLUMN status SET DEFAULT 'waitlist';

-- Update any existing records without status to waitlist
UPDATE manufacturers 
SET status = 'waitlist' 
WHERE status IS NULL OR status = '';

-- Make status column NOT NULL with default
ALTER TABLE manufacturers 
ALTER COLUMN status SET NOT NULL;

-- Add comment to clarify the purpose
COMMENT ON COLUMN manufacturers.status IS 'Manufacturer approval status: waitlist (default), approved, rejected';