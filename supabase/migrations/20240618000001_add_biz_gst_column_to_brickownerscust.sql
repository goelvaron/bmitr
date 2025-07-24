-- Add biz_gst column to brickownerscust table
ALTER TABLE brickownerscust ADD COLUMN IF NOT EXISTS biz_gst TEXT;
