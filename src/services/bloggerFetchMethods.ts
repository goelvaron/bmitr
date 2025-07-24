import { BloggerPost, BloggerCategory } from "./bloggerService";

// Method 1: Direct Blogger API (currently implemented)
export const fetchViaDirectAPI = async (
  blogId: string,
  apiKey: string,
  page = 1,
  perPage = 10,
  labelFilter?: string,
): Promise<{ posts: BloggerPost[]; totalPages: number }> => {
  try {
    const BLOGGER_API_URL = "https://www.googleapis.com/blogger/v3/blogs";
    const startIndex = (page - 1) * perPage + 1;

    let url = `${BLOGGER_API_URL}/${blogId}/posts?key=${apiKey}&maxResults=${perPage}&startIndex=${startIndex}&fetchImages=true&fetchBodies=true`;

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
    console.error("Error fetching Blogger posts via direct API:", error);
    return { posts: [], totalPages: 0 };
  }
};

// Method 2: RSS Feed
export const fetchViaRSS = async (
  blogUrl: string,
  maxPosts = 10,
): Promise<BloggerPost[]> => {
  try {
    // Append /feeds/posts/default?alt=rss to the blog URL
    const rssUrl = `${blogUrl}/feeds/posts/default?alt=rss`;
    const response = await fetch(rssUrl);

    if (!response.ok) {
      throw new Error(`RSS feed error: ${response.status}`);
    }

    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");

    const items = xmlDoc.querySelectorAll("item");
    const posts: BloggerPost[] = [];

    items.forEach((item, index) => {
      if (index >= maxPosts) return;

      const title = item.querySelector("title")?.textContent || "";
      const link = item.querySelector("link")?.textContent || "";
      const pubDate = item.querySelector("pubDate")?.textContent || "";
      const content = item.querySelector("description")?.textContent || "";

      // Extract image from content if available
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      const firstImg = tempDiv.querySelector("img");
      const imageUrl = firstImg?.src || "";

      posts.push({
        id: `rss-${index}`,
        title,
        url: link,
        published: new Date(pubDate).toISOString(),
        updated: new Date(pubDate).toISOString(),
        content,
        author: {
          id: "rss-author",
          displayName: "Blog Author",
          url: blogUrl,
        },
        images: imageUrl ? [{ url: imageUrl }] : undefined,
        labels: [],
      });
    });

    return posts;
  } catch (error) {
    console.error("Error fetching Blogger posts via RSS:", error);
    return [];
  }
};

// Method 3: Blogger JSON Feed
export const fetchViaJSONFeed = async (
  blogUrl: string,
  maxPosts = 10,
): Promise<BloggerPost[]> => {
  try {
    // Append /feeds/posts/default?alt=json to the blog URL
    const jsonUrl = `${blogUrl}/feeds/posts/default?alt=json&max-results=${maxPosts}`;
    const response = await fetch(jsonUrl);

    if (!response.ok) {
      throw new Error(`JSON feed error: ${response.status}`);
    }

    const data = await response.json();
    const entries = data.feed.entry || [];

    return entries.map((entry: any, index: number) => {
      // Extract the first link with rel="alternate"
      const link =
        entry.link.find((l: any) => l.rel === "alternate")?.href || "";

      // Extract image if available
      let imageUrl = "";
      if (entry.media$thumbnail) {
        imageUrl = entry.media$thumbnail.url;
      } else if (entry.content?.$t) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = entry.content.$t;
        const firstImg = tempDiv.querySelector("img");
        imageUrl = firstImg?.src || "";
      }

      return {
        id: entry.id?.$t || `json-${index}`,
        title: entry.title?.$t || "",
        url: link,
        published: entry.published?.$t || "",
        updated: entry.updated?.$t || "",
        content: entry.content?.$t || entry.summary?.$t || "",
        author: {
          id: entry.author?.[0]?.uri?.$t || "json-author",
          displayName: entry.author?.[0]?.name?.$t || "Blog Author",
          url: entry.author?.[0]?.uri?.$t || blogUrl,
        },
        images: imageUrl ? [{ url: imageUrl }] : undefined,
        labels: entry.category?.map((cat: any) => cat.term) || [],
      };
    });
  } catch (error) {
    console.error("Error fetching Blogger posts via JSON feed:", error);
    return [];
  }
};

// Method 4: Proxy Server
export const fetchViaProxyServer = async (
  proxyUrl: string,
  blogId: string,
  page = 1,
  perPage = 10,
  labelFilter?: string,
): Promise<{ posts: BloggerPost[]; totalPages: number }> => {
  try {
    let url = `${proxyUrl}?blogId=${blogId}&page=${page}&perPage=${perPage}`;

    if (labelFilter) {
      url += `&label=${encodeURIComponent(labelFilter)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Proxy server error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Blogger posts via proxy server:", error);
    return { posts: [], totalPages: 0 };
  }
};

// Method 5: Supabase Edge Function
export const fetchViaEdgeFunction = async (
  supabaseClient: any,
  blogId: string,
  apiKey: string,
  page = 1,
  perPage = 10,
  labelFilter?: string,
): Promise<{ posts: BloggerPost[]; totalPages: number }> => {
  try {
    const { data, error } = await supabaseClient.functions.invoke(
      "supabase-functions-blogger-fetch",
      {
        body: {
          blogId,
          apiKey,
          page,
          perPage,
          labelFilter,
        },
      },
    );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching Blogger posts via edge function:", error);
    return { posts: [], totalPages: 0 };
  }
};
