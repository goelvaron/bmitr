// Simple test function to verify Edge Functions are working

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  // Handle CORS preflight request
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
    // Return a simple test response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Edge function is working correctly",
        timestamp: new Date().toISOString(),
        environment: {
          availableVars: Object.keys(Deno.env.toObject()).filter(
            (key) => !key.includes("KEY") && !key.includes("SECRET"),
          ),
        },
      }),
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 500,
    });
  }
});
