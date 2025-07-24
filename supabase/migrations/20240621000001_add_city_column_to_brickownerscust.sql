-- Add city column to brickownerscust table
ALTER TABLE brickownerscust ADD COLUMN IF NOT EXISTS city TEXT;
