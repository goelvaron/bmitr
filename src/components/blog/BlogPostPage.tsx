import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import {
  getBloggerConfig,
  getBloggerPostById,
} from "@/services/bloggerService";
import { supabase } from "@/lib/supabase";

const BlogPostPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setError("No post ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Fetching post with slug:", slug);

        // Try Edge Function first
        try {
          const config = await getBloggerConfig();
          console.log("Using config:", config);

          const { data, error: fetchError } = await supabase.functions.invoke(
            "supabase-functions-blogger-fetch",
            {
              body: {
                blogId: config.blogId,
                apiKey: config.apiKey,
                postId: slug,
              },
            },
          );

          if (fetchError) {
            console.warn("Edge function error:", fetchError);
            throw new Error(fetchError.message);
          }

          if (data && data.post) {
            console.log(
              "Post fetched successfully via Edge Function:",
              data.post.title,
            );
            setPost(data.post);
            return;
          }
        } catch (edgeError) {
          console.warn("Edge function failed, trying direct API:", edgeError);
        }

        // Fallback to direct API call
        console.log("Trying direct API call");
        const directPost = await getBloggerPostById(slug);
        if (directPost) {
          console.log(
            "Post fetched successfully via direct API:",
            directPost.title,
          );
          setPost(directPost);
        } else {
          setError("Post not found");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load blog post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <img
              src="https://i.ibb.co/QFqqRyCt/76164180-2.png"
              alt="Bhatta Mitra Logo"
              className="h-10 w-auto"
            />
            <h1 className="text-xl font-bold">
              BHATTA MITRA™ - FRIEND IN YOUR NEED
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-foreground/80 hover:text-foreground"
              asChild
            >
              <Link to="/">{t("header.home")}</Link>
            </Button>
            <Button
              variant="ghost"
              className="text-foreground/80 hover:text-foreground"
              asChild
            >
              <Link to="/blog">Blogs & Resources</Link>
            </Button>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="ml-4 text-muted-foreground">Loading blog post...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Error Loading Post</h3>
            <p>
              {error === "Post not found"
                ? t("blog.postNotFound") ||
                  "The requested blog post could not be found."
                : error === "Failed to load blog post"
                  ? t("blog.failedToLoadPost") ||
                    "Failed to load the blog post. Please try again later."
                  : error}
            </p>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link to="/blog">Return to Blog</Link>
              </Button>
            </div>
          </div>
        ) : post ? (
          <div className="max-w-3xl mx-auto">
            {post.images && post.images.length > 0 && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <img
                  src={post.images[0].url}
                  alt={post.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {post.title}
            </h1>

            <div className="flex items-center text-muted-foreground mb-6">
              <div className="flex items-center mr-4">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{formatDate(post.published)}</span>
              </div>

              {post.labels && post.labels.length > 0 && (
                <div className="flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  <div className="flex flex-wrap gap-2">
                    {post.labels.map((label, index) => (
                      <Link
                        key={index}
                        to={`/blog?category=${encodeURIComponent(label)}`}
                        className="text-primary hover:underline"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            <div className="mt-12 pt-6 border-t">
              <Button asChild>
                <Link to="/blog">Back To Blogs & Resources</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
            <p className="text-lg mb-6 text-muted-foreground">
              {t("blog.postNotFound") ||
                "The requested blog post could not be found or may have been removed."}
            </p>
            <div className="space-x-4">
              <Button asChild>
                <Link to="/blog">
                  {t("blog.returnToBlog") || "Return to Blog"}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">Go to Home</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-muted py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BHATTA MITRA™ - FRIEND IN YOUR
            NEED. {t("footer.copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BlogPostPage;
