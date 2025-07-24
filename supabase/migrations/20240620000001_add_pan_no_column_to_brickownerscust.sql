-- Add pan_no column to brickownerscust table
ALTER TABLE brickownerscust ADD COLUMN IF NOT EXISTS pan_no TEXT;
