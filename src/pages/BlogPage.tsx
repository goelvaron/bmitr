import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Calendar } from "lucide-react";
import { getBloggerPosts, getBloggerLabels } from "@/services/bloggerService";
import { getBloggerConfig } from "@/services/bloggerService";
import { supabase } from "@/lib/supabase";
import { useWebsiteContent } from "@/services/contentService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BlogPage = () => {
  const { t } = useTranslation();
  const { content } = useWebsiteContent();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Add refs for Header component
  const aboutRef = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const onboardingRef = useRef<HTMLElement>(null);
  const blogRef = useRef<HTMLElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try both methods in sequence - first Edge Function, then direct API if that fails test
        let bloggerPosts = [];
        let total = 0;
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
                page: currentPage,
                perPage: 9,
                labelFilter: selectedCategory || undefined,
              },
            },
          );

          if (!fetchError && data && data.posts) {
            bloggerPosts = data.posts;
            total = data.totalPages || 0;
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
            currentPage,
            9,
            selectedCategory,
          );
          bloggerPosts = result.posts;
          total = result.totalPages;
          console.log("Successfully fetched via direct API");
        }

        setPosts(bloggerPosts);
        setTotalPages(total);

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
  }, [currentPage, selectedCategory]);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        scrollToSection={scrollToSection}
        aboutRef={aboutRef}
        servicesRef={servicesRef}
        onboardingRef={onboardingRef}
        blogRef={blogRef}
        page="blog"
      />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-white border-8 border-redFiredMustard-600 rounded-2xl p-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-redFiredMustard-900">
              {t("blog.blogTitle") || content?.blogTitle || "Blogs & Resources"}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-redFiredMustard-700">
              {t("blog.blogSubtitle") ||
                content?.blogSubtitle ||
                "Latest news and updates from Bhatta Mitra™"}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-3/4">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">
                  {selectedCategory
                    ? selectedCategory
                    : t("blog.allPosts") || "All Posts"}
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t("blog.searchPosts") || "Search posts..."}
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
                  {error}
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
                    <Card
                      key={post.id}
                      className="overflow-hidden flex flex-col"
                    >
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
                        <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                        <div
                          className="text-muted-foreground line-clamp-3"
                          dangerouslySetInnerHTML={{
                            __html:
                              post.content
                                .replace(/<[^>]*>/g, " ")
                                .substring(0, 150) + "...",
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

              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      {t("blog.previous") || "Previous"}
                    </Button>
                    <div className="flex items-center px-4">
                      {t("blog.page") || "Page"} {currentPage}{" "}
                      {t("blog.of") || "of"} {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      {t("blog.next") || "Next"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full md:w-1/4">
              <div className="sticky top-24">
                <div className="bg-muted p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-bold mb-4">
                    {t("blog.categories") || "Categories"}
                  </h3>
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="w-full mb-4 flex flex-wrap">
                      <TabsTrigger
                        value="all"
                        className="flex-grow"
                        onClick={() => setSelectedCategory("")}
                      >
                        {t("blog.allPosts") || "All"}
                      </TabsTrigger>
                      {categories.slice(0, 3).map((category) => (
                        <TabsTrigger
                          key={category.id}
                          value={category.name}
                          className="flex-grow"
                          onClick={() => setSelectedCategory(category.name)}
                        >
                          {category.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {categories.length > 3 && (
                      <div className="space-y-2">
                        {categories.slice(3).map((category) => (
                          <Button
                            key={category.id}
                            variant="ghost"
                            className="w-full justify-start text-left"
                            onClick={() => setSelectedCategory(category.name)}
                          >
                            {category.name}
                            {category.count && (
                              <span className="ml-auto text-xs bg-muted-foreground/20 px-2 py-1 rounded-full">
                                {category.count}
                              </span>
                            )}
                          </Button>
                        ))}
                      </div>
                    )}
                  </Tabs>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
                  <h3 className="text-lg font-bold mb-4">
                    {t("blog.blogAboutTitle") ||
                      content?.blogAboutTitle ||
                      "About Our Blog"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t("blog.blogAboutDescription") ||
                      content?.blogAboutDescription ||
                      "Stay updated with the latest news, innovations, and insights from the brick kiln industry."}
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/">{t("blog.backToHome") || "Back to Home"}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        scrollToSection={scrollToSection}
        aboutRef={aboutRef}
        servicesRef={servicesRef}
        onboardingRef={onboardingRef}
        blogRef={blogRef}
      />
    </div>
  );
};

export default BlogPage;
