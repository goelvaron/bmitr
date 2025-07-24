import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("📱 [SEND-SMS] Request method:", req.method);
    console.log(
      "📱 [SEND-SMS] Request headers:",
      Object.fromEntries(req.headers.entries()),
    );

    let requestBody = {};

    // Check if request has a body
    const contentType = req.headers.get("content-type");
    console.log("📱 [SEND-SMS] Content-Type:", contentType);

    if (contentType && contentType.includes("application/json")) {
      try {
        const bodyText = await req.text();
        console.log("📱 [SEND-SMS] Raw request body:", bodyText);

        if (bodyText.trim()) {
          requestBody = JSON.parse(bodyText);
          console.log("📱 [SEND-SMS] Parsed request body:", requestBody);
        } else {
          console.log("📱 [SEND-SMS] Empty request body, using defaults");
        }
      } catch (parseError) {
        console.error(
          "📱 [SEND-SMS] Failed to parse request body:",
          parseError,
        );
        return new Response(
          JSON.stringify({
            success: false,
            message: "Invalid JSON in request body",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    } else {
      console.log("📱 [SEND-SMS] No JSON content-type, using defaults");
    }

    const { phone, templateName } = requestBody;
    const finalTemplateName = templateName || "Login OTP BHMITRA"; // Use provided template or fallback
    const senderId = "BMITR";
    console.log("📱 [SEND-SMS] Extracted phone:", phone);
    console.log("📱 [SEND-SMS] Using templateName:", finalTemplateName);
    console.log("📱 [SEND-SMS] Using senderId:", senderId);

    if (!phone) {
      console.error("📱 [SEND-SMS] Missing required fields - phone:", !!phone);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Phone number is required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get 2Factor API key from environment
    console.log(
      "📱 [SEND-SMS] Checking for TWOFACTOR_API_KEY environment variable...",
    );

    const twoFactorApiKey = Deno.env.get("TWOFACTOR_API_KEY");
    console.log("📱 [SEND-SMS] TWOFACTOR_API_KEY exists:", !!twoFactorApiKey);

    if (!twoFactorApiKey) {
      console.error("📱 [SEND-SMS] TWOFACTOR_API_KEY not found in environment");
      return new Response(
        JSON.stringify({
          success: false,
          message: "OTP service not configured - TWOFACTOR_API_KEY missing",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Format phone number for 2Factor API (remove + sign)
    const formattedPhone = phone.startsWith("+") ? phone.substring(1) : phone;
    console.log("📱 [SEND-SMS] Original phone:", phone);
    console.log("📱 [SEND-SMS] Formatted phone:", formattedPhone);

    // Call 2Factor API
    const apiUrl = `https://2factor.in/API/V1/${twoFactorApiKey}/SMS/${formattedPhone}/AUTOGEN/${encodeURIComponent(finalTemplateName)}`;

    console.log(
      "📱 [SEND-SMS] Calling 2Factor API:",
      apiUrl.replace(twoFactorApiKey, "[REDACTED]"),
    );

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "📱 [SEND-SMS] 2Factor API request failed:",
        response.status,
        response.statusText,
        errorText,
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to send OTP",
          debug: {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let result;
    try {
      result = await response.json();
      console.log("📱 [SEND-SMS] 2Factor API response:", result);
    } catch (jsonError) {
      console.error(
        "📱 [SEND-SMS] Failed to parse 2Factor API response as JSON:",
        jsonError,
      );
      const responseText = await response.text();
      console.error("📱 [SEND-SMS] Raw response:", responseText);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid response from OTP service",
          debug: {
            rawResponse: responseText,
            parseError: jsonError.message,
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (result.Status === "Success") {
      console.log(
        "📱 [SEND-SMS] OTP sent successfully, session ID:",
        result.Details,
      );
      return new Response(
        JSON.stringify({
          success: true,
          message: "OTP sent successfully",
          sessionId: result.Details,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } else {
      console.error("📱 [SEND-SMS] 2Factor API returned error:", result);
      return new Response(
        JSON.stringify({
          success: false,
          message: result.Details || "Failed to send OTP",
          debug: {
            apiResponse: result,
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("Error in send-sms function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
