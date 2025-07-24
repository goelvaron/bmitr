-- Add exim_code column to brickownerscust table
ALTER TABLE brickownerscust ADD COLUMN IF NOT EXISTS exim_code TEXT;
