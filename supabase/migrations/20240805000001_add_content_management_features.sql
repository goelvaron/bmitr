-- Add indexes for better performance on content queries
CREATE INDEX IF NOT EXISTS idx_website_content_category ON website_content(category);
CREATE INDEX IF NOT EXISTS idx_website_content_key ON website_content(key);

-- Add some example dynamic content fields
INSERT INTO website_content (key, value, category) VALUES
('custom_announcement_text', 'Welcome to our new platform!', 'general'),
('custom_cta_button_text', 'Get Started Today', 'general'),
('custom_feature_highlight', 'Revolutionary brick kiln management system', 'landing')
ON CONFLICT (key) DO NOTHING;

-- Update the trigger to handle updated_at properly
DROP TRIGGER IF EXISTS update_website_content_updated_at ON website_content;
CREATE TRIGGER update_website_content_updated_at 
    BEFORE UPDATE ON website_content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure realtime is enabled for the table
alter publication supabase_realtime add table website_content;
