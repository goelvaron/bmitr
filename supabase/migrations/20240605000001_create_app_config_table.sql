-- Create a table for application configuration
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Create policies for app_config table
-- Allow admins to read all app_config entries
DROP POLICY IF EXISTS "Admin users can read app_config" ON app_config;
CREATE POLICY "Admin users can read app_config"
  ON app_config FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE auth.users.email LIKE '%@bhattamitra.com'));

-- Allow admins to insert app_config entries
DROP POLICY IF EXISTS "Admin users can insert app_config" ON app_config;
CREATE POLICY "Admin users can insert app_config"
  ON app_config FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE auth.users.email LIKE '%@bhattamitra.com'));

-- Allow admins to update app_config entries
DROP POLICY IF EXISTS "Admin users can update app_config" ON app_config;
CREATE POLICY "Admin users can update app_config"
  ON app_config FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE auth.users.email LIKE '%@bhattamitra.com'));

-- Allow admins to delete app_config entries
DROP POLICY IF EXISTS "Admin users can delete app_config" ON app_config;
CREATE POLICY "Admin users can delete app_config"
  ON app_config FOR DELETE
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE auth.users.email LIKE '%@bhattamitra.com'));

-- Add to realtime publication
alter publication supabase_realtime add table app_config;
