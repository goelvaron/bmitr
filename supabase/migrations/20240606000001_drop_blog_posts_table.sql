-- Drop the blog_posts table if it exists
DROP TABLE IF EXISTS blog_posts;

-- Remove the realtime publication for the blog_posts table if the table exists
-- First check if the table exists in the publication
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'blog_posts'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE blog_posts';
  END IF;
END
$$;
