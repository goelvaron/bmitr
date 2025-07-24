// Supabase Edge Function to fetch Blogger posts
// This helps avoid CORS issues and keeps API keys secure

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface BloggerPost {
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

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
      status: 200,
    });
  }

  try {
    const {
      blogId,
      apiKey,
      page = 1,
      perPage = 10,
      labelFilter,
      postId,
    } = await req.json();

    if (!blogId || !apiKey) {
      throw new Error("Missing required parameters: blogId and apiKey");
    }

    const BLOGGER_API_URL = "https://www.googleapis.com/blogger/v3/blogs";

    // Handle single post request
    if (postId) {
      const url = `${BLOGGER_API_URL}/${blogId}/posts/${postId}?key=${apiKey}&fetchImages=true`;

      console.log(`Fetching single post with ID: ${postId}`);
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Blogger API error: ${response.status} - ${errorText}`);
      }

      const post = await response.json();

      return new Response(JSON.stringify({ post }), {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        status: 200,
      });
    }

    // Handle posts list request
    const startIndex = (page - 1) * perPage + 1;

    let url = `${BLOGGER_API_URL}/${blogId}/posts?key=${apiKey}&maxResults=${perPage}&startIndex=${startIndex}&fetchImages=true&fetchBodies=true`;

    if (labelFilter) {
      url += `&labels=${encodeURIComponent(labelFilter)}`;
    }

    console.log(`Fetching posts list with URL: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Blogger API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const posts = data.items || [];

    // Calculate total pages based on totalItems
    const totalItems = data.totalItems || 0;
    const totalPages = Math.ceil(totalItems / perPage);

    return new Response(JSON.stringify({ posts, totalPages }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 400,
    });
  }
});
