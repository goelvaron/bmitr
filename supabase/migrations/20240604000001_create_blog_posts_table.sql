-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  summary TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author_id UUID,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  tags TEXT[],
  category VARCHAR(100)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts(status);

-- Enable row level security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public read access" ON blog_posts;
CREATE POLICY "Public read access"
ON blog_posts FOR SELECT
USING (status = 'published');

DROP POLICY IF EXISTS "Admin full access" ON blog_posts;
CREATE POLICY "Admin full access"
ON blog_posts FOR ALL
USING (auth.uid() IN (SELECT id FROM auth.users WHERE auth.users.email LIKE '%@bhattamitra.com'));

-- Enable realtime
alter publication supabase_realtime add table blog_posts;