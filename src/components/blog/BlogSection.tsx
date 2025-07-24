import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Search, Calendar } from "lucide-react";
import { getBloggerPosts, getBloggerLabels } from "@/services/bloggerService";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const BlogSection = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try both methods in sequence - first Edge Function, then direct API if that fails
        let bloggerPosts = [];
        let success = false;

        // First attempt: Edge Function
        try {
          console.log("Attempting to fetch via Edge Function");
          const config = await getBloggerConfig();
          const { data, error: fetchError } = await supabase.functions.invoke(
            "supabase-functions-blogger-fetch",
            {
              body: {
                blogId: config.blogId,
                apiKey: config.apiKey,
                page: 1,
                perPage: 6, // Show fewer posts on homepage
                labelFilter: selectedCategory || undefined,
              },
            },
          );

          if (!fetchError && data && data.posts) {
            bloggerPosts = data.posts;
            success = true;
            console.log("Successfully fetched via Edge Function");
          }
        } catch (edgeFunctionError) {
          console.warn("Edge function error:", edgeFunctionError);
        }

        // Second attempt: Direct API call if Edge Function failed
        if (!success) {
          console.log("Falling back to direct API call");
          const result = await getBloggerPosts(
            1,
            6, // Show fewer posts on homepage
            selectedCategory,
          );
          bloggerPosts = result.posts;
          console.log("Successfully fetched via direct API");
        }

        setPosts(bloggerPosts);

        // Extract categories from posts or fetch separately
        let labels = [];
        if (bloggerPosts && bloggerPosts.length > 0) {
          const labelsMap = new Map();

          bloggerPosts.forEach((post) => {
            if (post.labels && post.labels.length > 0) {
              post.labels.forEach((label) => {
                const count = labelsMap.get(label) || 0;
                labelsMap.set(label, count + 1);
              });
            }
          });

          labels = Array.from(labelsMap.entries()).map(([name, count]) => ({
            id: name,
            name,
            count,
          }));

          if (labels.length === 0) {
            // If no labels found in posts, fetch them directly
            labels = await getBloggerLabels();
          }

          setCategories(labels);
        } else {
          // If no posts, try to fetch categories directly
          labels = await getBloggerLabels();
          setCategories(labels);
        }
      } catch (err) {
        console.error("Error fetching blog data:", err);
        setError("Failed to load blog content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      (post.content && post.content.toLowerCase().includes(query))
    );
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Function to get Blogger config
  const getBloggerConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("app_config")
        .select("value")
        .eq("key", "blogger_config")
        .single();

      if (error) {
        console.error("Error getting Blogger config:", error);
        return {
          blogId: "4595828663851369556",
          apiKey: "AIzaSyCKjbgtYm1jYcOO4C9bhLbWY4_EoM4toGg",
        };
      }

      return (
        (data?.value as {
          blogId: string;
          apiKey: string;
        }) || {
          blogId: "4595828663851369556",
          apiKey: "AIzaSyCKjbgtYm1jYcOO4C9bhLbWY4_EoM4toGg",
        }
      );
    } catch (err) {
      console.error("Exception in getBloggerConfig:", err);
      return {
        blogId: "4595828663851369556",
        apiKey: "AIzaSyCKjbgtYm1jYcOO4C9bhLbWY4_EoM4toGg",
      };
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-semibold text-redFiredMustard-800">
          {selectedCategory
            ? selectedCategory
            : t("blog.allPosts") || "All Posts"}
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("blog.searchPlaceholder") || "Search blog posts..."}
            className="pl-10 pr-4 py-2 rounded-md border border-input bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error === "Failed to load blog content. Please try again later."
            ? t("blog.error") || error
            : error}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            {t("blog.noPosts") ||
              "No posts found. Try a different search or category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden flex flex-col">
              {post.images && post.images.length > 0 && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.images[0].url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="flex-grow p-6">
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{formatDate(post.published)}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-redFiredMustard-800">
                  {post.title}
                </h3>
                <div
                  className="text-redFiredMustard-700 line-clamp-3"
                  dangerouslySetInnerHTML={{
                    __html:
                      post.content.replace(/<[^>]*>/g, " ").substring(0, 150) +
                      "...",
                  }}
                />
              </CardContent>
              <CardFooter className="border-t p-6">
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/posts/${post.id}`}>
                    {t("blog.readMore") || "Read More"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            onClick={() => setSelectedCategory("")}
            className="text-sm"
          >
            {t("blog.allPosts") || "All Posts"}
          </Button>
          {categories.slice(0, 5).map((category) => (
            <Button
              key={category.id}
              variant={
                selectedCategory === category.name ? "default" : "outline"
              }
              onClick={() => setSelectedCategory(category.name)}
              className="text-sm"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSection;
