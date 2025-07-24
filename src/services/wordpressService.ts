import { supabase } from "@/lib/supabase";

export interface WordPressPost {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  slug: string;
  featured_media: number;
  _embedded?: {
    "wp:featuredmedia"?: [
      {
        source_url: string;
      },
    ];
    "wp:term"?: [
      {
        id: number;
        name: string;
        slug: string;
      }[],
    ];
  };
  categories: number[];
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

// WordPress site URL - store this in environment variable in production
const WORDPRESS_API_URL =
  "https://public-api.wordpress.com/wp/v2/sites/bhattamitra.wordpress.com";

/**
 * Fetch blog posts from WordPress
 */
export const getWordPressPosts = async (
  page = 1,
  perPage = 10,
  categoryId?: number,
): Promise<{ posts: WordPressPost[]; totalPages: number }> => {
  try {
    let url = `${WORDPRESS_API_URL}/posts?_embed=true&page=${page}&per_page=${perPage}`;

    if (categoryId) {
      url += `&categories=${categoryId}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const posts = await response.json();
    const totalPages = parseInt(
      response.headers.get("X-WP-TotalPages") || "1",
      10,
    );

    return { posts, totalPages };
  } catch (error) {
    console.error("Error fetching WordPress posts:", error);
    return { posts: [], totalPages: 0 };
  }
};

/**
 * Fetch a single WordPress post by slug
 */
export const getWordPressPostBySlug = async (
  slug: string,
): Promise<WordPressPost | null> => {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?slug=${slug}&_embed=true`,
    );

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const posts = await response.json();

    if (posts.length === 0) {
      return null;
    }

    return posts[0];
  } catch (error) {
    console.error("Error fetching WordPress post by slug:", error);
    return null;
  }
};

/**
 * Fetch WordPress categories
 */
export const getWordPressCategories = async (): Promise<
  WordPressCategory[]
> => {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/categories`);

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error("Error fetching WordPress categories:", error);
    return [];
  }
};

/**
 * Store WordPress configuration in Supabase
 * This is useful for storing the WordPress site URL and other configuration
 */
export const saveWordPressConfig = async (config: {
  siteUrl: string;
}): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("app_config")
      .upsert({ key: "wordpress_config", value: config })
      .select();

    if (error) {
      console.error("Error saving WordPress config:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Exception in saveWordPressConfig:", err);
    return false;
  }
};

/**
 * Get WordPress configuration from Supabase
 */
export const getWordPressConfig = async (): Promise<{
  siteUrl: string;
} | null> => {
  try {
    const { data, error } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "wordpress_config")
      .single();

    if (error) {
      console.error("Error getting WordPress config:", error);
      return null;
    }

    return (data?.value as { siteUrl: string }) || null;
  } catch (err) {
    console.error("Exception in getWordPressConfig:", err);
    return null;
  }
};
