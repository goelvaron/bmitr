import { supabase } from "@/lib/supabase";

export interface BloggerPost {
  id: string;
  published: string;
  updated: string;
  url: string;
  title: string;
  content: string;
  author: {
    id: string;
    displayName: string;
    url: string;
    image?: {
      url: string;
    };
  };
  images?: {
    url: string;
  }[];
  labels?: string[];
}

export interface BloggerCategory {
  id: string;
  name: string;
  count?: number;
}

// Blogger API URL and key - store these in environment variables in production
const BLOGGER_API_URL = "https://www.googleapis.com/blogger/v3/blogs";
// Get config from Supabase if available, otherwise use defaults
let BLOGGER_BLOG_ID = "4595828663851369556"; // Default blog ID
let BLOGGER_API_KEY = "AIzaSyCKjbgtYm1jYcOO4C9bhLbWY4_EoM4toGg"; // Default API key (public key for demo purposes)

// Config will be loaded when needed
let configLoaded = false;

// Function to load config when needed
const loadConfigIfNeeded = async () => {
  if (configLoaded) return;

  try {
    const config = await getBloggerConfig();
    if (config) {
      BLOGGER_BLOG_ID = config.blogId;
      BLOGGER_API_KEY = config.apiKey;
      console.log("Loaded Blogger config from Supabase");
    }
    configLoaded = true;
  } catch (err) {
    console.error("Failed to load Blogger config:", err);
    configLoaded = true; // Mark as loaded even if failed to prevent infinite retries
  }
};

/**
 * Fetch blog posts from Blogger
 */
export const getBloggerPosts = async (
  page = 1,
  perPage = 10,
  labelFilter?: string,
): Promise<{ posts: BloggerPost[]; totalPages: number }> => {
  try {
    // Load config if not already loaded
    await loadConfigIfNeeded();

    // Calculate start-index based on page and perPage
    const startIndex = (page - 1) * perPage + 1;

    let url = `${BLOGGER_API_URL}/${BLOGGER_BLOG_ID}/posts?key=${BLOGGER_API_KEY}&maxResults=${perPage}&startIndex=${startIndex}&fetchImages=true&fetchBodies=true`;

    if (labelFilter) {
      url += `&labels=${encodeURIComponent(labelFilter)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Blogger API error: ${response.status}`);
    }

    const data = await response.json();
    const posts = data.items || [];

    // Calculate total pages based on totalItems
    const totalItems = data.totalItems || 0;
    const totalPages = Math.ceil(totalItems / perPage);

    return { posts, totalPages };
  } catch (error) {
    console.error("Error fetching Blogger posts:", error);
    return { posts: [], totalPages: 0 };
  }
};

/**
 * Fetch a single Blogger post by ID
 */
export const getBloggerPostById = async (
  postId: string,
): Promise<BloggerPost | null> => {
  try {
    // Load config if not already loaded
    await loadConfigIfNeeded();

    const response = await fetch(
      `${BLOGGER_API_URL}/${BLOGGER_BLOG_ID}/posts/${postId}?key=${BLOGGER_API_KEY}&fetchImages=true`,
    );

    if (!response.ok) {
      throw new Error(`Blogger API error: ${response.status}`);
    }

    const post = await response.json();
    return post;
  } catch (error) {
    console.error("Error fetching Blogger post by ID:", error);
    return null;
  }
};

/**
 * Fetch a single Blogger post by URL path
 */
export const getBloggerPostByPath = async (
  path: string,
): Promise<BloggerPost | null> => {
  try {
    // First get all posts (limited to recent ones)
    const { posts } = await getBloggerPosts(1, 20);

    // Find the post with matching path in the URL
    const post = posts.find((post) => {
      const postPath = new URL(post.url).pathname.split("/").pop();
      return postPath === path;
    });

    if (!post) return null;

    // Get the full post details
    return await getBloggerPostById(post.id);
  } catch (error) {
    console.error("Error fetching Blogger post by path:", error);
    return null;
  }
};

/**
 * Fetch Blogger labels (categories)
 */
export const getBloggerLabels = async (): Promise<BloggerCategory[]> => {
  try {
    // Load config if not already loaded
    await loadConfigIfNeeded();

    // Blogger API doesn't have a direct endpoint for labels
    // We need to fetch posts and extract unique labels
    const { posts } = await getBloggerPosts(1, 50);

    const labelsMap = new Map<string, number>();

    posts.forEach((post) => {
      if (post.labels && post.labels.length > 0) {
        post.labels.forEach((label) => {
          const count = labelsMap.get(label) || 0;
          labelsMap.set(label, count + 1);
        });
      }
    });

    const labels: BloggerCategory[] = Array.from(labelsMap.entries()).map(
      ([name, count]) => ({
        id: name,
        name,
        count,
      }),
    );

    return labels;
  } catch (error) {
    console.error("Error fetching Blogger labels:", error);
    return [];
  }
};

/**
 * Store Blogger configuration in Supabase
 */
export const saveBloggerConfig = async (config: {
  blogId: string;
  apiKey: string;
}): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("app_config")
      .upsert({ key: "blogger_config", value: config })
      .select();

    if (error) {
      console.error("Error saving Blogger config:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Exception in saveBloggerConfig:", err);
    return false;
  }
};

/**
 * Get Blogger configuration from Supabase
 */
export const getBloggerConfig = async (): Promise<{
  blogId: string;
  apiKey: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "blogger_config")
      .single();

    if (error) {
      console.error("Error getting Blogger config:", error);
      return { blogId: BLOGGER_BLOG_ID, apiKey: BLOGGER_API_KEY };
    }

    return (
      (data?.value as {
        blogId: string;
        apiKey: string;
        blogUrl?: string;
        proxyUrl?: string;
        fetchMethod?: string;
      }) || {
        blogId: BLOGGER_BLOG_ID,
        apiKey: BLOGGER_API_KEY,
        fetchMethod: "direct-api",
      }
    );
  } catch (err) {
    console.error("Exception in getBloggerConfig:", err);
    return { blogId: BLOGGER_BLOG_ID, apiKey: BLOGGER_API_KEY };
  }
};
